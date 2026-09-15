import "server-only";
import { randomInt } from "node:crypto";
import { jazzCashConfig, type JazzCashConfig } from "@/lib/integrations/config";
import { normalizePhone, tryNormalizePhone } from "@/lib/integrations/phone";
import { signFields, verifySecureHash } from "./secureHash";
import {
  statusFromResponseCode,
  type JazzCashApiResult,
  type JazzCashCallbackResult,
  type JazzCashCheckoutRequest,
  type JazzCashCheckoutResponse,
  type JazzCashFields,
  type JazzCashWalletRequest,
} from "./types";

/**
 * JazzCash HTTP client.
 *
 * Three flows are covered, which is everything a gym needs:
 *   - `buildCheckout`  — hosted page (card or wallet), the member pays on JazzCash;
 *   - `chargeWallet`   — server-to-server charge against a JazzCash mobile account;
 *   - `inquire`        — authoritative status lookup, used by the callback and by polling.
 *
 * Every call fails soft: a network error or an unconfigured merchant comes back
 * as a `JazzCashApiResult` with `ok: false` rather than an exception, because
 * the UI always needs something to show the owner.
 */

/** JazzCash timestamps are in Pakistan Standard Time regardless of server TZ. */
const JAZZCASH_TIME_ZONE = process.env.JAZZCASH_TIMEZONE ?? "Asia/Karachi";

const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.JAZZCASH_TIMEOUT_MS ?? "20000", 10);

export class JazzCashNotConfiguredError extends Error {
  readonly missing: string[];
  constructor(missing: string[]) {
    super(`JazzCash is not configured. Missing: ${missing.join(", ")}`);
    this.name = "JazzCashNotConfiguredError";
    this.missing = missing;
  }
}

function assertConfigured(config: JazzCashConfig): void {
  if (!config.configured) throw new JazzCashNotConfiguredError(config.missing);
}

/** yyyyMMddHHmmss in Pakistan time. */
export function jazzCashTimestamp(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAZZCASH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "00";
  // en-GB renders midnight as "24" in some ICU builds; normalise it.
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}${get("month")}${get("day")}${hour}${get("minute")}${get("second")}`;
}

/**
 * Transaction reference. JazzCash requires it to be unique per merchant and
 * caps it at 20 characters, so: "T" + 14-digit stamp + 5 random digits.
 */
export function generateTxnRefNo(date: Date = new Date()): string {
  return `T${jazzCashTimestamp(date)}${String(randomInt(0, 100000)).padStart(5, "0")}`;
}

/** Rupees -> paisa, as an integer string. JazzCash rejects decimal amounts. */
export function toPaisa(amountInRupees: number): string {
  const paisa = Math.round(Number(amountInRupees) * 100);
  if (!Number.isFinite(paisa) || paisa <= 0) {
    throw new RangeError(`Invalid JazzCash amount: ${amountInRupees}`);
  }
  return String(paisa);
}

export function fromPaisa(amount: string | undefined): number | undefined {
  if (!amount) return undefined;
  const n = Number.parseInt(amount, 10);
  return Number.isFinite(n) ? n / 100 : undefined;
}

function metadataFields(metadata: string[] | undefined): JazzCashFields {
  const out: JazzCashFields = {};
  (metadata ?? []).slice(0, 5).forEach((value, index) => {
    if (value) out[`ppmpf_${index + 1}`] = String(value).slice(0, 100);
  });
  return out;
}

function baseFields(
  config: JazzCashConfig,
  request: JazzCashCheckoutRequest,
  txnRefNo: string,
  now: Date,
  expiry: Date
): JazzCashFields {
  return {
    pp_Version: "1.1",
    pp_Language: "EN",
    pp_MerchantID: config.merchantId,
    pp_SubMerchantID: "",
    pp_Password: config.password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: txnRefNo,
    pp_Amount: toPaisa(request.amount),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: jazzCashTimestamp(now),
    pp_BillReference: (request.billReference ?? "membership").slice(0, 20),
    pp_Description: request.description.slice(0, 100),
    pp_TxnExpiryDateTime: jazzCashTimestamp(expiry),
    pp_ReturnURL: request.returnUrl ?? config.returnUrl,
    ...metadataFields(request.metadata),
  };
}

/**
 * Builds the signed field set for JazzCash's hosted checkout page.
 *
 * Nothing is sent from the server here — the browser POSTs these fields to
 * JazzCash, which is what makes card payments work without PCI scope.
 */
export function buildCheckout(
  request: JazzCashCheckoutRequest,
  config: JazzCashConfig = jazzCashConfig()
): JazzCashCheckoutResponse {
  assertConfigured(config);

  const now = new Date();
  const expiry = new Date(now.getTime() + config.expiryMinutes * 60_000);
  const txnRefNo = generateTxnRefNo(now);

  const fields = signFields(
    {
      ...baseFields(config, request, txnRefNo, now, expiry),
      pp_Version: "2.0",
      pp_TxnType: "",
    },
    config.integritySalt
  );

  return {
    txnRefNo,
    action: config.checkoutUrl,
    fields,
    redirectUrl: `/api/jazzcash/redirect?ref=${encodeURIComponent(txnRefNo)}`,
    amount: request.amount,
    expiresAt: expiry.toISOString(),
  };
}

async function postForm(url: string, fields: JazzCashFields): Promise<{ ok: boolean; body: JazzCashFields; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(fields),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await response.text();
    let body: JazzCashFields;
    try {
      body = JSON.parse(text) as JazzCashFields;
    } catch {
      return { ok: false, body: { pp_ResponseMessage: text.slice(0, 500) }, error: `Unparseable response (HTTP ${response.status})` };
    }
    return { ok: response.ok, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, body: {}, error: message };
  } finally {
    clearTimeout(timer);
  }
}

function toApiResult(txnRefNo: string, raw: JazzCashFields, transportError?: string): JazzCashApiResult {
  const responseCode = raw.pp_ResponseCode ?? "";
  const responseMessage = transportError ?? raw.pp_ResponseMessage ?? "No response message from JazzCash";
  const status = transportError ? "pending" : statusFromResponseCode(responseCode);
  return {
    ok: !transportError && status === "successful",
    status,
    responseCode,
    responseMessage,
    txnRefNo: raw.pp_TxnRefNo ?? txnRefNo,
    amount: fromPaisa(raw.pp_Amount),
    retrievalReferenceNo: raw.pp_RetreivalReferenceNo ?? raw.pp_RetrievalReferenceNo,
    raw,
  };
}

/**
 * Charges a JazzCash mobile account directly. The member gets a push in the
 * JazzCash app (or an MPIN prompt) and the result comes back on this call —
 * except when JazzCash answers with a pending code, in which case poll
 * `inquire` until it settles.
 */
export async function chargeWallet(
  request: JazzCashWalletRequest,
  config: JazzCashConfig = jazzCashConfig()
): Promise<JazzCashApiResult & { txnRefNo: string }> {
  assertConfigured(config);

  const now = new Date();
  const expiry = new Date(now.getTime() + config.expiryMinutes * 60_000);
  const txnRefNo = generateTxnRefNo(now);
  const phone = normalizePhone(request.mobileNumber);
  const cnic = request.cnic.replace(/\D/g, "").slice(-6);

  if (cnic.length !== 6) {
    return {
      ok: false,
      status: "failed",
      responseCode: "VALIDATION",
      responseMessage: "JazzCash needs the last 6 digits of the member's CNIC.",
      txnRefNo,
      raw: {},
    };
  }

  const fields = signFields(
    {
      ...baseFields(config, request, txnRefNo, now, expiry),
      pp_TxnType: "MWALLET",
      pp_MobileNumber: phone.local,
      pp_CNIC: cnic,
    },
    config.integritySalt
  );

  const { body, error } = await postForm(config.mWalletUrl, fields);
  return { ...toApiResult(txnRefNo, body, error), txnRefNo };
}

/**
 * Authoritative status lookup. Always prefer this over the browser callback:
 * the callback can be replayed or dropped, the inquiry cannot.
 */
export async function inquire(
  txnRefNo: string,
  config: JazzCashConfig = jazzCashConfig()
): Promise<JazzCashApiResult> {
  assertConfigured(config);

  const fields = signFields(
    {
      pp_TxnRefNo: txnRefNo,
      pp_MerchantID: config.merchantId,
      pp_Password: config.password,
    },
    config.integritySalt
  );

  const { body, error } = await postForm(config.inquiryUrl, fields);
  const raw: JazzCashFields = { ...body };
  // The inquiry API reports the settled state under pp_Status/pp_PaymentResponseCode.
  if (!raw.pp_ResponseCode && raw.pp_PaymentResponseCode) raw.pp_ResponseCode = raw.pp_PaymentResponseCode;
  if (!raw.pp_ResponseMessage && raw.pp_PaymentResponseMessage) raw.pp_ResponseMessage = raw.pp_PaymentResponseMessage;
  return toApiResult(txnRefNo, raw, error);
}

/**
 * Validates and interprets what JazzCash posts back to the return URL.
 *
 * `signatureValid: false` means the payload must not be acted on — treat the
 * transaction as unknown and settle it with `inquire` instead.
 */
export function parseCallback(
  fields: JazzCashFields,
  config: JazzCashConfig = jazzCashConfig()
): JazzCashCallbackResult {
  const signatureValid = config.configured ? verifySecureHash(fields, config.integritySalt) : false;
  const result = toApiResult(fields.pp_TxnRefNo ?? "", fields);
  const metadata = [1, 2, 3, 4, 5]
    .map((i) => fields[`ppmpf_${i}`])
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  return {
    ...result,
    ok: signatureValid && result.ok,
    status: signatureValid ? result.status : "pending",
    signatureValid,
    billReference: fields.pp_BillReference,
    metadata,
  };
}

/** Helper for UI copy: a JazzCash payment link a member can open on their phone. */
export function checkoutPageUrl(txnRefNo: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/pay/${encodeURIComponent(txnRefNo)}`;
}

/** Fields that must never be written to the transaction store. */
const SECRET_FIELDS = ["pp_Password", "pp_SecureHash"] as const;

/** Strips the merchant password and hash before a field set is persisted. */
export function stripSecrets(fields: JazzCashFields): JazzCashFields {
  const out: JazzCashFields = { ...fields };
  for (const key of SECRET_FIELDS) delete out[key];
  return out;
}

/**
 * Re-signs a stored checkout so a payment link stays payable after a restart.
 *
 * The transaction reference is kept — it is the same payment — while the
 * timestamps are refreshed, because JazzCash rejects a transaction whose
 * `pp_TxnExpiryDateTime` has passed.
 */
export function signStoredCheckout(
  storedFields: JazzCashFields,
  config: JazzCashConfig = jazzCashConfig()
): { action: string; fields: JazzCashFields; expiresAt: string } {
  assertConfigured(config);
  const now = new Date();
  const expiry = new Date(now.getTime() + config.expiryMinutes * 60_000);

  const fields = signFields(
    {
      ...stripSecrets(storedFields),
      pp_MerchantID: config.merchantId,
      pp_Password: config.password,
      pp_TxnDateTime: jazzCashTimestamp(now),
      pp_TxnExpiryDateTime: jazzCashTimestamp(expiry),
    },
    config.integritySalt
  );

  return { action: config.checkoutUrl, fields, expiresAt: expiry.toISOString() };
}

export { jazzCashConfig };
export { tryNormalizePhone };

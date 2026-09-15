import { appBaseUrl, jazzCashConfig } from "@/lib/integrations/config";
import { inquire, parseCallback } from "@/lib/jazzcash/client";
import type { JazzCashFields } from "@/lib/jazzcash/types";
import { getTransaction, updateTransaction } from "@/lib/server/transactionStore";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/**
 * JazzCash return URL.
 *
 * JazzCash sends the member's browser back here with the result form-posted in
 * the body. Three things happen, in this order, and the order matters:
 *
 *   1. the `pp_SecureHash` is verified — an unsigned or mis-signed payload is
 *      never allowed to mark a payment as received;
 *   2. anything not clearly successful is re-checked with a server-to-server
 *      status inquiry, because the browser callback can be dropped, delayed or
 *      replayed while the inquiry cannot;
 *   3. only then is the transaction settled and the member's WhatsApp receipt
 *      sent (once — `receiptSentAt` guards against a double send on a reload).
 *
 * The member is then redirected to a human-readable result page.
 */

function resultRedirect(txnRefNo: string, status: string, message: string): Response {
  const url = new URL("/payments/result", appBaseUrl());
  url.searchParams.set("ref", txnRefNo);
  url.searchParams.set("status", status);
  if (message) url.searchParams.set("message", message.slice(0, 200));
  // 303 so the browser turns JazzCash's POST into a GET.
  return Response.redirect(url.toString(), 303);
}

async function readFields(request: Request): Promise<JazzCashFields> {
  const contentType = request.headers.get("content-type") ?? "";
  const fields: JazzCashFields = {};

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    for (const [key, value] of Object.entries(body)) fields[key] = String(value ?? "");
    return fields;
  }

  if (request.method === "GET") {
    new URL(request.url).searchParams.forEach((value, key) => {
      fields[key] = value;
    });
    return fields;
  }

  const form = new URLSearchParams(await request.text());
  form.forEach((value, key) => {
    fields[key] = value;
  });
  return fields;
}

async function handle(request: Request): Promise<Response> {
  const config = jazzCashConfig();
  const fields = await readFields(request);
  const txnRefNo = fields.pp_TxnRefNo ?? "";

  if (!txnRefNo) {
    return resultRedirect("", "failed", "JazzCash did not send a transaction reference.");
  }

  const callback = parseCallback(fields, config);

  if (!callback.signatureValid) {
    console.warn("[jazzcash] callback for %s failed signature verification", txnRefNo);
  }

  // Trust the inquiry over the callback for anything that is not a verified
  // success. This is what stops a forged "payment successful" POST.
  let status = callback.signatureValid && callback.status === "successful" ? "successful" : callback.status;
  let responseCode = callback.responseCode;
  let responseMessage = callback.responseMessage;

  if (config.configured && status !== "successful") {
    const verified = await inquire(txnRefNo, config);
    status = verified.status;
    responseCode = verified.responseCode || responseCode;
    responseMessage = verified.responseMessage || responseMessage;
  }

  const record = await updateTransaction(txnRefNo, {
    status,
    responseCode,
    responseMessage,
    retrievalReferenceNo: callback.retrievalReferenceNo,
  });

  if (status === "successful") {
    await sendReceiptOnce(txnRefNo);
  }

  const stored = record ?? (await getTransaction(txnRefNo));
  console.info("[jazzcash] %s settled as %s (%s)", txnRefNo, status, responseCode || "no code");

  return resultRedirect(
    txnRefNo,
    status,
    status === "successful" ? `Payment received${stored ? ` for ${stored.memberName ?? "member"}` : ""}.` : responseMessage
  );
}

/**
 * Sends the WhatsApp receipt for a settled payment, at most once.
 *
 * A failure here must never fail the callback — the money has already moved,
 * and the owner can always resend the receipt from the member's page.
 */
async function sendReceiptOnce(txnRefNo: string): Promise<void> {
  const record = await getTransaction(txnRefNo);
  if (!record || record.receiptSentAt || !record.memberPhone) return;

  try {
    const result = await sendWhatsAppMessage({
      to: record.memberPhone,
      kind: "payment_receipt",
      reference: txnRefNo,
      params: {
        memberName: record.memberName ?? "Member",
        gymName: process.env.NEXT_PUBLIC_GYM_NAME ?? "your gym",
        amount: `Rs. ${record.amount.toLocaleString("en-US")}`,
        paymentDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        paymentMethod: "JazzCash",
        receiptNo: txnRefNo,
      },
    });

    if (result.status === "sent" || result.status === "queued") {
      await updateTransaction(txnRefNo, { receiptSentAt: new Date().toISOString() });
    }
  } catch (error) {
    console.error("[jazzcash] receipt for %s could not be sent: %s", txnRefNo, error);
  }
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}

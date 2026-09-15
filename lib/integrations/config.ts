import "server-only";

/**
 * Single place where every integration reads its environment.
 *
 * The rule for this file: nothing throws at import time. A missing variable
 * downgrades an integration to `configured: false`, the app keeps working in
 * its offline/link mode, and `/settings` shows exactly what is missing. Drop
 * the variables into `.env.local` and the same code path goes live on the
 * next request — no code change, no rebuild of the integration layer.
 */

export type JazzCashEnvironment = "sandbox" | "live";
export type WhatsAppProviderName = "meta" | "twilio" | "link";

function str(name: string): string | undefined {
  const v = process.env[name];
  if (v === undefined) return undefined;
  const trimmed = v.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function bool(name: string, fallback: boolean): boolean {
  const v = str(name)?.toLowerCase();
  if (v === undefined) return fallback;
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function int(name: string, fallback: number): number {
  const v = str(name);
  if (v === undefined) return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Trailing-slash-free base URL used to build return/callback URLs. */
export function appBaseUrl(): string {
  const explicit = str("APP_BASE_URL") ?? str("NEXT_PUBLIC_APP_URL");
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = str("VERCEL_PROJECT_PRODUCTION_URL") ?? str("VERCEL_URL");
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return `http://localhost:${int("PORT", 3000)}`;
}

// ---------------------------------------------------------------- JazzCash

export interface JazzCashConfig {
  configured: boolean;
  missing: string[];
  environment: JazzCashEnvironment;
  merchantId: string;
  password: string;
  integritySalt: string;
  returnUrl: string;
  /** Minutes a generated checkout stays payable. */
  expiryMinutes: number;
  /** Hosted checkout (card + wallet) form post target. */
  checkoutUrl: string;
  /** Direct mobile-account (wallet) charge endpoint. */
  mWalletUrl: string;
  /** Transaction status inquiry endpoint. */
  inquiryUrl: string;
  /** Wallet refund endpoint. */
  refundUrl: string;
}

const JAZZCASH_HOSTS: Record<JazzCashEnvironment, string> = {
  sandbox: "https://sandbox.jazzcash.com.pk",
  live: "https://payments.jazzcash.com.pk",
};

export function jazzCashConfig(): JazzCashConfig {
  const merchantId = str("JAZZCASH_MERCHANT_ID") ?? "";
  const password = str("JAZZCASH_PASSWORD") ?? "";
  const integritySalt = str("JAZZCASH_INTEGRITY_SALT") ?? "";

  const missing: string[] = [];
  if (!merchantId) missing.push("JAZZCASH_MERCHANT_ID");
  if (!password) missing.push("JAZZCASH_PASSWORD");
  if (!integritySalt) missing.push("JAZZCASH_INTEGRITY_SALT");

  const rawEnv = (str("JAZZCASH_ENV") ?? "sandbox").toLowerCase();
  const environment: JazzCashEnvironment = rawEnv === "live" || rawEnv === "production" ? "live" : "sandbox";
  const host = JAZZCASH_HOSTS[environment];

  return {
    configured: missing.length === 0,
    missing,
    environment,
    merchantId,
    password,
    integritySalt,
    returnUrl: str("JAZZCASH_RETURN_URL") ?? `${appBaseUrl()}/api/jazzcash/callback`,
    expiryMinutes: int("JAZZCASH_EXPIRY_MINUTES", 60),
    checkoutUrl: `${host}/CustomerPortal/transactionmanagement/merchantform/`,
    mWalletUrl: `${host}/ApplicationAPI/API/2.0/Purchase/DoMWALLETTransaction`,
    inquiryUrl: `${host}/ApplicationAPI/API/PaymentInquiry/Inquire`,
    refundUrl: `${host}/ApplicationAPI/API/2.0/Refund/DoMWALLETRefund`,
  };
}

// ---------------------------------------------------------------- WhatsApp

export interface MetaWhatsAppConfig {
  configured: boolean;
  missing: string[];
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  apiVersion: string;
  graphBaseUrl: string;
  /** Shared secret echoed back during webhook verification. */
  verifyToken?: string;
  /** App secret used to check the X-Hub-Signature-256 header. */
  appSecret?: string;
  /** Template names, overridable so a gym can use its own approved templates. */
  templates: {
    reminder?: string;
    receipt?: string;
    welcome?: string;
    language: string;
  };
}

export interface TwilioWhatsAppConfig {
  configured: boolean;
  missing: string[];
  accountSid: string;
  authToken: string;
  from: string;
  baseUrl: string;
  /** Optional messaging service SID; takes priority over `from` when set. */
  messagingServiceSid?: string;
}

export interface WhatsAppConfig {
  /** The provider that will actually be used for the next send. */
  provider: WhatsAppProviderName;
  /** True when a provider that delivers server-side is available. */
  configured: boolean;
  /** Set when the operator pinned a provider that is not fully configured. */
  forcedProviderUnavailable?: WhatsAppProviderName;
  missing: string[];
  meta: MetaWhatsAppConfig;
  twilio: TwilioWhatsAppConfig;
  /** Send real messages, or log them and report success (useful in demos). */
  dryRun: boolean;
}

function metaConfig(): MetaWhatsAppConfig {
  const accessToken = str("WHATSAPP_ACCESS_TOKEN") ?? "";
  const phoneNumberId = str("WHATSAPP_PHONE_NUMBER_ID") ?? "";
  const missing: string[] = [];
  if (!accessToken) missing.push("WHATSAPP_ACCESS_TOKEN");
  if (!phoneNumberId) missing.push("WHATSAPP_PHONE_NUMBER_ID");
  const apiVersion = str("WHATSAPP_API_VERSION") ?? "v21.0";
  return {
    configured: missing.length === 0,
    missing,
    accessToken,
    phoneNumberId,
    businessAccountId: str("WHATSAPP_BUSINESS_ACCOUNT_ID"),
    apiVersion,
    graphBaseUrl: str("WHATSAPP_GRAPH_BASE_URL") ?? "https://graph.facebook.com",
    verifyToken: str("WHATSAPP_VERIFY_TOKEN"),
    appSecret: str("WHATSAPP_APP_SECRET"),
    templates: {
      reminder: str("WHATSAPP_TEMPLATE_REMINDER"),
      receipt: str("WHATSAPP_TEMPLATE_RECEIPT"),
      welcome: str("WHATSAPP_TEMPLATE_WELCOME"),
      language: str("WHATSAPP_TEMPLATE_LANGUAGE") ?? "en",
    },
  };
}

function twilioConfig(): TwilioWhatsAppConfig {
  const accountSid = str("TWILIO_ACCOUNT_SID") ?? "";
  const authToken = str("TWILIO_AUTH_TOKEN") ?? "";
  const messagingServiceSid = str("TWILIO_MESSAGING_SERVICE_SID");
  const from = str("TWILIO_WHATSAPP_FROM") ?? "";
  const missing: string[] = [];
  if (!accountSid) missing.push("TWILIO_ACCOUNT_SID");
  if (!authToken) missing.push("TWILIO_AUTH_TOKEN");
  if (!from && !messagingServiceSid) missing.push("TWILIO_WHATSAPP_FROM");
  return {
    configured: missing.length === 0,
    missing,
    accountSid,
    authToken,
    from,
    messagingServiceSid,
    baseUrl: str("TWILIO_API_BASE_URL") ?? "https://api.twilio.com",
  };
}

export function whatsAppConfig(): WhatsAppConfig {
  const meta = metaConfig();
  const twilio = twilioConfig();
  const dryRun = bool("WHATSAPP_DRY_RUN", false);

  const forced = str("WHATSAPP_PROVIDER")?.toLowerCase() as WhatsAppProviderName | undefined;

  const pick = (): { provider: WhatsAppProviderName; forcedProviderUnavailable?: WhatsAppProviderName } => {
    if (forced === "link") return { provider: "link" };
    if (forced === "meta") {
      return meta.configured ? { provider: "meta" } : { provider: "link", forcedProviderUnavailable: "meta" };
    }
    if (forced === "twilio") {
      return twilio.configured ? { provider: "twilio" } : { provider: "link", forcedProviderUnavailable: "twilio" };
    }
    // No explicit choice: use whichever is fully configured, Meta first.
    if (meta.configured) return { provider: "meta" };
    if (twilio.configured) return { provider: "twilio" };
    return { provider: "link" };
  };

  const { provider, forcedProviderUnavailable } = pick();
  const missing =
    provider === "link"
      ? forcedProviderUnavailable === "twilio"
        ? twilio.missing
        : forcedProviderUnavailable === "meta"
          ? meta.missing
          : meta.missing
      : [];

  return {
    provider,
    configured: provider !== "link",
    forcedProviderUnavailable,
    missing,
    meta,
    twilio,
    dryRun,
  };
}

// ---------------------------------------------------------------- Misc

/** Optional shared secret protecting the send/checkout API routes. */
export function apiSecret(): string | undefined {
  return str("GYMBOOK_API_SECRET");
}

export function persistenceDir(): string {
  return str("GYMBOOK_DATA_DIR") ?? ".data";
}

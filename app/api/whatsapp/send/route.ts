import { NextResponse } from "next/server";
import { checkApiSecret } from "@/lib/server/apiAuth";
import { sendWhatsAppBulk, sendWhatsAppMessage, whatsAppConfig } from "@/lib/whatsapp";
import type { MessageKind, MessageLanguage, SendMessageRequest } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

const VALID_KINDS: MessageKind[] = [
  "fee_reminder",
  "expiry_warning",
  "expired_notice",
  "payment_receipt",
  "payment_link",
  "welcome",
  "custom",
];

interface SendBody {
  to?: string;
  kind?: string;
  message?: string;
  language?: string;
  params?: Record<string, string>;
  reference?: string;
  /** Batch form — each entry takes the same shape as a single send. */
  messages?: SendBody[];
}

function toRequest(body: SendBody): SendMessageRequest | { error: string } {
  if (!body.to || typeof body.to !== "string") return { error: "'to' is required" };
  const kind = (body.kind ?? "custom") as MessageKind;
  if (!VALID_KINDS.includes(kind)) return { error: `Unknown kind '${body.kind}'` };
  if (kind === "custom" && !body.message?.trim()) {
    return { error: "'message' is required when kind is 'custom'" };
  }
  const language = body.language === "ur" ? "ur" : "en";
  return {
    to: body.to,
    kind,
    message: body.message,
    language: language as MessageLanguage,
    params: body.params,
    reference: body.reference,
  };
}

/**
 * Sends one message, or a batch when `messages` is present.
 *
 * The response always carries a `waLink`, whichever provider ran: if the API
 * send fails, or no provider is configured at all, the caller can still open
 * WhatsApp with the text pre-filled. That is what makes this endpoint safe to
 * call from the UI unconditionally.
 */
export async function POST(request: Request) {
  const auth = checkApiSecret(request);
  if (!auth.ok) return auth.response;

  let body: SendBody;
  try {
    body = (await request.json()) as SendBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const config = whatsAppConfig();

  if (Array.isArray(body.messages)) {
    const parsed = body.messages.map(toRequest);
    const invalid = parsed.findIndex((p) => "error" in p);
    if (invalid >= 0) {
      return NextResponse.json({ error: `messages[${invalid}]: ${(parsed[invalid] as { error: string }).error}` }, { status: 400 });
    }
    const results = await sendWhatsAppBulk(parsed as SendMessageRequest[], 4, config);
    return NextResponse.json({
      provider: config.provider,
      configured: config.configured,
      sent: results.filter((r) => r.status === "sent" || r.status === "queued").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  }

  const parsed = toRequest(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const result = await sendWhatsAppMessage(parsed, config);
  return NextResponse.json(
    { provider: config.provider, configured: config.configured, result },
    { status: result.status === "failed" ? 502 : 200 }
  );
}

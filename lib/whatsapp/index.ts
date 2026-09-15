import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { whatsAppConfig, type WhatsAppConfig } from "@/lib/integrations/config";
import { tryNormalizePhone } from "@/lib/integrations/phone";
import { createLinkProvider } from "./providers/link";
import { createMetaProvider } from "./providers/meta";
import { createTwilioProvider } from "./providers/twilio";
import { applyPlaceholders, renderMessage, waMeLink } from "./templates";
import type {
  InboundMessageEvent,
  SendMessageRequest,
  SendMessageResult,
  WhatsAppProvider,
} from "./types";

/**
 * The single entry point for sending WhatsApp messages.
 *
 * Provider selection is entirely environment-driven (see
 * `lib/integrations/config.ts`): set the Meta or Twilio variables and the very
 * next send goes out over the API; set nothing and the same call returns a
 * ready-to-tap wa.me link. Callers never branch on which one is active.
 */

export function resolveProvider(config: WhatsAppConfig = whatsAppConfig()): WhatsAppProvider {
  switch (config.provider) {
    case "meta":
      return createMetaProvider(config.meta);
    case "twilio":
      return createTwilioProvider(config.twilio);
    default:
      return createLinkProvider();
  }
}

/** Renders the outgoing text: explicit message wins, otherwise the template. */
export function composeMessage(request: SendMessageRequest): string {
  if (request.message && request.message.trim().length > 0) {
    return applyPlaceholders(request.message, request.params ?? {});
  }
  if (request.kind === "custom") return "";
  return renderMessage(request.kind, request.params ?? {}, request.language ?? "en");
}

export async function sendWhatsAppMessage(
  request: SendMessageRequest,
  config: WhatsAppConfig = whatsAppConfig()
): Promise<SendMessageResult> {
  const phone = tryNormalizePhone(request.to);
  const message = composeMessage(request);

  if (!phone) {
    return {
      status: "failed",
      channel: config.provider,
      message,
      to: request.to,
      error: `"${request.to}" is not a valid Pakistani mobile number`,
      sentAt: new Date().toISOString(),
    };
  }

  if (!message.trim()) {
    return {
      status: "failed",
      channel: config.provider,
      message,
      to: phone.msisdn,
      error: "Message body is empty",
      sentAt: new Date().toISOString(),
    };
  }

  if (config.dryRun) {
    // Demo/staging mode: prove the wiring without spending a real message.
    return {
      status: "sent",
      channel: "dry-run",
      messageId: `dryrun_${Date.now()}`,
      message,
      to: phone.msisdn,
      waLink: waMeLink(phone.msisdn, message),
      sentAt: new Date().toISOString(),
    };
  }

  const result = await resolveProvider(config).send(phone.msisdn, message, request);

  // A provider outage must never lose the reminder: hand the owner the manual
  // link so the member still hears from the gym today.
  if (result.status === "failed" && !result.waLink) {
    result.waLink = waMeLink(phone.msisdn, message);
  }
  return result;
}

/** Sends to many members, capped in flight so a bulk run cannot hammer the API. */
export async function sendWhatsAppBulk(
  requests: SendMessageRequest[],
  concurrency = 4,
  config: WhatsAppConfig = whatsAppConfig()
): Promise<SendMessageResult[]> {
  const results: SendMessageResult[] = new Array(requests.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < requests.length) {
      const index = cursor++;
      results[index] = await sendWhatsAppMessage(requests[index], config);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, requests.length) }, worker));
  return results;
}

// ------------------------------------------------------------ webhook input

/**
 * Verifies Meta's `X-Hub-Signature-256` header.
 *
 * Meta signs the *raw* body, so the caller must pass the exact bytes it
 * received — re-serialising the parsed JSON changes the digest.
 */
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string | undefined): boolean {
  if (!appSecret) return false;
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header.slice("sha256=".length), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{ from?: string; id?: string; timestamp?: string; text?: { body?: string } }>;
        statuses?: Array<{ id?: string; status?: string; recipient_id?: string; timestamp?: string }>;
      };
    }>;
  }>;
}

/** Flattens a Cloud API webhook body into plain events. */
export function parseMetaWebhook(payload: unknown): InboundMessageEvent[] {
  const body = payload as MetaWebhookPayload;
  const events: InboundMessageEvent[] = [];

  for (const entry of body?.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        events.push({
          provider: "meta",
          from: message.from ?? "",
          text: message.text?.body,
          messageId: message.id,
          timestamp: message.timestamp
            ? new Date(Number(message.timestamp) * 1000).toISOString()
            : new Date().toISOString(),
        });
      }
      for (const status of change.value?.statuses ?? []) {
        events.push({
          provider: "meta",
          from: status.recipient_id ?? "",
          messageId: status.id,
          timestamp: status.timestamp
            ? new Date(Number(status.timestamp) * 1000).toISOString()
            : new Date().toISOString(),
          statusUpdate: { messageId: status.id ?? "", status: status.status ?? "unknown", recipient: status.recipient_id },
        });
      }
    }
  }
  return events;
}

/** Twilio posts form-encoded status callbacks and inbound messages. */
export function parseTwilioWebhook(form: URLSearchParams): InboundMessageEvent[] {
  const from = (form.get("From") ?? "").replace(/^whatsapp:\+?/, "");
  const messageStatus = form.get("MessageStatus") ?? form.get("SmsStatus");
  const sid = form.get("MessageSid") ?? form.get("SmsSid") ?? undefined;
  const timestamp = new Date().toISOString();

  if (messageStatus) {
    return [
      {
        provider: "twilio",
        from: (form.get("To") ?? "").replace(/^whatsapp:\+?/, ""),
        messageId: sid,
        timestamp,
        statusUpdate: { messageId: sid ?? "", status: messageStatus },
      },
    ];
  }

  const text = form.get("Body");
  if (!text && !from) return [];
  return [{ provider: "twilio", from, text: text ?? undefined, messageId: sid, timestamp }];
}

export { whatsAppConfig, waMeLink, renderMessage, applyPlaceholders };
export type { SendMessageRequest, SendMessageResult, InboundMessageEvent };

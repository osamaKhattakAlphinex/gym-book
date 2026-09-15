import "server-only";
import type { TwilioWhatsAppConfig } from "@/lib/integrations/config";
import type { SendMessageResult, WhatsAppProvider } from "../types";
import { waMeLink } from "../templates";

/**
 * Twilio WhatsApp provider.
 *
 * Twilio is the pragmatic choice for a gym that cannot get through Meta's
 * business verification: the sandbox works the same day. The API is
 * form-encoded and Basic-authenticated, so no SDK is needed.
 */

interface TwilioResponse {
  sid?: string;
  status?: string;
  message?: string;
  code?: number;
  more_info?: string;
}

/** Twilio treats "queued"/"accepted" as success; anything else on POST is not. */
const ACCEPTED_STATUSES = new Set(["queued", "accepted", "sending", "sent", "delivered"]);

export function createTwilioProvider(config: TwilioWhatsAppConfig, timeoutMs = 15_000): WhatsAppProvider {
  const endpoint = `${config.baseUrl.replace(/\/+$/, "")}/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
  const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");

  return {
    name: "twilio",
    async send(to, message): Promise<SendMessageResult> {
      const sentAt = new Date().toISOString();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const form = new URLSearchParams({ To: `whatsapp:+${to}`, Body: message });
      if (config.messagingServiceSid) form.set("MessagingServiceSid", config.messagingServiceSid);
      else form.set("From", config.from.startsWith("whatsapp:") ? config.from : `whatsapp:${config.from}`);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
          signal: controller.signal,
          cache: "no-store",
        });

        const body = (await response.json().catch(() => ({}))) as TwilioResponse;

        if (!response.ok || !body.sid || (body.status && !ACCEPTED_STATUSES.has(body.status))) {
          return {
            status: "failed",
            channel: "twilio",
            message,
            to,
            waLink: waMeLink(to, message),
            error: body.message ?? `Twilio returned HTTP ${response.status}`,
            raw: body,
            sentAt,
          };
        }

        return {
          status: body.status === "delivered" || body.status === "sent" ? "sent" : "queued",
          channel: "twilio",
          messageId: body.sid,
          message,
          to,
          raw: body,
          sentAt,
        };
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return {
          status: "failed",
          channel: "twilio",
          message,
          to,
          waLink: waMeLink(to, message),
          error: detail === "The operation was aborted." ? "Twilio timed out" : detail,
          sentAt,
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

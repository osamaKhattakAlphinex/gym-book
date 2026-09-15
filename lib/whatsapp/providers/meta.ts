import "server-only";
import type { MetaWhatsAppConfig } from "@/lib/integrations/config";
import type { SendMessageRequest, SendMessageResult, WhatsAppProvider } from "../types";
import { waMeLink } from "../templates";

/**
 * WhatsApp Cloud API (Meta) provider.
 *
 * Free-form text only reaches a member inside the 24-hour customer service
 * window — outside it, Meta requires a pre-approved template. Gym reminders
 * are almost always outside that window (the member has not messaged first),
 * so when a template name is configured for the message kind we send the
 * template; otherwise we send text and let Meta decide.
 *
 * Template names come from env (`WHATSAPP_TEMPLATE_REMINDER` etc.) because
 * every WhatsApp Business Account approves its own.
 */

const TEMPLATE_FOR_KIND: Partial<Record<SendMessageRequest["kind"], keyof MetaWhatsAppConfig["templates"]>> = {
  fee_reminder: "reminder",
  expiry_warning: "reminder",
  expired_notice: "reminder",
  payment_receipt: "receipt",
  welcome: "welcome",
};

interface MetaSendResponse {
  messages?: Array<{ id: string; message_status?: string }>;
  error?: { message: string; type?: string; code?: number; error_subcode?: number; fbtrace_id?: string };
}

export function createMetaProvider(config: MetaWhatsAppConfig, timeoutMs = 15_000): WhatsAppProvider {
  const endpoint = `${config.graphBaseUrl.replace(/\/+$/, "")}/${config.apiVersion}/${config.phoneNumberId}/messages`;

  function buildBody(to: string, message: string, request: SendMessageRequest): Record<string, unknown> {
    const templateKey = TEMPLATE_FOR_KIND[request.kind];
    const templateName = templateKey ? config.templates[templateKey] : undefined;

    if (typeof templateName === "string" && templateName.length > 0) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: config.templates.language },
          components: [
            {
              type: "body",
              // Approved templates are positional: {{1}} name, {{2}} gym,
              // {{3}} date, {{4}} amount. Empty strings keep the positions aligned.
              parameters: [
                request.params?.memberName ?? "",
                request.params?.gymName ?? "",
                request.params?.expiryDate ?? "",
                request.params?.amount ?? "",
              ].map((text) => ({ type: "text", text: String(text) })),
            },
          ],
        },
      };
    }

    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: true, body: message },
    };
  }

  return {
    name: "meta",
    async send(to, message, request): Promise<SendMessageResult> {
      const sentAt = new Date().toISOString();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildBody(to, message, request)),
          signal: controller.signal,
          cache: "no-store",
        });

        const body = (await response.json().catch(() => ({}))) as MetaSendResponse;

        if (!response.ok || body.error) {
          return {
            status: "failed",
            channel: "meta",
            message,
            to,
            waLink: waMeLink(to, message),
            error: body.error?.message ?? `WhatsApp Cloud API returned HTTP ${response.status}`,
            raw: body,
            sentAt,
          };
        }

        const messageId = body.messages?.[0]?.id;
        return {
          // Meta acknowledges receipt, not delivery; delivery arrives later on
          // the webhook, so "sent" is the honest status here.
          status: "sent",
          channel: "meta",
          messageId,
          message,
          to,
          raw: body,
          sentAt,
        };
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return {
          status: "failed",
          channel: "meta",
          message,
          to,
          waLink: waMeLink(to, message),
          error: detail === "The operation was aborted." ? "WhatsApp Cloud API timed out" : detail,
          sentAt,
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

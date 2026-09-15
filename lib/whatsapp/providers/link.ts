import type { SendMessageResult, WhatsAppProvider } from "../types";
import { waMeLink } from "../templates";

/**
 * The zero-configuration provider, and the one the spec calls "the pragmatic
 * WhatsApp trick for today": build a wa.me link with the message pre-filled and
 * let the owner tap send.
 *
 * It is a real fallback, not a stub. With no API account the gym still gets
 * every reminder and receipt, in the right words, addressed to the right
 * number — the owner just presses the last button. Status is "manual" so the
 * UI can say so honestly rather than claiming a delivery that did not happen.
 */
export function createLinkProvider(): WhatsAppProvider {
  return {
    name: "link",
    async send(to, message): Promise<SendMessageResult> {
      return {
        status: "manual",
        channel: "link",
        message,
        to,
        waLink: waMeLink(to, message),
        sentAt: new Date().toISOString(),
      };
    },
  };
}

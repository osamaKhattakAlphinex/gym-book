/**
 * WhatsApp messaging contracts.
 *
 * Isomorphic — client components import `MessageKind` and `SendMessageResult`
 * to render the reminder sheet, so nothing here may touch node APIs.
 */

export type MessageKind =
  | "fee_reminder"
  | "expiry_warning"
  | "expired_notice"
  | "payment_receipt"
  | "payment_link"
  | "welcome"
  | "custom";

export type MessageLanguage = "en" | "ur";

/** Which transport actually delivered (or will deliver) the message. */
export type DeliveryChannel = "meta" | "twilio" | "link" | "dry-run";

export type DeliveryStatus = "sent" | "queued" | "failed" | "manual";

export interface MessageParams {
  memberName: string;
  gymName: string;
  /** Formatted for humans, e.g. "Mar 14, 2026". */
  expiryDate?: string;
  amount?: string;
  plan?: string;
  receiptNo?: string;
  paymentDate?: string;
  paymentMethod?: string;
  payUrl?: string;
  ownerPhone?: string;
}

export interface SendMessageRequest {
  to: string;
  kind: MessageKind;
  /** Overrides the rendered template. Required when `kind` is "custom". */
  message?: string;
  params?: Partial<MessageParams>;
  language?: MessageLanguage;
  /** Correlates the send with a member/payment in logs. */
  reference?: string;
}

export interface SendMessageResult {
  status: DeliveryStatus;
  channel: DeliveryChannel;
  /** Provider-side id, when the provider gives one. */
  messageId?: string;
  /** The text that was sent (or that the owner is about to send by hand). */
  message: string;
  to: string;
  /**
   * Present whenever the owner has to finish the send themselves — always for
   * the `link` channel, and as a fallback when a provider call fails.
   */
  waLink?: string;
  error?: string;
  /** Raw provider payload, kept for the delivery log. */
  raw?: unknown;
  sentAt: string;
}

export interface WhatsAppProvider {
  readonly name: DeliveryChannel;
  send(to: string, message: string, request: SendMessageRequest): Promise<SendMessageResult>;
}

/** Inbound webhook event, flattened from whichever provider sent it. */
export interface InboundMessageEvent {
  provider: DeliveryChannel;
  from: string;
  text?: string;
  messageId?: string;
  timestamp: string;
  /** Status callbacks ("delivered", "read", "failed") rather than a new message. */
  statusUpdate?: { messageId: string; status: string; recipient?: string };
}

/**
 * Message copy.
 *
 * Two languages, both written the way a Pakistani gym owner actually texts:
 * "en" is plain English, "ur" is Roman Urdu (not Nastaliq — members type and
 * read Roman Urdu on WhatsApp, and it renders on every cheap Android).
 *
 * The tone is deliberate. The whole point of the product is that nobody gets
 * asked about money in front of other people, so reminders stay warm, never
 * accusatory, and always end with a way out (a link or "let me know").
 *
 * Isomorphic — the reminder sheet previews these client-side.
 */

import type { MessageKind, MessageLanguage, MessageParams } from "./types";

export const MESSAGE_KINDS: MessageKind[] = [
  "fee_reminder",
  "expiry_warning",
  "expired_notice",
  "payment_receipt",
  "payment_link",
  "welcome",
  "custom",
];

export const MESSAGE_KIND_LABELS: Record<MessageKind, string> = {
  fee_reminder: "Fee reminder",
  expiry_warning: "Expiring soon",
  expired_notice: "Membership expired",
  payment_receipt: "Payment receipt",
  payment_link: "Payment link",
  welcome: "Welcome",
  custom: "Custom message",
};

function firstName(fullName: string): string {
  return (fullName ?? "").trim().split(/\s+/)[0] || "there";
}

type Renderer = (p: MessageParams) => string;

const EN: Record<Exclude<MessageKind, "custom">, Renderer> = {
  fee_reminder: (p) =>
    `Assalam-o-Alaikum ${firstName(p.memberName)},\n\n` +
    `This is a friendly reminder from ${p.gymName} — your membership fee${p.amount ? ` of ${p.amount}` : ""} is due${p.expiryDate ? ` on ${p.expiryDate}` : ""}.\n\n` +
    (p.payUrl ? `You can pay here: ${p.payUrl}\n\n` : "") +
    `You can also pay in cash at the gym. Jazakallah!`,

  expiry_warning: (p) =>
    `Hi ${firstName(p.memberName)},\n\n` +
    `Your ${p.gymName} membership${p.plan ? ` (${p.plan})` : ""} expires on ${p.expiryDate ?? "soon"}. ` +
    `Renew${p.amount ? ` for ${p.amount}` : ""} so your training doesn't stop.\n\n` +
    (p.payUrl ? `Renew here: ${p.payUrl}\n\n` : "") +
    `See you at the gym!`,

  expired_notice: (p) =>
    `Hi ${firstName(p.memberName)},\n\n` +
    `Your ${p.gymName} membership expired on ${p.expiryDate ?? "recently"}. We've kept your spot — renew${p.amount ? ` for ${p.amount}` : ""} whenever you're ready.\n\n` +
    (p.payUrl ? `${p.payUrl}\n\n` : "") +
    `Any questions, just reply here.`,

  payment_receipt: (p) =>
    `*${p.gymName} — Payment Receipt*\n\n` +
    `Member: ${p.memberName}\n` +
    `Amount: ${p.amount ?? "-"}\n` +
    `Date: ${p.paymentDate ?? "-"}\n` +
    (p.paymentMethod ? `Method: ${p.paymentMethod}\n` : "") +
    (p.plan ? `Plan: ${p.plan}\n` : "") +
    (p.expiryDate ? `Valid until: ${p.expiryDate}\n` : "") +
    (p.receiptNo ? `Receipt #: ${p.receiptNo}\n` : "") +
    `\nThank you! Keep this message as your receipt.`,

  payment_link: (p) =>
    `Hi ${firstName(p.memberName)},\n\n` +
    `Here is your ${p.gymName} payment link${p.amount ? ` for ${p.amount}` : ""}:\n${p.payUrl ?? ""}\n\n` +
    `You can pay with JazzCash, Easypaisa, Raast or a debit/credit card. The link expires in a little while, so please use it soon.`,

  welcome: (p) =>
    `Welcome to ${p.gymName}, ${firstName(p.memberName)}! 💪\n\n` +
    (p.plan ? `Plan: ${p.plan}\n` : "") +
    (p.expiryDate ? `Valid until: ${p.expiryDate}\n` : "") +
    `\nWe'll send your fee reminders and receipts right here on WhatsApp. ` +
    (p.ownerPhone ? `Any questions, call ${p.ownerPhone}.` : `Any questions, just reply here.`),
};

const UR: Record<Exclude<MessageKind, "custom">, Renderer> = {
  fee_reminder: (p) =>
    `Assalam-o-Alaikum ${firstName(p.memberName)} bhai,\n\n` +
    `${p.gymName} ki taraf se yaad dehani — aap ki fees${p.amount ? ` (${p.amount})` : ""}${p.expiryDate ? ` ${p.expiryDate} tak` : ""} due hai.\n\n` +
    (p.payUrl ? `Online jama karwane ke liye: ${p.payUrl}\n\n` : "") +
    `Cash bhi gym par de saktay hain. Shukriya!`,

  expiry_warning: (p) =>
    `${firstName(p.memberName)} bhai,\n\n` +
    `Aap ki ${p.gymName} membership${p.plan ? ` (${p.plan})` : ""} ${p.expiryDate ?? "jald"} ko khatam ho rahi hai. ` +
    `${p.amount ? `${p.amount} ` : ""}renew karwa lein taake training na ruke.\n\n` +
    (p.payUrl ? `Yahan se: ${p.payUrl}\n\n` : "") +
    `Gym par milte hain!`,

  expired_notice: (p) =>
    `${firstName(p.memberName)} bhai,\n\n` +
    `Aap ki ${p.gymName} membership ${p.expiryDate ?? "abhi"} ko khatam ho chuki hai. Aap ki jagah mehfooz hai — jab suhulat ho renew karwa lein${p.amount ? ` (${p.amount})` : ""}.\n\n` +
    (p.payUrl ? `${p.payUrl}\n\n` : "") +
    `Koi sawal ho to isi par reply kar dein.`,

  payment_receipt: (p) =>
    `*${p.gymName} — Rasid*\n\n` +
    `Member: ${p.memberName}\n` +
    `Raqam: ${p.amount ?? "-"}\n` +
    `Tareekh: ${p.paymentDate ?? "-"}\n` +
    (p.paymentMethod ? `Zariya: ${p.paymentMethod}\n` : "") +
    (p.plan ? `Plan: ${p.plan}\n` : "") +
    (p.expiryDate ? `Mudat: ${p.expiryDate} tak\n` : "") +
    (p.receiptNo ? `Rasid #: ${p.receiptNo}\n` : "") +
    `\nShukriya! Yeh message aap ki rasid hai.`,

  payment_link: (p) =>
    `${firstName(p.memberName)} bhai,\n\n` +
    `${p.gymName} ki fees${p.amount ? ` (${p.amount})` : ""} jama karwane ka link:\n${p.payUrl ?? ""}\n\n` +
    `JazzCash, Easypaisa, Raast ya card se pay kar saktay hain. Link thori dair mein expire ho jaye ga.`,

  welcome: (p) =>
    `${p.gymName} mein khush aamdeed, ${firstName(p.memberName)}! 💪\n\n` +
    (p.plan ? `Plan: ${p.plan}\n` : "") +
    (p.expiryDate ? `Mudat: ${p.expiryDate} tak\n` : "") +
    `\nFees ki yaad dehani aur rasid isi WhatsApp par milay gi. ` +
    (p.ownerPhone ? `Koi sawal ho to ${p.ownerPhone} par call karein.` : `Koi sawal ho to reply kar dein.`),
};

const DEFAULT_PARAMS: MessageParams = { memberName: "Member", gymName: "the gym" };

export function renderMessage(
  kind: MessageKind,
  params: Partial<MessageParams>,
  language: MessageLanguage = "en"
): string {
  if (kind === "custom") return "";
  const table = language === "ur" ? UR : EN;
  return table[kind]({ ...DEFAULT_PARAMS, ...params });
}

/**
 * Substitutes the {name} / {date} / {amount} placeholders used by the
 * owner-editable template in Settings.
 */
export function applyPlaceholders(template: string, params: Partial<MessageParams>): string {
  return template
    .replace(/\{name\}/g, params.memberName ?? "")
    .replace(/\{firstName\}/g, firstName(params.memberName ?? ""))
    .replace(/\{gym\}/g, params.gymName ?? "")
    .replace(/\{date\}/g, params.expiryDate ?? "")
    .replace(/\{amount\}/g, params.amount ?? "")
    .replace(/\{plan\}/g, params.plan ?? "")
    .replace(/\{link\}/g, params.payUrl ?? "");
}

/**
 * The zero-cost fallback from the spec: a wa.me deep link with the message
 * pre-filled. The owner taps once and hits send. Works with no API account,
 * no approval process and no per-message cost.
 */
export function waMeLink(msisdn: string, message: string): string {
  return `https://wa.me/${msisdn}?text=${encodeURIComponent(message)}`;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Link2, Loader2, MessageCircle, Phone, Send } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { useGym } from "@/lib/store";
import { formatCurrency, formatDate, getMembershipStatus } from "@/lib/utils";
import { renderMessage } from "@/lib/whatsapp/templates";
import { createJazzCashCheckout, fetchIntegrationStatus, sendWhatsApp, type IntegrationStatus } from "@/lib/client/messaging";
import type { MessageKind, MessageLanguage } from "@/lib/whatsapp/types";
import type { Member } from "@/lib/types";

/**
 * The reminder composer.
 *
 * This is the screen the whole product is about: the owner never has to ask
 * anyone for money out loud. It sends over the WhatsApp Business API when one
 * is configured, and falls back to a pre-filled wa.me link when it is not —
 * either way the member gets the same message, and the owner is told honestly
 * which of the two happened.
 *
 * Parent components key this by member?.id, so a fresh instance mounts
 * whenever the target member changes and this initializer re-runs.
 */
export function ReminderSheet({ member, open, onClose }: { member: Member | null; open: boolean; onClose: () => void }) {
  const { state, addActivity } = useGym();
  const { showToast } = useToast();

  const kind: MessageKind = useMemo(() => {
    if (!member) return "fee_reminder";
    const { status } = getMembershipStatus(member.expiryDate);
    if (status === "expired") return "expired_notice";
    if (status === "expiring") return "expiry_warning";
    return "fee_reminder";
  }, [member]);

  const [language, setLanguage] = useState<MessageLanguage>("en");
  /** Non-null once the owner types over the template; null means "follow the template". */
  const [draft, setDraft] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "send" | "link">(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);

  const params = useMemo(
    () =>
      member
        ? {
            memberName: member.name,
            gymName: state.settings.gymName,
            expiryDate: formatDate(member.expiryDate),
            amount: formatCurrency(Math.max(member.fee - member.amountPaid, 0) || member.fee),
            plan: member.plan,
            ownerPhone: state.settings.phone || undefined,
            payUrl: payUrl ?? undefined,
          }
        : null,
    [member, state.settings.gymName, state.settings.phone, payUrl]
  );

  // The template re-renders whenever the language or the pay link changes;
  // once the owner types over it, their wording wins until they switch
  // language or attach a link, which clears the draft on purpose.
  const composed = params ? renderMessage(kind, params, language) : "";
  const message = draft ?? composed;

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetchIntegrationStatus().then((status) => {
      if (alive) setIntegrations(status);
    });
    return () => {
      alive = false;
    };
  }, [open]);

  if (!member) return null;

  const provider = integrations?.whatsApp.provider ?? "link";
  const apiConfigured = integrations?.whatsApp.configured ?? false;
  const jazzCashReady = integrations?.jazzCash.configured ?? false;

  const attachPayLink = async () => {
    setBusy("link");
    const due = Math.max(member.fee - member.amountPaid, 0) || member.fee;
    const result = await createJazzCashCheckout({
      amount: due,
      description: `${member.plan} membership — ${member.name}`,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
    });
    setBusy(null);

    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    setPayUrl(result.checkout.payUrl);
    setDraft(null);
    showToast("JazzCash payment link attached.");
  };

  const sendWhatsAppMessage = async () => {
    setBusy("send");
    const result = await sendWhatsApp({
      to: member.phone,
      kind: "custom",
      message,
      language,
      reference: member.id,
    });
    setBusy(null);

    if (result.status === "sent" || result.status === "queued") {
      addActivity(`WhatsApp reminder sent to ${member.name}`, "reminder");
      setOutcome(`Sent to ${member.name} on WhatsApp.`);
      showToast(`Reminder sent to ${member.name}.`);
      window.setTimeout(onClose, 900);
      return;
    }

    // No API provider, or the provider failed: hand the owner the pre-filled
    // chat so the member still hears from the gym right now.
    if (result.waLink) {
      window.open(result.waLink, "_blank", "noopener,noreferrer");
      addActivity(`WhatsApp reminder opened for ${member.name}`, "reminder");
      setOutcome(
        result.error
          ? `WhatsApp API failed (${result.error}) — opened WhatsApp so you can send it yourself.`
          : "WhatsApp opened with the message ready. Tap send."
      );
      showToast("WhatsApp opened — tap send.");
      return;
    }

    setOutcome(result.error ?? "Could not send the reminder.");
    showToast(result.error ?? "Could not send the reminder.", "error");
  };

  const sendSms = () => {
    const number = member.phone.replace(/\s/g, "");
    window.location.href = `sms:${number}?&body=${encodeURIComponent(message)}`;
    addActivity(`SMS reminder sent to ${member.name}`, "reminder");
    showToast(`SMS prepared for ${member.name}.`);
  };

  const call = () => {
    window.location.href = `tel:${member.phone.replace(/\s/g, "")}`;
    addActivity(`Called ${member.name} about their membership`, "reminder");
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={`Remind ${member.name.split(" ")[0]}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-lg border border-[var(--gym-border)] p-0.5">
            {(["en", "ur"] as MessageLanguage[]).map((code) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code);
                  setDraft(null);
                }}
                className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                  language === code ? "bg-[var(--gym-accent)] text-black" : "text-[var(--gym-text-muted)]"
                }`}
              >
                {code === "en" ? "English" : "Roman Urdu"}
              </button>
            ))}
          </div>
          <ProviderBadge provider={provider} configured={apiConfigured} dryRun={integrations?.whatsApp.dryRun ?? false} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--gym-text-muted)]">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setDraft(e.target.value)}
            rows={7}
            className="w-full resize-none rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] p-3 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]"
          />
        </div>

        {jazzCashReady && !payUrl && (
          <button
            onClick={attachPayLink}
            disabled={busy !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-2.5 text-xs font-semibold text-[var(--gym-text)] transition active:scale-[0.98] disabled:opacity-50"
          >
            {busy === "link" ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
            Attach JazzCash payment link
          </button>
        )}
        {payUrl && (
          <p className="truncate rounded-lg border border-[var(--gym-accent)]/30 bg-[var(--gym-accent)]/10 px-3 py-2 text-xs text-[var(--gym-text-muted)]">
            Pay link: <span className="text-[var(--gym-accent)]">{payUrl}</span>
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={sendWhatsAppMessage}
            disabled={busy !== null}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-xs font-semibold text-[var(--gym-text)] transition active:scale-95 disabled:opacity-50"
          >
            {busy === "send" ? (
              <Loader2 size={20} className="animate-spin text-[var(--gym-success)]" />
            ) : (
              <MessageCircle size={20} className="text-[var(--gym-success)]" />
            )}
            WhatsApp
          </button>
          <button
            onClick={sendSms}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-xs font-semibold text-[var(--gym-text)] transition active:scale-95"
          >
            <Send size={20} className="text-[var(--gym-accent)]" />
            SMS
          </button>
          <button
            onClick={call}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3 text-xs font-semibold text-[var(--gym-text)] transition active:scale-95"
          >
            <Phone size={20} className="text-[var(--gym-warning)]" />
            Call
          </button>
        </div>

        {outcome && <p className="text-center text-sm font-semibold text-[var(--gym-success)]">{outcome}</p>}
      </div>
    </BottomSheet>
  );
}

function ProviderBadge({ provider, configured, dryRun }: { provider: string; configured: boolean; dryRun: boolean }) {
  const label = dryRun
    ? "Test mode"
    : provider === "meta"
      ? "WhatsApp API"
      : provider === "twilio"
        ? "Twilio"
        : "Manual send";
  return (
    <span
      title={
        configured
          ? "Messages are delivered automatically by the WhatsApp Business API."
          : "No WhatsApp API configured — WhatsApp opens with the message ready to send."
      }
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        configured
          ? "border-[var(--gym-success)]/40 bg-[var(--gym-success)]/10 text-[var(--gym-success)]"
          : "border-[var(--gym-border)] bg-[var(--gym-surface-2)] text-[var(--gym-text-muted)]"
      }`}
    >
      {label}
    </span>
  );
}

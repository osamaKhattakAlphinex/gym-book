"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, Send, Smartphone } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useToast } from "@/components/ui/Toast";
import { useGym } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  createJazzCashCheckout,
  fetchIntegrationStatus,
  sendWhatsApp,
  submitJazzCashForm,
  type IntegrationStatus,
} from "@/lib/client/messaging";
import type { Member, PaymentMethod } from "@/lib/types";

type Mode = "link" | "wallet" | "checkout";

/**
 * Collecting a fee through JazzCash.
 *
 * Three ways in, because gyms collect in three different situations:
 *   - *link*     — the member isn't here; WhatsApp them a payment link;
 *   - *wallet*   — the member is standing at the desk; charge their JazzCash
 *                  account directly and watch it settle;
 *   - *checkout* — open JazzCash's own page on this device (card payments).
 *
 * Cash is still the default everywhere else in the app. This sheet is the
 * optional path, exactly as the spec asks.
 */
export function JazzCashSheet({
  member,
  amount,
  open,
  onClose,
  onPaid,
}: {
  member: Member | null;
  amount: number;
  open: boolean;
  onClose: () => void;
  /** Called once JazzCash confirms the money arrived. */
  onPaid?: (amount: number, method: PaymentMethod) => void;
}) {
  const { state, addActivity } = useGym();
  const { showToast } = useToast();

  const [mode, setMode] = useState<Mode>("link");
  /** Null until the owner edits it; the member's own number is the default. */
  const [mobileOverride, setMobileOverride] = useState<string | null>(null);
  const [cnic, setCnic] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetchIntegrationStatus().then((s) => {
      if (alive) setIntegrations(s);
    });
    return () => {
      alive = false;
    };
  }, [open]);

  if (!member) return null;

  const mobile = mobileOverride ?? member.phone;

  const description = `${member.plan} membership — ${member.name}`;
  const jazzCashReady = integrations?.jazzCash.configured ?? false;

  const sendPayLink = async () => {
    setBusy(true);
    setNote(null);
    const checkout = await createJazzCashCheckout({
      amount,
      description,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
    });

    if (!checkout.ok) {
      setBusy(false);
      setNote(checkout.error);
      showToast(checkout.error, "error");
      return;
    }

    const result = await sendWhatsApp({
      to: member.phone,
      kind: "payment_link",
      reference: checkout.checkout.txnRefNo,
      params: {
        memberName: member.name,
        gymName: state.settings.gymName,
        amount: formatCurrency(amount),
        payUrl: checkout.checkout.payUrl,
      },
    });
    setBusy(false);

    if (result.status === "sent" || result.status === "queued") {
      addActivity(`JazzCash payment link sent to ${member.name}`, "reminder");
      setNote(`Payment link sent to ${member.name} on WhatsApp.`);
      showToast("Payment link sent.");
      return;
    }

    if (result.waLink) {
      window.open(result.waLink, "_blank", "noopener,noreferrer");
      addActivity(`JazzCash payment link opened for ${member.name}`, "reminder");
      setNote("WhatsApp opened with the payment link ready. Tap send.");
      return;
    }
    setNote(result.error ?? "Could not send the payment link.");
  };

  const chargeWallet = async () => {
    setBusy(true);
    setNote(null);
    try {
      const response = await fetch("/api/jazzcash/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          mobileNumber: mobile,
          cnic,
          description,
          memberId: member.id,
          memberName: member.name,
        }),
      });
      const body = await response.json();

      if (body.status === "successful") {
        onPaid?.(amount, "JazzCash");
        addActivity(`${member.name} paid ${formatCurrency(amount)} by JazzCash`, "payment");
        showToast("JazzCash payment received.");
        setNote(`Received ${formatCurrency(amount)}. Reference ${body.txnRefNo}.`);
        window.setTimeout(onClose, 1200);
        return;
      }

      if (body.status === "pending") {
        setNote(`Waiting for ${member.name} to approve in the JazzCash app… (ref ${body.txnRefNo})`);
        await pollUntilSettled(body.txnRefNo);
        return;
      }

      setNote(body.responseMessage ?? body.error ?? "JazzCash declined the payment.");
      showToast(body.responseMessage ?? "JazzCash declined the payment.", "error");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      setNote(message);
      showToast(message, "error");
    } finally {
      setBusy(false);
    }
  };

  /** JazzCash answers "pending" while the member approves; check for a minute. */
  const pollUntilSettled = async (txnRefNo: string) => {
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      try {
        const response = await fetch(`/api/jazzcash/status?ref=${encodeURIComponent(txnRefNo)}`, { cache: "no-store" });
        const body = await response.json();
        if (body.status === "successful") {
          onPaid?.(amount, "JazzCash");
          addActivity(`${member.name} paid ${formatCurrency(amount)} by JazzCash`, "payment");
          setNote(`Received ${formatCurrency(amount)}. Reference ${txnRefNo}.`);
          showToast("JazzCash payment received.");
          return;
        }
        if (body.status === "failed" || body.status === "cancelled") {
          setNote(body.responseMessage ?? "JazzCash declined the payment.");
          return;
        }
      } catch {
        // Keep polling — a dropped request says nothing about the payment.
      }
    }
    setNote(`Still pending. Check again later with reference ${txnRefNo}.`);
  };

  const openCheckout = async () => {
    setBusy(true);
    setNote(null);
    const checkout = await createJazzCashCheckout({
      amount,
      description,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
    });
    setBusy(false);

    if (!checkout.ok) {
      setNote(checkout.error);
      showToast(checkout.error, "error");
      return;
    }
    submitJazzCashForm(checkout.checkout.action, checkout.checkout.fields);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={`Collect ${formatCurrency(amount)}`}>
      {!jazzCashReady ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--gym-text-muted)]">
            JazzCash isn&apos;t set up on this deployment yet. Cash and manual entry keep working as normal.
          </p>
          {(integrations?.jazzCash.missing ?? []).length > 0 && (
            <ul className="space-y-0.5 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] p-3">
              {integrations!.jazzCash.missing.map((name) => (
                <li key={name} className="font-mono text-[11px] text-[var(--gym-warning)]">
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <ModeButton active={mode === "link"} onClick={() => setMode("link")} icon={Send} label="Send link" />
            <ModeButton active={mode === "wallet"} onClick={() => setMode("wallet")} icon={Smartphone} label="Wallet" />
            <ModeButton active={mode === "checkout"} onClick={() => setMode("checkout")} icon={CreditCard} label="Card" />
          </div>

          {mode === "link" && (
            <>
              <p className="text-sm text-[var(--gym-text-muted)]">
                WhatsApps {member.name.split(" ")[0]} a link to pay {formatCurrency(amount)}. You&apos;ll see the payment
                land here once it clears.
              </p>
              <ActionButton onClick={sendPayLink} busy={busy} label="Send payment link on WhatsApp" />
            </>
          )}

          {mode === "wallet" && (
            <>
              <p className="text-sm text-[var(--gym-text-muted)]">
                Charges the member&apos;s JazzCash account directly. They approve it in the JazzCash app.
              </p>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">JazzCash mobile number</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobileOverride(e.target.value)}
                  inputMode="tel"
                  placeholder="03001234567"
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">CNIC (last 6 digits)</span>
                <input
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="123456"
                  className={inputClass}
                />
              </label>
              <ActionButton
                onClick={chargeWallet}
                busy={busy}
                disabled={cnic.length !== 6 || mobile.trim().length < 10}
                label={`Charge ${formatCurrency(amount)}`}
              />
            </>
          )}

          {mode === "checkout" && (
            <>
              <p className="text-sm text-[var(--gym-text-muted)]">
                Opens JazzCash&apos;s secure page on this device for a debit or credit card payment.
              </p>
              <ActionButton onClick={openCheckout} busy={busy} label="Open JazzCash checkout" />
            </>
          )}

          {integrations?.jazzCash.environment === "sandbox" && (
            <p className="rounded-lg border border-[var(--gym-warning)]/40 bg-[var(--gym-warning)]/10 px-3 py-2 text-center text-xs font-semibold text-[var(--gym-warning)]">
              Sandbox — no real money moves.
            </p>
          )}

          {note && <p className="text-center text-sm font-semibold text-[var(--gym-text)]">{note}</p>}
        </div>
      )}
    </BottomSheet>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3.5 py-2.5 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]";

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Send;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-semibold transition ${
        active
          ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]"
          : "border-[var(--gym-border)] bg-[var(--gym-surface-2)] text-[var(--gym-text-muted)]"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function ActionButton({
  onClick,
  busy,
  disabled,
  label,
}: {
  onClick: () => void;
  busy: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gym-accent)] py-3.5 text-sm font-bold text-black transition active:scale-[0.98] disabled:opacity-40"
    >
      {busy && <Loader2 size={16} className="animate-spin" />}
      {label}
    </button>
  );
}

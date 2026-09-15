"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, PartyPopper } from "lucide-react";
import { useGym } from "@/lib/store";
import { PLANS, PLAN_FEES, addMonths, formatCurrency, formatDate, PLAN_MONTHS } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { PaymentMethod, PaymentStatus, Plan } from "@/lib/types";

export default function RenewMembershipPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, renewMembership } = useGym();
  const { showToast } = useToast();

  const member = state.members.find((m) => m.id === params.id);

  const [plan, setPlan] = useState<Plan>(member?.plan ?? "Monthly");
  const [fee, setFee] = useState(member ? PLAN_FEES[member.plan] : PLAN_FEES.Monthly);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Paid");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [done, setDone] = useState(false);
  const [confirmedExpiry, setConfirmedExpiry] = useState<Date | null>(null);

  const baseDate = useMemo(() => {
    if (!member) return new Date();
    const currentExpiry = new Date(member.expiryDate);
    const today = new Date();
    return currentExpiry > today ? currentExpiry : today;
  }, [member]);

  const newExpiry = useMemo(() => addMonths(baseDate, PLAN_MONTHS[plan]), [baseDate, plan]);

  if (!member) {
    return <p className="px-4 pt-10 text-center text-[var(--gym-text-muted)]">Member not found.</p>;
  }

  if (done) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gym-success)]/12 text-[var(--gym-success)]">
          <PartyPopper size={28} />
        </span>
        <h1 className="text-xl font-extrabold text-[var(--gym-text)]">Membership renewed successfully.</h1>
        <p className="mt-1.5 text-sm text-[var(--gym-text-muted)]">
          {member.name}&rsquo;s new expiry date is {formatDate(confirmedExpiry ?? newExpiry)}.
        </p>
        <div className="mt-6 flex w-full max-w-xs gap-3">
          <button
            onClick={() => router.push(`/members/${member.id}`)}
            className="flex-1 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface)] py-3 text-sm font-bold text-[var(--gym-text)]"
          >
            View Member
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 rounded-xl bg-[var(--gym-accent)] py-3 text-sm font-bold text-black"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="gym-display text-3xl text-[var(--gym-text)]">{member.name}</h1>
      <p className="mt-1 text-sm text-[var(--gym-text-muted)]">
        Current membership expires: <span className="font-semibold text-[var(--gym-text)]">{formatDate(member.expiryDate)}</span>
      </p>

      <div className="mx-auto mt-6 max-w-xl space-y-5">
        <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Select New Plan</h2>
          <div className="grid grid-cols-2 gap-2">
            {PLANS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlan(p);
                  setFee(PLAN_FEES[p]);
                }}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                  plan === p ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[var(--gym-text-muted)]">Fee</p>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3 py-2 text-sm font-bold text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]"
              />
            </div>
            <div>
              <p className="text-xs text-[var(--gym-text-muted)]">New Expiry</p>
              <p className="mt-2.5 font-bold text-[var(--gym-accent)]">{formatDate(newExpiry)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Payment</h2>
          <div className="mb-3 flex gap-2">
            {(["Paid", "Partial", "Pending"] as PaymentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setPaymentStatus(s)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  paymentStatus === s ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["Cash", "Bank Transfer", "Other"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  method === m ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={() => {
            renewMembership(member.id, plan, fee, newExpiry.toISOString(), paymentStatus, method);
            showToast("Membership renewed successfully.");
            setConfirmedExpiry(newExpiry);
            setDone(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gym-accent)] py-3.5 text-sm font-bold text-black transition active:scale-[0.98]"
        >
          <CheckCircle2 size={18} />
          Confirm Renewal ({formatCurrency(fee)})
        </button>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Search, Wallet } from "lucide-react";
import { useGym } from "@/lib/store";
import { formatCurrency, formatDate, initials } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { Member, PaymentMethod } from "@/lib/types";
import { PAYMENT_METHODS } from "@/lib/types";
import { JazzCashSheet } from "@/components/JazzCashSheet";

function RecordPaymentInner() {
  const { state, recordPayment } = useGym();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselected = state.members.find((m) => m.id === searchParams.get("member")) ?? null;
  const [member, setMember] = useState<Member | null>(preselected);
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState(preselected ? preselected.fee - preselected.amountPaid || preselected.fee : 0);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [done, setDone] = useState(false);
  const [jazzCashOpen, setJazzCashOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return state.members
      .filter((m) => m.name.toLowerCase().includes(q) || m.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")))
      .slice(0, 6);
  }, [state.members, query]);

  const selectMember = (m: Member) => {
    setMember(m);
    setAmount(m.fee - m.amountPaid > 0 ? m.fee - m.amountPaid : m.fee);
    setQuery("");
  };

  if (done && member) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gym-success)]/12 text-[var(--gym-success)]">
          <CheckCircle2 size={30} />
        </span>
        <h1 className="text-xl font-extrabold text-[var(--gym-text)]">Payment recorded successfully.</h1>
        <p className="mt-1.5 text-sm text-[var(--gym-text-muted)]">
          {formatCurrency(amount)} recorded for {member.name}.
        </p>
        <div className="mt-6 flex w-full max-w-xs gap-3">
          <Link
            href={`/members/${member.id}/renew`}
            className="flex-1 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface)] py-3 text-center text-sm font-bold text-[var(--gym-text)]"
          >
            Renew Membership
          </Link>
          <button onClick={() => router.push("/payments")} className="flex-1 rounded-xl bg-[var(--gym-accent)] py-3 text-sm font-bold text-black">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-[var(--gym-text)]">Record Payment</h1>
      <p className="mb-6 text-sm text-[var(--gym-text-muted)]">Select a member to record their payment.</p>

      <div className="mx-auto max-w-xl space-y-5">
        {!member ? (
          <div>
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--gym-text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone number..."
                className="w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface)] py-3 pl-10 pr-3 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]"
                autoFocus
              />
            </div>
            {results.length > 0 && (
              <div className="mt-2 divide-y divide-[var(--gym-border)] overflow-hidden rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)]">
                {results.map((m) => (
                  <button key={m.id} onClick={() => selectMember(m)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition active:bg-[var(--gym-surface-2)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gym-surface-2)] text-xs font-bold text-[var(--gym-text)]">
                      {initials(m.name)}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-[var(--gym-text)]">{m.name}</span>
                      <span className="block text-xs text-[var(--gym-text-muted)]">{m.phone}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gym-surface-2)] text-sm font-bold text-[var(--gym-text)]">
                    {initials(member.name)}
                  </span>
                  <div>
                    <p className="font-bold text-[var(--gym-text)]">{member.name}</p>
                    <p className="text-xs text-[var(--gym-text-muted)]">{member.phone}</p>
                  </div>
                </div>
                <button onClick={() => setMember(null)} className="text-xs font-semibold text-[var(--gym-accent)]">
                  Change
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--gym-text-muted)]">Current Plan</p>
                  <p className="font-semibold text-[var(--gym-text)]">{member.plan}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--gym-text-muted)]">Current Expiry</p>
                  <p className="font-semibold text-[var(--gym-text)]">{formatDate(member.expiryDate)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">Amount</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3.5 py-3 text-lg font-bold text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]"
                />
              </label>
              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">Payment Method</span>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                        method === m ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--gym-text-muted)]">
                  Recording a payment the member already made. To take the money now, use Collect with JazzCash below.
                </p>
              </div>
            </section>

            <button
              onClick={() => {
                recordPayment(member.id, amount, method);
                showToast(`${formatCurrency(amount)} recorded for ${member.name}.`);
                setDone(true);
              }}
              disabled={amount <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gym-accent)] py-3.5 text-sm font-bold text-black transition active:scale-[0.98] disabled:opacity-40"
            >
              <CheckCircle2 size={18} />
              Record Payment
            </button>

            <button
              onClick={() => setJazzCashOpen(true)}
              disabled={amount <= 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-3.5 text-sm font-bold text-[var(--gym-text)] transition active:scale-[0.98] disabled:opacity-40"
            >
              <Wallet size={18} />
              Collect with JazzCash
            </button>

            <JazzCashSheet
              key={`jc-${member.id}`}
              member={member}
              amount={amount}
              open={jazzCashOpen}
              onClose={() => setJazzCashOpen(false)}
              onPaid={(paid, paidMethod) => {
                recordPayment(member.id, paid, paidMethod);
                setMethod(paidMethod);
                setDone(true);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function RecordPaymentPage() {
  return (
    <Suspense fallback={null}>
      <RecordPaymentInner />
    </Suspense>
  );
}

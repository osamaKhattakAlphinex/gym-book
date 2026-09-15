"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import { useGym } from "@/lib/store";
import { formatCurrency, formatDate, initials, timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterKey = "today" | "week" | "month" | "custom";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

function typeLabel(type: string): string {
  if (type === "New Membership") return "New membership";
  if (type === "Renewal") return "Membership renewal";
  return "Membership payment";
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

function PaymentsInner() {
  const { state } = useGym();
  const [filter, setFilter] = useState<FilterKey>("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [now] = useState(() => new Date());
  const todayStr = formatDate(now);

  const stats = useMemo(() => {
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = state.payments.filter((p) => formatDate(p.date) === todayStr).reduce((s, p) => s + p.amount, 0);
    const month = state.payments.filter((p) => new Date(p.date) >= startMonth).reduce((s, p) => s + p.amount, 0);
    const pending = state.members.filter((m) => m.paymentStatus !== "Paid").reduce((s, m) => s + (m.fee - m.amountPaid), 0);
    return { today, month, pending };
  }, [state.payments, state.members, now, todayStr]);

  const filtered = useMemo(() => {
    const weekStart = startOfWeek(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return state.payments.filter((p) => {
      const d = new Date(p.date);
      if (filter === "today") return formatDate(d) === todayStr;
      if (filter === "week") return d >= weekStart;
      if (filter === "month") return d >= monthStart;
      if (filter === "custom") {
        if (!from && !to) return true;
        const afterFrom = from ? d >= new Date(from) : true;
        const beforeTo = to ? d <= new Date(new Date(to).setHours(23, 59, 59, 999)) : true;
        return afterFrom && beforeTo;
      }
      return true;
    });
  }, [state.payments, filter, from, to, now, todayStr]);

  return (
    <div className="px-4 pt-5 md:px-8 md:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="gym-display text-3xl text-[var(--gym-text)]">Payments</h1>
        <Link
          href="/payments/new"
          className="hidden items-center gap-1.5 rounded-xl bg-[var(--gym-accent)] px-3.5 py-2 text-xs font-bold text-black md:flex"
        >
          <Plus size={15} />
          Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Today's Collection" value={formatCurrency(stats.today)} tone="accent" />
        <SummaryCard label="This Month" value={formatCurrency(stats.month)} tone="success" />
        <SummaryCard label="Pending" value={formatCurrency(stats.pending)} tone="danger" />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === f.key
                ? "border-[var(--gym-accent)] bg-[var(--gym-accent)] text-black"
                : "border-[var(--gym-border)] bg-[var(--gym-surface)] text-[var(--gym-text-muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "custom" && (
        <div className="mt-3 flex gap-3">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3 py-2 text-sm text-[var(--gym-text)] outline-none" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3 py-2 text-sm text-[var(--gym-text)] outline-none" />
        </div>
      )}

      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState icon={CreditCard} title="No payments recorded yet." description="Payments you record will show up here." />
        ) : (
          <div className="divide-y divide-[var(--gym-border)] rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] px-4">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--gym-surface-2)] text-xs font-bold text-[var(--gym-text)]">
                  {initials(p.memberName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-[var(--gym-text)]">{p.memberName}</p>
                  <p className="text-xs text-[var(--gym-text-muted)]">{typeLabel(p.type)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--gym-text)]">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-[var(--gym-text-muted)]">
                    {timeAgo(p.date)} &middot; {p.method}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "accent" | "success" | "danger" }) {
  const color = tone === "accent" ? "text-[var(--gym-accent)]" : tone === "success" ? "text-[var(--gym-success)]" : "text-[var(--gym-danger)]";
  return (
    <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-3.5">
      <p className={`text-lg font-extrabold leading-tight ${color}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium text-[var(--gym-text-muted)]">{label}</p>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsInner />
    </Suspense>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useGym, useDashboardStats } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default function ReportsPage() {
  const { state } = useGym();
  const stats = useDashboardStats();
  const [now] = useState(() => new Date());

  const monthlyRevenue = useMemo(() => {
    const months: { label: string; key: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), key: monthKey(d), total: 0 });
    }
    for (const p of state.payments) {
      const d = new Date(p.date);
      const key = monthKey(d);
      const entry = months.find((m) => m.key === key);
      if (entry) entry.total += p.amount;
    }
    return months;
  }, [state.payments, now]);

  const thisMonthRevenue = monthlyRevenue[5]?.total ?? 0;
  const prevMonthRevenue = monthlyRevenue[4]?.total ?? 0;
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((m) => m.total));

  const newThisMonth = useMemo(
    () => state.members.filter((m) => monthKey(new Date(m.memberSince)) === monthKey(now)).length,
    [state.members, now]
  );

  const renewalsThisMonth = useMemo(
    () => state.payments.filter((p) => p.type === "Renewal" && monthKey(new Date(p.date)) === monthKey(now)).length,
    [state.payments, now]
  );

  const revenueDelta = prevMonthRevenue > 0 ? Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="gym-display mb-6 text-3xl text-[var(--gym-text)]">Reports</h1>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Membership Statistics</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Active Members" value={String(stats.active)} tone="success" />
          <StatCard label="New Members This Month" value={String(newThisMonth)} tone="accent" />
          <StatCard label="Renewals This Month" value={String(renewalsThisMonth)} tone="accent" />
          <StatCard label="Expired Members" value={String(stats.expired)} tone="danger" />
        </div>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <p className="text-xs font-medium text-[var(--gym-text-muted)]">This Month</p>
          <p className="mt-1 text-2xl font-extrabold text-[var(--gym-accent)]">{formatCurrency(thisMonthRevenue)}</p>
          {revenueDelta !== 0 && (
            <p className={`mt-1 text-xs font-semibold ${revenueDelta > 0 ? "text-[var(--gym-success)]" : "text-[var(--gym-danger)]"}`}>
              {revenueDelta > 0 ? "+" : ""}
              {revenueDelta}% vs previous month
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
          <p className="text-xs font-medium text-[var(--gym-text-muted)]">Previous Month</p>
          <p className="mt-1 text-2xl font-extrabold text-[var(--gym-text)]">{formatCurrency(prevMonthRevenue)}</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">Revenue — Last 6 Months</h2>
        <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-5">
          <div className="flex h-40 items-end justify-between gap-2 md:gap-4">
            {monthlyRevenue.map((m, i) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end justify-center">
                  <div
                    className={`w-full max-w-8 rounded-t-md transition-all ${i === monthlyRevenue.length - 1 ? "bg-[var(--gym-accent)]" : "bg-[var(--gym-surface-2)]"}`}
                    style={{ height: `${Math.max(4, (m.total / maxRevenue) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-[var(--gym-text-muted)]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "success" | "accent" | "danger" }) {
  const color = tone === "success" ? "text-[var(--gym-success)]" : tone === "accent" ? "text-[var(--gym-accent)]" : "text-[var(--gym-danger)]";
  return (
    <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-1.5 text-xs font-medium text-[var(--gym-text-muted)]">{label}</p>
    </div>
  );
}

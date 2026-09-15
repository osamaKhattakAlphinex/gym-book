"use client";

import { useMemo, useState } from "react";
import { Users, UserPlus, RefreshCw, XCircle } from "lucide-react";
import { useGym, useDashboardStats } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { monthlyRevenue, memberGrowth, joinedInMonth, percentDelta } from "@/lib/analytics";
import { StatTile } from "@/components/charts/StatTile";
import { ColumnChart } from "@/components/charts/ColumnChart";

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

export default function ReportsPage() {
  const { state } = useGym();
  const stats = useDashboardStats();
  const [now] = useState(() => new Date());

  const revenue = useMemo(() => monthlyRevenue(state.payments, now), [state.payments, now]);
  const growth = useMemo(() => memberGrowth(state.members, now), [state.members, now]);

  const thisMonthRevenue = revenue[revenue.length - 1]?.value ?? 0;
  const prevMonthRevenue = revenue[revenue.length - 2]?.value ?? 0;
  const revenueDelta = percentDelta(thisMonthRevenue, prevMonthRevenue);

  const newThisMonth = useMemo(() => joinedInMonth(state.members, now), [state.members, now]);

  const renewalsThisMonth = useMemo(
    () => state.payments.filter((p) => p.type === "Renewal" && monthKey(new Date(p.date)) === monthKey(now)).length,
    [state.payments, now]
  );

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="gym-display mb-6 text-3xl text-[var(--gym-text)]">Reports</h1>

      <section className="mb-4">
        <h2 className="gym-display mb-3 text-sm tracking-widest text-[var(--gym-text-muted)]">Membership</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            icon={Users}
            label="Active members"
            value={String(stats.active)}
            tone="success"
            trend={growth}
            delta={percentDelta(growth[growth.length - 1] ?? 0, growth[growth.length - 2] ?? 0)}
            deltaLabel="vs last month"
          />
          <StatTile icon={UserPlus} label="New this month" value={String(newThisMonth)} tone="accent" />
          <StatTile icon={RefreshCw} label="Renewals this month" value={String(renewalsThisMonth)} tone="accent" />
          <StatTile icon={XCircle} label="Expired members" value={String(stats.expired)} tone="danger" upIsGood={false} />
        </div>
      </section>

      <section className="gym-card p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="gym-display text-lg text-[var(--gym-text)]">Revenue</h2>
            <p className="mt-0.5 text-xs text-[var(--gym-text-muted)]">Last six months</p>
          </div>
          <div className="text-right">
            <p className="gym-figure text-2xl text-[var(--gym-text)]">{formatCurrency(thisMonthRevenue)}</p>
            <p className="mt-1 text-xs">
              {revenueDelta !== 0 ? (
                <span className={`font-bold ${revenueDelta > 0 ? "text-[var(--gym-success)]" : "text-[var(--gym-danger)]"}`}>
                  {revenueDelta > 0 ? "+" : ""}
                  {revenueDelta}%{" "}
                </span>
              ) : (
                <span className="font-bold text-[var(--gym-text-muted)]">Level </span>
              )}
              <span className="text-[var(--gym-text-dim)]">vs {formatCurrency(prevMonthRevenue)} last month</span>
            </p>
          </div>
        </div>

        <ColumnChart
          data={revenue}
          formatValue={formatCurrency}
          caption="Revenue by month, last six months"
          height={200}
        />
      </section>
    </div>
  );
}

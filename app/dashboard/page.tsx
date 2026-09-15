"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarClock,
  XCircle,
  Wallet,
  UserPlus,
  CreditCard,
  Search,
  CalendarCheck,
  PartyPopper,
  Dumbbell,
  ChevronRight,
  TrendingUp,
  Plus,
} from "lucide-react";
import { useGym, useDashboardStats, useInventoryStats } from "@/lib/store";
import { formatCurrency, getMembershipStatus } from "@/lib/utils";
import { monthlyRevenue, dailyRevenue, memberGrowth, percentDelta } from "@/lib/analytics";
import { StatTile } from "@/components/charts/StatTile";
import { ColumnChart } from "@/components/charts/ColumnChart";
import { SegmentedOverview } from "@/components/ui/ProgressBar";
import { ActivityItem } from "@/components/ActivityItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExpiringRow } from "@/components/ExpiringRow";
import { ReminderSheet } from "@/components/ReminderSheet";
import type { Member } from "@/lib/types";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function GymDashboardPage() {
  const { state } = useGym();
  const stats = useDashboardStats();
  const inventoryStats = useInventoryStats();
  const equipmentNeedingAttention = inventoryStats.needsRepair + inventoryStats.outOfService;
  const [reminderMember, setReminderMember] = useState<Member | null>(null);

  // Pinned once so the whole view agrees on "today" across re-renders.
  const [now] = useState(() => new Date());

  const expiringMembers = useMemo(() => {
    return state.members
      .map((m) => ({ member: m, ...getMembershipStatus(m.expiryDate) }))
      .filter((x) => x.status === "expiring" || x.status === "expired")
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 6);
  }, [state.members]);

  const revenue = useMemo(() => monthlyRevenue(state.payments, now), [state.payments, now]);
  const revenueTrend = useMemo(() => dailyRevenue(state.payments, now), [state.payments, now]);
  const growth = useMemo(() => memberGrowth(state.members, now), [state.members, now]);

  const thisMonth = revenue[revenue.length - 1]?.value ?? 0;
  const lastMonth = revenue[revenue.length - 2]?.value ?? 0;
  const revenueDelta = percentDelta(thisMonth, lastMonth);

  const collectionsDelta = percentDelta(
    revenueTrend[revenueTrend.length - 1] ?? 0,
    revenueTrend[revenueTrend.length - 2] ?? 0
  );
  const membersDelta = percentDelta(growth[growth.length - 1] ?? 0, growth[growth.length - 2] ?? 0);

  const retention = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const todayLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="px-4 pt-5 md:px-8 md:pt-6">
      {/* ------------------------------------------------------------ Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="gym-display text-3xl text-[var(--gym-text)] md:text-4xl">
            {greeting()}, {state.settings.ownerName}
          </h1>
          <p className="mt-1 text-sm text-[var(--gym-text-muted)]">{todayLabel}</p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/payments/new"
            className="flex items-center gap-1.5 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--gym-text)] transition hover:border-[var(--gym-border-strong)] active:scale-95"
          >
            <CreditCard size={16} />
            Record payment
          </Link>
          <Link
            href="/members/new"
            className="flex items-center gap-1.5 rounded-xl bg-[var(--gym-accent)] px-3.5 py-2.5 text-sm font-bold text-black transition hover:bg-[var(--gym-accent-strong)] active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add member
          </Link>
        </div>
      </div>

      {/* --------------------------------------------------------- KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Active members"
          value={String(stats.active)}
          tone="success"
          href="/members?filter=active"
          delta={membersDelta}
          deltaLabel="vs last month"
          trend={growth}
        />
        <StatTile
          icon={CalendarClock}
          label="Expiring soon"
          value={String(stats.expiringSoon)}
          tone="warning"
          href="/expiring"
          hint="Within 7 days"
        />
        <StatTile
          icon={XCircle}
          label="Expired"
          value={String(stats.expired)}
          tone="danger"
          href="/members?filter=expired"
          hint={stats.pending > 0 ? `${formatCurrency(stats.pending)} outstanding` : "All settled"}
        />
        <StatTile
          icon={Wallet}
          label="Today's collections"
          value={formatCurrency(stats.todaysCollections)}
          tone="accent"
          href="/payments"
          delta={collectionsDelta}
          deltaLabel="vs yesterday"
          trend={revenueTrend}
        />
      </div>

      {equipmentNeedingAttention > 0 && (
        <Link
          href="/inventory"
          className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--gym-warning)]/30 bg-[var(--gym-warning)]/10 px-3.5 py-3 transition hover:border-[var(--gym-warning)]/50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--gym-warning)]/15 text-[var(--gym-warning)]">
            <Dumbbell size={15} />
          </span>
          <span className="flex-1 text-sm font-semibold text-[var(--gym-text)]">
            {equipmentNeedingAttention} piece{equipmentNeedingAttention === 1 ? "" : "s"} of equipment need
            {equipmentNeedingAttention === 1 ? "s" : ""} attention
          </span>
          <ChevronRight size={16} className="shrink-0 text-[var(--gym-text-muted)]" />
        </Link>
      )}

      {/* ----------------------------------------------- Revenue + mix */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="gym-card p-5 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="gym-display text-lg text-[var(--gym-text)]">Revenue</h2>
              <p className="mt-0.5 text-xs text-[var(--gym-text-muted)]">Last six months</p>
            </div>
            <div className="text-right">
              <p className="gym-figure text-2xl text-[var(--gym-text)]">{formatCurrency(thisMonth)}</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs">
                {revenueDelta !== 0 ? (
                  <span
                    className={`font-bold ${revenueDelta > 0 ? "text-[var(--gym-success)]" : "text-[var(--gym-danger)]"}`}
                  >
                    {revenueDelta > 0 ? "+" : ""}
                    {revenueDelta}%
                  </span>
                ) : (
                  <span className="font-bold text-[var(--gym-text-muted)]">Level</span>
                )}
                <span className="text-[var(--gym-text-dim)]">vs last month</span>
              </p>
            </div>
          </div>

          <ColumnChart data={revenue} formatValue={formatCurrency} caption="Revenue by month, last six months" />
        </section>

        <section className="gym-card flex flex-col p-5">
          <h2 className="gym-display text-lg text-[var(--gym-text)]">Membership mix</h2>
          <p className="mt-0.5 text-xs text-[var(--gym-text-muted)]">{stats.total} members on the books</p>

          <div className="mt-5">
            <SegmentedOverview active={stats.active} expiring={stats.expiringSoon} expired={stats.expired} />
          </div>

          <ul className="mt-4 space-y-2.5">
            <MixRow label="Active" value={stats.active} total={stats.total} dot="bg-[var(--gym-success)]" />
            <MixRow label="Expiring this week" value={stats.expiringSoon} total={stats.total} dot="bg-[var(--gym-warning)]" />
            <MixRow label="Expired" value={stats.expired} total={stats.total} dot="bg-[var(--gym-danger)]" />
          </ul>

          <div className="mt-auto flex items-center gap-2 border-t border-[var(--gym-border)] pt-4 text-xs">
            <TrendingUp size={14} className="shrink-0 text-[var(--gym-accent)]" />
            <span className="text-[var(--gym-text-muted)]">
              <span className="font-bold text-[var(--gym-text)]">{retention}%</span> of members are in good standing
            </span>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------ Needs chasing */}
      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="gym-display text-xl text-[var(--gym-text)]">Needs chasing</h2>
          <Link href="/expiring" className="text-xs font-bold text-[var(--gym-accent)] transition hover:underline">
            View all
          </Link>
        </div>

        {expiringMembers.length === 0 ? (
          <EmptyState
            icon={PartyPopper}
            title="You're all caught up."
            description="No memberships are expiring or overdue right now."
          />
        ) : (
          <div className="gym-card divide-y divide-[var(--gym-border)] overflow-hidden">
            {expiringMembers.map(({ member, status, daysRemaining }) => (
              <ExpiringRow
                key={member.id}
                member={member}
                status={status}
                daysRemaining={daysRemaining}
                onRemind={setReminderMember}
              />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------ Activity + actions */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="gym-card overflow-hidden lg:col-span-2">
          <h2 className="gym-display border-b border-[var(--gym-border)] px-5 py-3.5 text-sm tracking-widest text-[var(--gym-text-muted)]">
            Recent activity
          </h2>
          {state.activity.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--gym-text-muted)]">No recent activity yet.</p>
          ) : (
            <div className="divide-y divide-[var(--gym-border)] px-4">
              {state.activity.slice(0, 6).map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          )}
        </section>

        <section className="gym-card overflow-hidden">
          <h2 className="gym-display border-b border-[var(--gym-border)] px-5 py-3.5 text-sm tracking-widest text-[var(--gym-text-muted)]">
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-px bg-[var(--gym-border)]">
            <QuickAction href="/members/new" icon={UserPlus} label="Add member" />
            <QuickAction href="/payments/new" icon={CreditCard} label="Record payment" />
            <QuickAction href="/expiring" icon={CalendarCheck} label="View expiring" />
            <QuickAction href="/members?focus=1" icon={Search} label="Find member" />
          </div>
        </section>
      </div>

      <ReminderSheet
        key={reminderMember?.id ?? "none"}
        member={reminderMember}
        open={!!reminderMember}
        onClose={() => setReminderMember(null)}
      />
    </div>
  );
}

function MixRow({ label, value, total, dot }: { label: string; value: number; total: number; dot: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} aria-hidden />
      <span className="flex-1 text-[var(--gym-text-muted)]">{label}</span>
      <span className="gym-tabular font-bold text-[var(--gym-text)]">{value}</span>
      <span className="gym-tabular w-9 text-right text-xs text-[var(--gym-text-dim)]">{pct}%</span>
    </li>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof UserPlus; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 bg-[var(--gym-surface)] px-3 py-5 text-center transition hover:bg-[var(--gym-surface-2)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]">
        <Icon size={17} />
      </span>
      <span className="text-[11px] font-semibold text-[var(--gym-text)]">{label}</span>
    </Link>
  );
}

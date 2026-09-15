"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Users, CalendarClock, XCircle, Wallet, UserPlus, CreditCard, Search, CalendarCheck, PartyPopper, Dumbbell, ChevronRight } from "lucide-react";
import { useGym, useDashboardStats, useInventoryStats } from "@/lib/store";
import { formatCurrency, formatDate, getMembershipStatus } from "@/lib/utils";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge, ExpiryText } from "@/components/ui/StatusBadge";
import { SegmentedOverview } from "@/components/ui/ProgressBar";
import { ActivityItem } from "@/components/ActivityItem";
import { EmptyState } from "@/components/ui/EmptyState";
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

  const expiringMembers = useMemo(() => {
    return state.members
      .map((m) => ({ member: m, ...getMembershipStatus(m.expiryDate) }))
      .filter((x) => x.status === "expiring")
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 4);
  }, [state.members]);

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="px-4 pt-5 md:px-8 md:pt-6">
      <div className="mb-6">
        <h1 className="gym-display text-3xl text-[var(--gym-text)] md:text-4xl">
          {greeting()}, {state.settings.ownerName}
        </h1>
        <p className="mt-1 text-sm text-[var(--gym-text-muted)]">{todayLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard icon={Users} label="Active Members" value={String(stats.active)} tone="success" href="/members?filter=active" />
        <KpiCard icon={CalendarClock} label="Expiring Soon" value={String(stats.expiringSoon)} tone="warning" href="/expiring" />
        <KpiCard icon={XCircle} label="Expired" value={String(stats.expired)} tone="danger" href="/members?filter=expired" />
        <KpiCard icon={Wallet} label="Today's Collections" value={formatCurrency(stats.todaysCollections)} tone="accent" href="/payments" />
      </div>

      {equipmentNeedingAttention > 0 && (
        <Link
          href="/inventory"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--gym-warning)]/30 bg-[var(--gym-warning)]/10 p-3.5 transition active:scale-[0.99]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--gym-warning)]/15 text-[var(--gym-warning)]">
            <Dumbbell size={16} />
          </span>
          <span className="flex-1 text-sm font-semibold text-[var(--gym-text)]">
            {equipmentNeedingAttention} piece{equipmentNeedingAttention === 1 ? "" : "s"} of equipment need{equipmentNeedingAttention === 1 ? "s" : ""} attention
          </span>
          <ChevronRight size={16} className="shrink-0 text-[var(--gym-text-muted)]" />
        </Link>
      )}

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="gym-display text-xl text-[var(--gym-text)]">Memberships Expiring Soon</h2>
          <Link href="/expiring" className="text-xs font-semibold text-[var(--gym-accent)]">
            View all
          </Link>
        </div>
        {expiringMembers.length === 0 ? (
          <EmptyState icon={PartyPopper} title="You're all caught up." description="No memberships are expiring in the next 7 days." />
        ) : (
          <div className="space-y-3">
            {expiringMembers.map(({ member, status, daysRemaining }) => (
              <div key={member.id} className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold text-[var(--gym-text)]">{member.name}</p>
                    <p className="text-xs text-[var(--gym-text-muted)]">Gym Membership &middot; {member.plan}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <ExpiryText status={status} daysRemaining={daysRemaining} />
                  <span className="text-xs text-[var(--gym-text-muted)]">{formatDate(member.expiryDate)}</span>
                </div>
                <div className="mt-1 text-sm font-bold text-[var(--gym-text)]">{formatCurrency(member.fee)}</div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setReminderMember(member)}
                    className="flex-1 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-2.5 text-sm font-semibold text-[var(--gym-text)] transition active:scale-[0.98]"
                  >
                    Remind
                  </button>
                  <Link
                    href={`/members/${member.id}`}
                    className="flex-1 rounded-xl bg-[var(--gym-accent)] py-2.5 text-center text-sm font-bold text-black transition active:scale-[0.98]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-7">
        <h2 className="gym-display mb-3 text-xl text-[var(--gym-text)]">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <QuickAction href="/members/new" icon={UserPlus} label="Add Member" />
          <QuickAction href="/payments/new" icon={CreditCard} label="Record Payment" />
          <QuickAction href="/expiring" icon={CalendarCheck} label="View Expiring" />
          <QuickAction href="/members?focus=1" icon={Search} label="Search Member" />
        </div>
      </section>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <section>
          <h2 className="gym-display mb-2 text-xl text-[var(--gym-text)]">Recent Activity</h2>
          <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] px-4">
            {state.activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--gym-text-muted)]">No recent activity yet.</p>
            ) : (
              <div className="divide-y divide-[var(--gym-border)]">
                {state.activity.slice(0, 6).map((a) => (
                  <ActivityItem key={a.id} activity={a} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="gym-display mb-2 text-xl text-[var(--gym-text)]">Membership Overview</h2>
          <div className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
            <SegmentedOverview active={stats.active} expiring={stats.expiringSoon} expired={stats.expired} />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="gym-stat text-xl text-[var(--gym-success)]">{stats.active}</p>
                <p className="text-[11px] font-medium text-[var(--gym-text-muted)]">Active</p>
              </div>
              <div>
                <p className="gym-stat text-xl text-[var(--gym-warning)]">{stats.expiringSoon}</p>
                <p className="text-[11px] font-medium text-[var(--gym-text-muted)]">Expiring this week</p>
              </div>
              <div>
                <p className="gym-stat text-xl text-[var(--gym-danger)]">{stats.expired}</p>
                <p className="text-[11px] font-medium text-[var(--gym-text-muted)]">Expired</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ReminderSheet key={reminderMember?.id ?? "none"} member={reminderMember} open={!!reminderMember} onClose={() => setReminderMember(null)} />
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof UserPlus; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] py-5 text-center transition active:scale-[0.97]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]">
        <Icon size={19} />
      </span>
      <span className="text-xs font-semibold text-[var(--gym-text)]">{label}</span>
    </Link>
  );
}

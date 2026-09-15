"use client";

import { Bell, BellOff, CalendarClock, CreditCard, Info, XCircle, Wrench } from "lucide-react";
import { useGym } from "@/lib/store";
import { timeAgo } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import type { NotificationKind } from "@/lib/types";

const ICONS: Record<NotificationKind, typeof Bell> = {
  expiring: CalendarClock,
  expired: XCircle,
  payment: CreditCard,
  equipment: Wrench,
  info: Info,
};

const COLORS: Record<NotificationKind, string> = {
  expiring: "text-[var(--gym-warning)] bg-[var(--gym-warning)]/10",
  expired: "text-[var(--gym-danger)] bg-[var(--gym-danger)]/10",
  payment: "text-[var(--gym-success)] bg-[var(--gym-success)]/10",
  equipment: "text-[var(--gym-warning)] bg-[var(--gym-warning)]/10",
  info: "text-[var(--gym-accent)] bg-[var(--gym-accent)]/10",
};

export default function NotificationsPage() {
  const { state, markNotificationRead, markAllNotificationsRead } = useGym();
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="gym-display text-3xl text-[var(--gym-text)]">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-[var(--gym-accent)]">
            Mark all as read
          </button>
        )}
      </div>

      {state.notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" description="You're all caught up for now." />
      ) : (
        <div className="space-y-2.5">
          {state.notifications.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                  n.read ? "border-[var(--gym-border)] bg-[var(--gym-surface)]" : "border-[var(--gym-accent)]/30 bg-[var(--gym-surface-2)]"
                }`}
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${COLORS[n.kind]}`}>
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--gym-text)]">{n.text}</span>
                  <span className="mt-0.5 block text-xs text-[var(--gym-text-muted)]">{timeAgo(n.timestamp)}</span>
                </span>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--gym-accent)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

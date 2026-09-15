"use client";

import Link from "next/link";
import { Bell, Dumbbell, Search } from "lucide-react";
import { useGym } from "@/lib/store";

export function TopBar() {
  const { state } = useGym();
  const unread = state.notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--gym-border)] bg-[var(--gym-bg)]/95 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--gym-accent)] text-black">
          <Dumbbell size={16} strokeWidth={2.5} />
        </span>
        <span className="text-[15px] font-extrabold tracking-tight text-[var(--gym-text)]">{state.settings.gymName}</span>
      </Link>
      <div className="flex items-center gap-1.5">
        <Link
          href="/members?focus=1"
          aria-label="Search Member"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gym-surface)] text-[var(--gym-text-muted)] active:scale-95 transition"
        >
          <Search size={17} />
        </Link>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--gym-surface)] text-[var(--gym-text-muted)] active:scale-95 transition"
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--gym-danger)]" />
          )}
        </Link>
      </div>
    </header>
  );
}

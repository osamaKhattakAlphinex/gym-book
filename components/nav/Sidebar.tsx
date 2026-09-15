"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Users,
  CalendarClock,
  Wallet,
  Dumbbell,
  ChartNoAxesColumn,
  Settings,
  Plus,
  Globe,
} from "lucide-react";
import { useGym } from "@/lib/store";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Activity, match: (p: string) => p === "/dashboard" },
  { href: "/members", label: "Members", icon: Users, match: (p: string) => p.startsWith("/members") },
  { href: "/expiring", label: "Expiring Soon", icon: CalendarClock, match: (p: string) => p.startsWith("/expiring") },
  { href: "/payments", label: "Payments", icon: Wallet, match: (p: string) => p.startsWith("/payments") },
  { href: "/inventory", label: "Inventory", icon: Dumbbell, match: (p: string) => p.startsWith("/inventory") },
  { href: "/reports", label: "Reports", icon: ChartNoAxesColumn, match: (p: string) => p.startsWith("/reports") },
  { href: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

export function Sidebar() {
  const pathname = usePathname();
  const { state } = useGym();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--gym-border)] bg-[var(--gym-surface)] md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gym-accent)] text-black">
          <Dumbbell size={18} strokeWidth={2.5} />
        </span>
        <span className="gym-display text-lg text-[var(--gym-text)]">{state.settings.gymName}</span>
      </div>

      <Link href="/members/new" className="gym-btn gym-btn-primary mx-4 mb-5 py-2.5 text-sm">
        <Plus size={17} strokeWidth={2.5} />
        Add Member
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--gym-accent)]/12 text-[var(--gym-accent)]"
                  : "text-[var(--gym-text-muted)] hover:bg-[var(--gym-surface-2)] hover:text-[var(--gym-text)]"
              }`}
            >
              {active && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[var(--gym-accent)]" aria-hidden />}
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--gym-border)] px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--gym-text-muted)] transition hover:bg-[var(--gym-surface-2)] hover:text-[var(--gym-text)]"
        >
          <Globe size={18} />
          View public site
        </Link>
      </div>

      <div className="border-t border-[var(--gym-border)] px-6 py-4">
        <p className="text-xs font-semibold text-[var(--gym-text)]">{state.settings.ownerName}</p>
        <p className="text-xs text-[var(--gym-text-muted)]">Gym Owner</p>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Users, Wallet, Menu, Plus } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Activity, match: (p: string) => p === "/dashboard" },
  { href: "/members", label: "Members", icon: Users, match: (p: string) => p.startsWith("/members") },
];

const RIGHT_ITEMS = [
  { href: "/payments", label: "Payments", icon: Wallet, match: (p: string) => p.startsWith("/payments") },
  {
    href: "/more",
    label: "More",
    icon: Menu,
    match: (p: string) => ["/more", "/expiring", "/reports", "/settings", "/notifications"].some((x) => p.startsWith(x)),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const renderItem = (item: (typeof ITEMS)[number]) => {
    const active = item.match(pathname);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? "text-[var(--gym-accent)]" : "text-[var(--gym-text-muted)]"} />
        <span className={`text-[10px] font-semibold ${active ? "text-[var(--gym-accent)]" : "text-[var(--gym-text-muted)]"}`}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--gym-border)] bg-[var(--gym-surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-md items-center px-1">
        {ITEMS.map(renderItem)}
        <div className="flex flex-1 flex-col items-center justify-center">
          <Link
            href="/members/new"
            aria-label="Add Member"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gym-accent)] text-black shadow-lg shadow-[var(--gym-accent)]/30 active:scale-95 transition"
          >
            <Plus size={26} strokeWidth={2.5} />
          </Link>
        </div>
        {RIGHT_ITEMS.map(renderItem)}
      </div>
    </nav>
  );
}

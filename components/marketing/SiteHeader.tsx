"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dumbbell, Menu, X, ArrowRight } from "lucide-react";
import { MARKETING_NAV } from "@/lib/marketing/routes";
import { GYM } from "@/lib/marketing/content";

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--gym-border)] bg-[var(--gym-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${GYM.name} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gym-accent)] text-black">
            <Dumbbell size={18} strokeWidth={2.5} />
          </span>
          <span className="gym-display text-lg text-[var(--gym-text)] md:text-xl">{GYM.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MARKETING_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`gym-display rounded-lg px-3 py-2 text-sm tracking-wide transition ${
                  active
                    ? "text-[var(--gym-accent)]"
                    : "text-[var(--gym-text-muted)] hover:text-[var(--gym-text)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/dashboard"
            className="gym-display rounded-lg px-3 py-2 text-sm tracking-wide text-[var(--gym-text-muted)] transition hover:text-[var(--gym-text)]"
          >
            Staff Login
          </Link>
          <Link href="/contact" className="gym-btn gym-btn-primary px-4 py-2.5 text-sm">
            Free Trial
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--gym-border)] bg-[var(--gym-surface)] text-[var(--gym-text)] transition active:scale-95 lg:hidden"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open && (
        <div id="site-menu" className="border-t border-[var(--gym-border)] bg-[var(--gym-surface)] lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {MARKETING_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={`gym-display rounded-lg px-3 py-3 text-base tracking-wide transition ${
                    active ? "text-[var(--gym-accent)]" : "text-[var(--gym-text)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/dashboard"
              onClick={close}
              className="gym-display rounded-lg px-3 py-3 text-base tracking-wide text-[var(--gym-text-muted)]"
            >
              Staff Login
            </Link>
            <Link href="/contact" onClick={close} className="gym-btn gym-btn-primary mt-2 w-full py-3 text-sm">
              Claim Free Trial
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

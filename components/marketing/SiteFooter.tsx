import Link from "next/link";
import { Dumbbell, MapPin, Phone, Mail, Clock3 } from "lucide-react";
import { MARKETING_NAV } from "@/lib/marketing/routes";
import { GYM, PROGRAMS } from "@/lib/marketing/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--gym-border)] bg-[var(--gym-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gym-accent)] text-black">
                <Dumbbell size={18} strokeWidth={2.5} />
              </span>
              <span className="gym-display text-lg text-[var(--gym-text)]">{GYM.name}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--gym-text-muted)]">{GYM.tagline}</p>
          </div>

          <div>
            <h3 className="gym-display text-sm tracking-widest text-[var(--gym-text)]">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {MARKETING_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[var(--gym-text-muted)] transition hover:text-[var(--gym-accent)]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="gym-display text-sm tracking-widest text-[var(--gym-text)]">Programs</h3>
            <ul className="mt-4 space-y-2.5">
              {PROGRAMS.slice(0, 5).map((program) => (
                <li key={program.slug}>
                  <Link href="/programs" className="text-sm text-[var(--gym-text-muted)] transition hover:text-[var(--gym-accent)]">
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="gym-display text-sm tracking-widest text-[var(--gym-text)]">Visit Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--gym-text-muted)]">
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                <span>{GYM.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                <a href={`tel:${GYM.phone.replace(/\s/g, "")}`} className="transition hover:text-[var(--gym-accent)]">
                  {GYM.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                <a href={`mailto:${GYM.email}`} className="transition hover:text-[var(--gym-accent)]">
                  {GYM.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                <span>Open 7 days · 5 AM – 11 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--gym-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--gym-text-dim)]">
            &copy; {new Date().getFullYear()} {GYM.name}. All rights reserved.
          </p>
          <Link href="/dashboard" className="text-xs font-semibold text-[var(--gym-text-dim)] transition hover:text-[var(--gym-accent)]">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

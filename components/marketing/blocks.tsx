import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STATS } from "@/lib/marketing/content";

/** Headline numbers strip — sits directly under the hero. */
export function StatStrip() {
  return (
    <div className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[var(--gym-border)] md:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-[var(--gym-surface)] px-4 py-6 text-center md:py-8">
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="gym-stat block text-3xl text-[var(--gym-accent)] md:text-4xl">{stat.value}</span>
              <span className="mt-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--gym-text-muted)]">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Closing call to action, reused at the bottom of every marketing page. */
export function CtaBanner({
  title = "Your first session is on us",
  description = "Walk in, train with a coach, use the whole floor. No card, no contract, no pressure — just come and see whether this is your gym.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="px-4 py-14 md:px-8 md:py-20">
      <div className="gym-spotlight relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <div className="gym-stripes absolute inset-0" aria-hidden />
        <div className="relative px-6 py-12 text-center md:px-16 md:py-16">
          <h2 className="gym-display mx-auto max-w-2xl text-3xl text-[var(--gym-text)] sm:text-4xl md:text-5xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--gym-text-muted)] md:text-base">
            {description}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="gym-btn gym-btn-primary px-6 py-3.5 text-sm">
              Book Your Free Session
              <ArrowRight size={17} strokeWidth={2.5} />
            </Link>
            <Link href="/pricing" className="gym-btn gym-btn-ghost px-6 py-3.5 text-sm">
              See Membership Plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact hero for the inner marketing pages. */
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--gym-border)]">
      <div className="gym-grid absolute inset-0" aria-hidden />
      <div className="gym-spotlight absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <p className="gym-eyebrow">{eyebrow}</p>
        <h1 className="gym-display mt-3 max-w-3xl text-4xl text-[var(--gym-text)] sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--gym-text-muted)] md:text-base">{description}</p>
      </div>
    </section>
  );
}

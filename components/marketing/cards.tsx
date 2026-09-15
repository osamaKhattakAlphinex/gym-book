import Link from "next/link";
import { Check, Quote, Clock, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { MembershipTier, Program, Testimonial, Trainer } from "@/lib/marketing/content";

export function ProgramCard({ program }: { program: Program }) {
  const Icon = program.icon;

  return (
    <article className="gym-card gym-card-hover group relative overflow-hidden p-5">
      {/* Knurled grip rail — lights up on hover. */}
      <span className="gym-knurl absolute inset-y-0 left-0 w-[3px] opacity-25 transition group-hover:opacity-100" />

      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gym-accent)]/10 text-[var(--gym-accent)] transition group-hover:bg-[var(--gym-accent)] group-hover:text-black">
        <Icon size={24} strokeWidth={2} />
      </span>

      <h3 className="gym-display mt-4 text-xl text-[var(--gym-text)]">{program.name}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--gym-accent)]">{program.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--gym-text-muted)]">{program.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--gym-text-muted)]">
          <Clock size={12} />
          {program.duration}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--gym-text-muted)]">
          {program.level}
        </span>
      </div>
    </article>
  );
}

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <article className="gym-card gym-card-hover overflow-hidden text-center">
      {/* Initials medallion stands in for a photo — no stock imagery. */}
      <div className="gym-stripes flex items-center justify-center border-b border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-8">
        <span className="gym-display flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--gym-accent)] bg-[var(--gym-bg)] text-2xl text-[var(--gym-accent)]">
          {trainer.initials}
        </span>
      </div>
      <div className="p-5">
        <h3 className="gym-display text-lg text-[var(--gym-text)]">{trainer.name}</h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[var(--gym-accent)]">{trainer.role}</p>
        <p className="mt-2.5 text-sm text-[var(--gym-text-muted)]">{trainer.specialty}</p>
        <p className="mt-2 text-xs text-[var(--gym-text-dim)]">{trainer.experience} coaching</p>
      </div>
    </article>
  );
}

export function PricingCard({ tier }: { tier: MembershipTier }) {
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 transition ${
        tier.featured
          ? "border-[var(--gym-accent)] bg-[var(--gym-surface-2)] shadow-lg shadow-[var(--gym-accent)]/10"
          : "border-[var(--gym-border)] bg-[var(--gym-surface)] hover:border-[var(--gym-border-strong)]"
      }`}
    >
      {tier.featured && (
        <span className="gym-display absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--gym-accent)] px-3 py-1 text-[11px] tracking-widest text-black">
          <Star size={11} strokeWidth={3} />
          Most Popular
        </span>
      )}

      <h3 className="gym-display text-xl text-[var(--gym-text)]">{tier.name}</h3>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--gym-text-muted)]">
        {tier.plan} membership
      </p>

      <div className="mt-5">
        <span className="gym-stat text-4xl text-[var(--gym-text)]">{formatCurrency(tier.price)}</span>
        <p className="mt-1.5 text-xs text-[var(--gym-text-muted)]">
          {tier.months === 1 ? "Billed monthly" : `${formatCurrency(tier.perMonth)} / month, paid upfront`}
        </p>
      </div>

      {tier.savingsPercent > 0 ? (
        <p className="mt-3 inline-flex w-fit rounded-full border border-[var(--gym-success)]/30 bg-[var(--gym-success)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--gym-success)]">
          Save {tier.savingsPercent}% vs monthly
        </p>
      ) : (
        <p className="mt-3 inline-flex w-fit rounded-full border border-[var(--gym-border)] px-2.5 py-1 text-[11px] font-bold text-[var(--gym-text-muted)]">
          No commitment
        </p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex gap-2.5 text-sm text-[var(--gym-text-muted)]">
            <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
            {perk}
          </li>
        ))}
      </ul>

      <Link
        href="/contact"
        className={`gym-btn mt-6 w-full py-3 text-sm ${tier.featured ? "gym-btn-primary" : "gym-btn-ghost"}`}
      >
        Get Started
      </Link>
    </article>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="gym-card flex h-full flex-col p-6">
      <Quote size={26} className="text-[var(--gym-accent)]" aria-hidden />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-[var(--gym-text)]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-[var(--gym-border)] pt-4">
        <span className="gym-display flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gym-accent)]/12 text-sm text-[var(--gym-accent)]">
          {testimonial.initials}
        </span>
        <span>
          <span className="block text-sm font-bold text-[var(--gym-text)]">{testimonial.name}</span>
          <span className="block text-xs text-[var(--gym-text-muted)]">{testimonial.detail}</span>
        </span>
      </figcaption>
    </figure>
  );
}

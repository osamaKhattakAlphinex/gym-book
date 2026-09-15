import Link from "next/link";
import { Check, Quote, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { annualPrice, annualSavingsPercent } from "@/lib/marketing/content";
import type { Feature, Integration, Testimonial, Tier } from "@/lib/marketing/content";

export function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;

  return (
    <article className="gym-card gym-card-hover group relative overflow-hidden p-5">
      {/* Knurled grip rail — lights up on hover. */}
      <span className="gym-knurl absolute inset-y-0 left-0 w-[3px] opacity-25 transition group-hover:opacity-100" />

      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gym-accent)]/10 text-[var(--gym-accent)] transition group-hover:bg-[var(--gym-accent)] group-hover:text-black">
        <Icon size={24} strokeWidth={2} />
      </span>

      <h3 className="gym-display mt-4 text-xl text-[var(--gym-text)]">{feature.name}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--gym-accent)]">{feature.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--gym-text-muted)]">{feature.description}</p>
    </article>
  );
}

export function IntegrationCard({ integration }: { integration: Integration }) {
  const Icon = integration.icon;
  const builtIn = integration.status === "Built in";

  return (
    <article className="gym-card gym-card-hover flex gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]">
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="gym-display text-base text-[var(--gym-text)]">{integration.name}</h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              builtIn
                ? "border-[var(--gym-success)]/30 bg-[var(--gym-success)]/10 text-[var(--gym-success)]"
                : "border-[var(--gym-border)] bg-[var(--gym-surface-2)] text-[var(--gym-text-muted)]"
            }`}
          >
            {integration.status}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--gym-text-dim)]">
          {integration.category}
        </p>
        <p className="mt-2.5 text-sm leading-relaxed text-[var(--gym-text-muted)]">{integration.description}</p>
      </div>
    </article>
  );
}

export function PricingCard({ tier, annual = false }: { tier: Tier; annual?: boolean }) {
  const perMonth = annual ? Math.round(annualPrice(tier) / 12) : tier.monthly;

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
        {tier.memberCap}
      </p>

      <div className="mt-5">
        <span className="gym-figure text-4xl text-[var(--gym-text)]">{formatCurrency(perMonth)}</span>
        <span className="ml-1 text-sm font-medium text-[var(--gym-text-muted)]">/ month</span>
        <p className="mt-1.5 text-xs text-[var(--gym-text-muted)]">
          {annual ? `${formatCurrency(annualPrice(tier))} billed yearly` : "Billed monthly, cancel anytime"}
        </p>
      </div>

      {annual ? (
        <p className="mt-3 inline-flex w-fit rounded-full border border-[var(--gym-success)]/30 bg-[var(--gym-success)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--gym-success)]">
          Save {annualSavingsPercent()}% — two months free
        </p>
      ) : (
        <p className="mt-3 inline-flex w-fit rounded-full border border-[var(--gym-border)] px-2.5 py-1 text-[11px] font-bold text-[var(--gym-text-muted)]">
          No setup fee
        </p>
      )}

      <p className="mt-4 text-sm text-[var(--gym-text-muted)]">{tier.blurb}</p>

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
        Start free trial
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

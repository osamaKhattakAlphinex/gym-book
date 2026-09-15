import Link from "next/link";
import { ArrowRight, Star, BadgeCheck, MessageCircle, Wallet, CalendarClock } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { StatStrip, CtaBanner } from "@/components/marketing/blocks";
import { FeatureCard, TestimonialCard, PricingCard } from "@/components/marketing/cards";
import { FEATURES, TESTIMONIALS, TIERS, WORKFLOW, ASSURANCES, PRODUCT } from "@/lib/marketing/content";

export const metadata = {
  title: "GymBook | Gym management software for Pakistani gyms",
  description:
    "Memberships, renewals, WhatsApp reminders and JazzCash payments in one place. Built for gym owners still running on a register and a spreadsheet. From Rs. 2,500 a month.",
};

/** The problems the product is sold against, in the owner's own words. */
const PAINS = [
  {
    icon: CalendarClock,
    before: "You find out someone lapsed when they stop showing up.",
    after: "Every expiry is sorted a week ahead, so the follow-up list writes itself.",
  },
  {
    icon: MessageCircle,
    before: "Chasing fees means an awkward conversation at the front desk.",
    after: "A reminder lands on their WhatsApp in Urdu or English, privately.",
  },
  {
    icon: Wallet,
    before: "Renewals live in a notebook and the month's total is a guess.",
    after: "Every payment is recorded as you take it, and the report is already written.",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      {/* ------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-[var(--gym-border)]">
        <div className="gym-grid absolute inset-0" aria-hidden />
        <div className="gym-spotlight absolute inset-0" aria-hidden />
        <div className="gym-stripes absolute inset-x-0 bottom-0 h-40" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:px-8 md:py-28">
          <p className="gym-rise gym-eyebrow">Built for Pakistani gyms</p>

          <h1 className="gym-rise gym-rise-1 mx-auto mt-4 max-w-4xl text-5xl text-[var(--gym-text)] sm:text-6xl md:text-7xl">
            <span className="gym-display block">Stop chasing</span>
            <span className="gym-display block">
              fees on <span className="text-[var(--gym-accent)]">paper</span>
            </span>
          </h1>

          <p className="gym-rise gym-rise-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--gym-text-muted)] md:text-lg">
            {PRODUCT.name} tracks every membership, flags who is about to lapse, and sends the reminder over WhatsApp
            before you have to ask anyone for money in person.
          </p>

          <div className="gym-rise gym-rise-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="gym-btn gym-btn-primary px-7 py-4 text-base">
              Start free trial
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link href="/dashboard" className="gym-btn gym-btn-ghost px-7 py-4 text-base">
              See the live demo
            </Link>
          </div>

          <div className="gym-rise gym-rise-4 mt-8 flex flex-col items-center justify-center gap-3 text-sm text-[var(--gym-text-muted)] sm:flex-row sm:gap-6">
            <span className="flex items-center gap-1.5">
              <span className="flex" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={14} className="fill-[var(--gym-accent)] text-[var(--gym-accent)]" />
                ))}
              </span>
              <span className="font-semibold text-[var(--gym-text)]">4.9</span>
              from 120+ gym owners
            </span>
            <span className="hidden h-4 w-px bg-[var(--gym-border)] sm:block" aria-hidden />
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={15} className="text-[var(--gym-accent)]" />
              14-day trial, no card required
            </span>
          </div>
        </div>
      </section>

      <StatStrip />

      {/* --------------------------------------------------------- The pain */}
      <Section>
        <SectionHeading
          eyebrow="The problem"
          title={<>The register is<br className="hidden sm:block" /> costing you members</>}
          description="Most gyms here do not lose members to a better gym. They lose them to a renewal nobody remembered to ask about."
        />

        <div className="mt-10 space-y-3">
          {PAINS.map((pain) => {
            const Icon = pain.icon;
            return (
              <div
                key={pain.before}
                className="grid items-center gap-4 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-5 md:grid-cols-[auto_1fr_auto_1fr]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gym-surface-2)] text-[var(--gym-text-muted)]">
                  <Icon size={20} />
                </span>
                <p className="text-sm leading-relaxed text-[var(--gym-text-muted)] line-through decoration-[var(--gym-danger)]/50">
                  {pain.before}
                </p>
                <ArrowRight size={18} className="hidden shrink-0 text-[var(--gym-accent)] md:block" aria-hidden />
                <p className="text-sm font-semibold leading-relaxed text-[var(--gym-text)]">{pain.after}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* -------------------------------------------------------- Features */}
      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="What you get"
          title="Everything the front desk needs"
          description="One screen for members, money and machines. No modules to buy separately, no per-feature upsell."
          action={{ href: "/features", label: "All features" }}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.slug} feature={feature} />
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------- How it works */}
      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="Running by this afternoon"
          description="No installation, no training course, no consultant. Three steps and the register is history."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {WORKFLOW.map((step) => (
            <div key={step.step} className="relative rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-6">
              <span className="gym-stat block text-5xl text-[var(--gym-accent)]/25">{step.step}</span>
              <h3 className="gym-display mt-3 text-xl text-[var(--gym-text)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gym-text-muted)]">{step.body}</p>
            </div>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-5 sm:grid-cols-2 lg:grid-cols-4">
          {ASSURANCES.map((assurance) => {
            const Icon = assurance.icon;
            return (
              <li key={assurance.label} className="flex items-center gap-2.5 text-sm text-[var(--gym-text-muted)]">
                <Icon size={17} className="shrink-0 text-[var(--gym-accent)]" />
                {assurance.label}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* ---------------------------------------------------- Testimonials */}
      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading eyebrow="Owners who switched" title="What changed for them" align="center" />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </Section>

      {/* --------------------------------------------------------- Pricing */}
      <Section>
        <SectionHeading
          eyebrow="Pricing"
          title="Priced for one gym, not an enterprise"
          description="Pick by how many members you have. Every plan includes the full product — bigger plans add automation, branches and staff logins."
          action={{ href: "/pricing", label: "Compare plans" }}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}

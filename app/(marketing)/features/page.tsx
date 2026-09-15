import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { FeatureCard } from "@/components/marketing/cards";
import { FEATURES, WORKFLOW, ASSURANCES } from "@/lib/marketing/content";

export const metadata = {
  title: "Features",
  description:
    "Member directory, expiry tracking, WhatsApp reminders, JazzCash payments, equipment inventory and revenue reports — everything in GymBook.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Built around the front desk"
        description="Not a generic CRM with a gym skin. Every screen exists because a gym owner was doing it on paper first."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.slug} feature={feature} />
          ))}
        </div>
      </Section>

      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="The daily loop"
          title="What using it actually looks like"
          description="Open it in the morning, and the work for the day is already sorted into a list."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {WORKFLOW.map((step) => (
            <div key={step.step} className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-bg)] p-6">
              <span className="gym-stat block text-5xl text-[var(--gym-accent)]/25">{step.step}</span>
              <h3 className="gym-display mt-3 text-xl text-[var(--gym-text)]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gym-text-muted)]">{step.body}</p>
            </div>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ASSURANCES.map((assurance) => {
            const Icon = assurance.icon;
            return (
              <li
                key={assurance.label}
                className="flex items-center gap-2.5 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-bg)] px-4 py-3.5 text-sm text-[var(--gym-text)]"
              >
                <Icon size={17} className="shrink-0 text-[var(--gym-accent)]" />
                {assurance.label}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section>
        <div className="gym-card gym-stripes flex flex-col items-start gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="gym-display text-2xl text-[var(--gym-text)]">Would rather click than read?</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--gym-text-muted)]">
              The demo is the real product loaded with a sample gym — twenty members, live payments and reminders you can
              send. Nothing to sign up for.
            </p>
          </div>
          <Link href="/dashboard" className="gym-btn gym-btn-primary shrink-0 px-6 py-3.5 text-sm">
            Open the demo
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}

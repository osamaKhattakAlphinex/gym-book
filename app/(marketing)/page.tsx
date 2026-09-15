import Link from "next/link";
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Users,
  CalendarDays,
  Sunrise,
  BadgeCheck,
  Dumbbell,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { StatStrip, CtaBanner } from "@/components/marketing/blocks";
import { ProgramCard, TrainerCard, PricingCard, TestimonialCard } from "@/components/marketing/cards";
import {
  PROGRAMS,
  TRAINERS,
  MEMBERSHIP_TIERS,
  TESTIMONIALS,
  FACILITIES,
  GYM,
} from "@/lib/marketing/content";

export const metadata = {
  title: "Iron Peak Fitness | Strength, Conditioning & Community",
  description:
    "A strength and conditioning gym in Lahore. Coached classes seven days a week, flexible memberships from Rs. 5,000, and a free first session.",
};

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Coached, not supervised",
    body: "Every class is led by a certified coach who watches your sets and corrects your technique. Nobody here is left to figure out a rack on their own.",
  },
  {
    icon: Users,
    title: "Capped class sizes",
    body: "Sessions are capped at sixteen so a coach can reach everyone in the room. No queueing for a bench during the 6 PM rush.",
  },
  {
    icon: CalendarDays,
    title: "Train on your schedule",
    body: "Coached classes from 5 AM to 11 PM, plus open floor access all day. Shift work and school runs both fit.",
  },
  {
    icon: Sunrise,
    title: "Built for beginners too",
    body: "Every membership opens with an induction: a floor walkthrough, baseline numbers, and a four-week plan written for you.",
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
          <p className="gym-rise gym-eyebrow">{GYM.address.split(",").slice(-1)[0].trim()} · Since 2019</p>

          <h1 className="gym-rise gym-rise-1 mx-auto mt-4 max-w-4xl text-5xl text-[var(--gym-text)] sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="gym-display block">Train like</span>
            <span className="gym-display block">you <span className="text-[var(--gym-accent)]">mean it</span></span>
          </h1>

          <p className="gym-rise gym-rise-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--gym-text-muted)] md:text-lg">
            Strength, conditioning, boxing and mobility — coached properly, seven days a week.
            Bring whatever shape you are in today. We will handle the plan.
          </p>

          <div className="gym-rise gym-rise-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="gym-btn gym-btn-primary px-7 py-4 text-base">
              Start Free Trial
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
            <Link href="/pricing" className="gym-btn gym-btn-ghost px-7 py-4 text-base">
              View Memberships
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
              from 280+ reviews
            </span>
            <span className="hidden h-4 w-px bg-[var(--gym-border)] sm:block" aria-hidden />
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={15} className="text-[var(--gym-accent)]" />
              No joining fee, cancel anytime
            </span>
          </div>
        </div>
      </section>

      <StatStrip />

      {/* --------------------------------------------------------- Programs */}
      <Section>
        <SectionHeading
          eyebrow="What we train"
          title={<>Six ways to<br className="hidden sm:block" /> get stronger</>}
          description="Pick a lane or mix all six. Every program runs in coached blocks with a clear progression, so you always know what this week is building towards."
          action={{ href: "/programs", label: "All programs" }}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------- Pillars */}
      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="Why Iron Peak"
          title="A gym that actually coaches"
          description="Plenty of places will sell you a card and point at the treadmills. Here is what you get instead."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="flex gap-4 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-bg)] p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]">
                  <Icon size={21} />
                </span>
                <div>
                  <h3 className="gym-display text-lg text-[var(--gym-text)]">{pillar.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--gym-text-muted)]">{pillar.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-bg)] p-5">
          <h3 className="gym-display text-sm tracking-widest text-[var(--gym-text-muted)]">On site</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITIES.map((facility) => {
              const Icon = facility.icon;
              return (
                <li key={facility.label} className="flex items-center gap-2.5 text-sm text-[var(--gym-text-muted)]">
                  <Icon size={17} className="shrink-0 text-[var(--gym-accent)]" />
                  {facility.label}
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* --------------------------------------------------------- Trainers */}
      <Section>
        <SectionHeading
          eyebrow="Your coaches"
          title="The people on the floor"
          description="Between them, over thirty years of coaching. All four are on the floor daily — not just names on a wall."
          action={{ href: "/trainers", label: "Meet the team" }}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRAINERS.map((trainer) => (
            <TrainerCard key={trainer.name} trainer={trainer} />
          ))}
        </div>
      </Section>

      {/* -------------------------------------------------------- Pricing */}
      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="Membership"
          title="One gym, four commitments"
          description="Every plan includes the full floor, all classes and the locker room. The longer you commit, the less each month costs."
          action={{ href: "/pricing", label: "Compare plans" }}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERSHIP_TIERS.map((tier) => (
            <PricingCard key={tier.plan} tier={tier} />
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- Testimonials */}
      <Section>
        <SectionHeading
          eyebrow="Member stories"
          title="Results from the floor"
          align="center"
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[var(--gym-text-muted)]">
          <Dumbbell size={16} className="text-[var(--gym-accent)]" />
          {GYM.tagline}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}

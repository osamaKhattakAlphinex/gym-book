import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { ProgramCard } from "@/components/marketing/cards";
import { PROGRAMS } from "@/lib/marketing/content";

export const metadata = {
  title: "Programs",
  description:
    "Strength and powerlifting, HIIT, boxing, functional fitness, cardio and mobility — six coached programs at Iron Peak Fitness.",
};

const PHASES = [
  {
    step: "01",
    title: "Assess",
    body: "Your first session is a movement screen and a set of baseline numbers. No judgement, just a starting point on paper.",
  },
  {
    step: "02",
    title: "Build",
    body: "An eight-week block written around your goal and your schedule, mixing coached classes with open floor work.",
  },
  {
    step: "03",
    title: "Test",
    body: "At the end of the block we retest the same numbers. You see exactly what moved, and the next block is written from there.",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Pick your lane"
        description="Six programs, all included in every membership. Most members mix two or three across the week — strength twice, conditioning once, mobility to keep it all working."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
      </Section>

      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="How training works"
          title="Three steps, then repeat"
          description="Every member runs the same loop, whether it is your first month or your fifth year."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PHASES.map((phase) => (
            <div key={phase.step} className="relative rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-bg)] p-6">
              <span className="gym-stat block text-5xl text-[var(--gym-accent)]/25">{phase.step}</span>
              <h3 className="gym-display mt-3 text-xl text-[var(--gym-text)]">{phase.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gym-text-muted)]">{phase.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Not sure which program fits?"
        description="Come in for a free session and a coach will point you at the right one after watching you move for twenty minutes."
      />
    </>
  );
}

import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { TrainerCard } from "@/components/marketing/cards";
import { TRAINERS } from "@/lib/marketing/content";

export const metadata = {
  title: "Trainers",
  description:
    "Meet the coaching team at Iron Peak Fitness — strength, conditioning, boxing and mobility coaches with over thirty years of combined experience.",
};

const CREDENTIALS = [
  "Certified strength and conditioning coaches",
  "First aid and CPR trained, every coach",
  "Ongoing education twice a year",
  "Coach on the floor during all opening hours",
];

export default function TrainersPage() {
  return (
    <>
      <PageHero
        eyebrow="The team"
        title="Coaches, not counters"
        description="Four full-time coaches who run the classes, write the programs and remember what you lifted last week. You will train with all of them."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRAINERS.map((trainer) => (
            <TrainerCard key={trainer.name} trainer={trainer} />
          ))}
        </div>
      </Section>

      <Section className="border-t border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="Standards"
          title="What every coach here holds"
          description="Qualifications are the floor, not the ceiling — but they are a floor we do not go under."
        />

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {CREDENTIALS.map((credential) => (
            <li
              key={credential}
              className="flex items-center gap-3 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-bg)] px-4 py-3.5 text-sm text-[var(--gym-text)]"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gym-accent)]" aria-hidden />
              {credential}
            </li>
          ))}
        </ul>
      </Section>

      <CtaBanner
        title="Train with the team"
        description="Your free session is with a coach, not a sales rep. Book a time that suits you and come find out how we work."
      />
    </>
  );
}

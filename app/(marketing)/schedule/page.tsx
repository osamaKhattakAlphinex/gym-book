import { Clock3, User } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { SCHEDULE, GYM, WEEKLY_CLASS_COUNT } from "@/lib/marketing/content";

export const metadata = {
  title: "Class Schedule",
  description:
    "The full weekly class timetable at Iron Peak Fitness — strength, HIIT, boxing, cardio and mobility sessions from 5 AM to 11 PM, seven days a week.",
};

/** Program name to accent colour, so the grid is scannable by program. */
const PROGRAM_TONE: Record<string, string> = {
  Strength: "border-l-[var(--gym-accent)]",
  HIIT: "border-l-[var(--gym-warning)]",
  Boxing: "border-l-[var(--gym-danger)]",
  Cardio: "border-l-[var(--gym-success)]",
  Functional: "border-l-[var(--gym-text-muted)]",
  Mobility: "border-l-[#7dd3fc]",
};

/** Matching solid swatch for the legend — a border-only chip is too faint to read. */
const PROGRAM_SWATCH: Record<string, string> = {
  Strength: "bg-[var(--gym-accent)]",
  HIIT: "bg-[var(--gym-warning)]",
  Boxing: "bg-[var(--gym-danger)]",
  Cardio: "bg-[var(--gym-success)]",
  Functional: "bg-[var(--gym-text-muted)]",
  Mobility: "bg-[#7dd3fc]",
};

const LEGEND = ["Strength", "HIIT", "Boxing", "Cardio", "Functional", "Mobility"];

export default function SchedulePage() {
  return (
    <>
      <PageHero
        eyebrow="Timetable"
        title="Every class, every day"
        description={`${WEEKLY_CLASS_COUNT} coached sessions a week. Classes are capped at sixteen, and every one of them is included in your membership.`}
      />

      <Section>
        {/* Legend */}
        <div className="mb-8 flex flex-wrap gap-x-5 gap-y-2.5">
          {LEGEND.map((program) => (
            <span key={program} className="flex items-center gap-2 text-xs font-semibold text-[var(--gym-text-muted)]">
              <span className={`h-2.5 w-2.5 rounded-sm ${PROGRAM_SWATCH[program]}`} aria-hidden />
              {program}
            </span>
          ))}
        </div>

        {/*
         * One column per day on desktop, stacked on mobile. Rendering every day
         * rather than a tabbed view keeps this page free of client JavaScript
         * and lets a visitor scan the whole week at once.
         */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {SCHEDULE.map((day) => (
            <div key={day.day} className="gym-card overflow-hidden">
              <h2 className="gym-display border-b border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-4 py-3 text-sm tracking-widest text-[var(--gym-text)]">
                <span className="xl:hidden">{day.day}</span>
                <span className="hidden xl:inline">{day.short}</span>
              </h2>
              <ul className="divide-y divide-[var(--gym-border)]">
                {day.slots.map((slot) => (
                  <li
                    key={`${day.short}-${slot.time}-${slot.name}`}
                    className={`border-l-4 px-4 py-3.5 ${PROGRAM_TONE[slot.program] ?? "border-l-[var(--gym-border)]"}`}
                  >
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--gym-accent)]">
                      <Clock3 size={12} />
                      {slot.time}
                    </p>
                    <p className="mt-1 text-sm font-bold leading-snug text-[var(--gym-text)]">{slot.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--gym-text-muted)]">
                      <User size={11} />
                      {slot.coach}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading
          eyebrow="Opening hours"
          title="The floor is open longer than the classes"
          description="Outside class times the gym floor, locker rooms and cardio deck stay open to every member."
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {GYM.hours.map((entry) => (
            <div key={entry.days} className="rounded-xl border border-[var(--gym-border)] bg-[var(--gym-bg)] px-5 py-4">
              <p className="gym-display text-sm tracking-widest text-[var(--gym-text-muted)]">{entry.days}</p>
              <p className="gym-stat mt-2 text-xl text-[var(--gym-text)]">{entry.time}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Come to a class this week"
        description="Pick any session on the timetable and turn up as our guest. Tell us which one and we will save you a spot."
      />
    </>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/** Section heading used across the marketing pages: eyebrow, title, blurb. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  action?: { href: string; label: string };
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-4 ${
        centered ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        <p className="gym-eyebrow">{eyebrow}</p>
        <h2 className="gym-display mt-2.5 text-3xl text-[var(--gym-text)] sm:text-4xl md:text-5xl">{title}</h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--gym-text-muted)] md:text-base">{description}</p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="gym-display inline-flex shrink-0 items-center gap-1.5 text-sm tracking-wide text-[var(--gym-accent)] transition hover:gap-2.5"
        >
          {action.label}
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}

/** Consistent vertical rhythm for marketing sections. */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-14 md:px-8 md:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

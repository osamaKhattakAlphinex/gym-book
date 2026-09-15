import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/charts/Sparkline";

export type StatTone = "accent" | "success" | "warning" | "danger";

const TONE_TEXT: Record<StatTone, string> = {
  accent: "text-[var(--gym-accent)]",
  success: "text-[var(--gym-success)]",
  warning: "text-[var(--gym-warning)]",
  danger: "text-[var(--gym-danger)]",
};

const TONE_BG: Record<StatTone, string> = {
  accent: "bg-[var(--gym-accent)]/10",
  success: "bg-[var(--gym-success)]/10",
  warning: "bg-[var(--gym-warning)]/10",
  danger: "bg-[var(--gym-danger)]/10",
};

const TONE_RAIL: Record<StatTone, string> = {
  accent: "bg-[var(--gym-accent)]",
  success: "bg-[var(--gym-success)]",
  warning: "bg-[var(--gym-warning)]",
  danger: "bg-[var(--gym-danger)]",
};

/**
 * Stat tile: label · value · optional delta · optional sparkline.
 *
 * The value is set in the body sans with proportional figures rather than the
 * condensed display face — these are numbers read for precision, and the
 * condensed face costs legibility at a glance.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  tone = "accent",
  href,
  delta,
  deltaLabel,
  upIsGood = true,
  trend,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: StatTone;
  href?: string;
  /** Signed percentage change vs the named period. */
  delta?: number;
  deltaLabel?: string;
  upIsGood?: boolean;
  trend?: number[];
  hint?: string;
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta) && delta !== 0;
  const good = hasDelta ? delta > 0 === upIsGood : false;
  const DeltaIcon = hasDelta && delta > 0 ? ArrowUpRight : ArrowDownRight;

  const body = (
    <div className="gym-card gym-card-hover group relative h-full overflow-hidden p-4">
      <span className={`absolute inset-y-0 left-0 w-[3px] opacity-45 transition group-hover:opacity-100 ${TONE_RAIL[tone]}`} aria-hidden />

      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${TONE_BG[tone]} ${TONE_TEXT[tone]}`}>
          <Icon size={18} />
        </span>
        {trend && trend.length > 1 && <Sparkline points={trend} tone={tone} className="mt-1 opacity-90" />}
      </div>

      <p className="gym-figure mt-3.5 text-[26px] text-[var(--gym-text)] md:text-[30px]">{value}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-xs font-semibold text-[var(--gym-text-muted)]">{label}</p>
        {hasDelta && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
              good ? "text-[var(--gym-success)]" : "text-[var(--gym-danger)]"
            }`}
          >
            <DeltaIcon size={12} strokeWidth={2.5} />
            {Math.abs(delta)}%
            {deltaLabel && <span className="font-medium text-[var(--gym-text-dim)]"> {deltaLabel}</span>}
          </span>
        )}
      </div>

      {hint && <p className="mt-1 text-[11px] text-[var(--gym-text-dim)]">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="h-full">
        {body}
      </Link>
    );
  }
  return body;
}

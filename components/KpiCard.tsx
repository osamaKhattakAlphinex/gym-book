import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
  href?: string;
}) {
  const toneColor =
    tone === "success"
      ? "text-[var(--gym-success)] bg-[var(--gym-success)]/10"
      : tone === "warning"
        ? "text-[var(--gym-warning)] bg-[var(--gym-warning)]/10"
        : tone === "danger"
          ? "text-[var(--gym-danger)] bg-[var(--gym-danger)]/10"
          : tone === "accent"
            ? "text-[var(--gym-accent)] bg-[var(--gym-accent)]/10"
            : "text-[var(--gym-text)] bg-[var(--gym-surface-2)]";

  const rail =
    tone === "success"
      ? "bg-[var(--gym-success)]"
      : tone === "warning"
        ? "bg-[var(--gym-warning)]"
        : tone === "danger"
          ? "bg-[var(--gym-danger)]"
          : tone === "accent"
            ? "bg-[var(--gym-accent)]"
            : "bg-[var(--gym-border-strong)]";

  const content = (
    <div className="gym-card gym-card-hover group relative h-full overflow-hidden p-4">
      {/* Weight-plate rail keeps the tone readable without relying on colour alone. */}
      <span className={`absolute inset-y-0 left-0 w-[3px] opacity-40 transition group-hover:opacity-100 ${rail}`} aria-hidden />

      <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneColor}`}>
        <Icon size={18} />
      </span>
      <p className="gym-stat text-2xl text-[var(--gym-text)] md:text-3xl">{value}</p>
      <p className="mt-1.5 text-xs font-medium text-[var(--gym-text-muted)]">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="h-full">
        {content}
      </Link>
    );
  }
  return content;
}

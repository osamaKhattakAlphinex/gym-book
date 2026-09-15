export function ProgressBar({
  progress,
  variant = "accent",
  className = "",
}: {
  progress: number;
  variant?: "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const colorVar =
    variant === "success" ? "var(--gym-success)" : variant === "warning" ? "var(--gym-warning)" : variant === "danger" ? "var(--gym-danger)" : "var(--gym-accent)";
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[var(--gym-surface-2)] ${className}`}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: colorVar }}
      />
    </div>
  );
}

export function SegmentedOverview({
  active,
  expiring,
  expired,
}: {
  active: number;
  expiring: number;
  expired: number;
}) {
  const total = Math.max(1, active + expiring + expired);
  const segments = [
    { key: "active", value: active, color: "var(--gym-success)" },
    { key: "expiring", value: expiring, color: "var(--gym-warning)" },
    { key: "expired", value: expired, color: "var(--gym-danger)" },
  ];
  // A 2px gap in the surface colour separates touching segments — the gap does
  // the separating, not a stroke drawn around each one.
  return (
    <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-[var(--gym-surface-2)]">
      {segments.map((s) =>
        s.value > 0 ? (
          <div
            key={s.key}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
            className="h-full rounded-full"
          />
        ) : null
      )}
    </div>
  );
}

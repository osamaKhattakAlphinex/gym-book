/**
 * 12-point sparkline for a stat tile.
 *
 * Per the visualization rules: the series runs in a de-emphasis hue with the
 * current period picked out in the accent, and the end marker carries a ring in
 * the surface colour so it stays legible where it crosses the line.
 */
export function Sparkline({
  points,
  tone = "accent",
  className = "",
}: {
  points: number[];
  tone?: "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  if (points.length < 2) return null;

  const W = 96;
  const H = 28;
  const PAD = 3;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;

  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (points.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(v).toFixed(2)}`).join(" ");

  const stroke =
    tone === "success"
      ? "var(--gym-success)"
      : tone === "warning"
        ? "var(--gym-warning)"
        : tone === "danger"
          ? "var(--gym-danger)"
          : "var(--gym-accent)";

  const lastX = x(points.length - 1);
  const lastY = y(points[points.length - 1]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* De-emphasised history */}
      <path d={d} fill="none" stroke={stroke} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* Current point, ringed in the surface colour */}
      <circle cx={lastX} cy={lastY} r={4.5} fill="var(--gym-surface)" />
      <circle cx={lastX} cy={lastY} r={2.75} fill={stroke} />
    </svg>
  );
}

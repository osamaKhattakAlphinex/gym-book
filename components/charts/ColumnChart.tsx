"use client";

import { useId, useState } from "react";

export interface ColumnDatum {
  /** Short axis label, e.g. "Mar". */
  label: string;
  /** Full label for the tooltip and the table view, e.g. "March 2026". */
  fullLabel?: string;
  value: number;
}

/** Rounds a maximum up to a clean axis number (1 / 2 / 2.5 / 5 × 10^n). */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const scaled = value / base;
  const step = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 2.5 ? 2.5 : scaled <= 5 ? 5 : 10;
  return step * base;
}

/**
 * Single-series column chart.
 *
 * Emphasis form: the latest period carries the accent and earlier periods a
 * neutral de-emphasis gray, so the eye lands on "now" without the hue ever
 * restating the bar height. A single series needs no legend — the heading says
 * what is plotted — and the values are also exposed as a visually hidden table
 * so nothing is available on hover alone.
 */
export function ColumnChart({
  data,
  formatValue,
  caption,
  height = 160,
}: {
  data: ColumnDatum[];
  formatValue: (value: number) => string;
  caption: string;
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const tableId = useId();

  const rawMax = Math.max(0, ...data.map((d) => d.value));
  const max = niceMax(rawMax);
  const ticks = [max, max / 2, 0];

  return (
    <figure className="m-0">
      <div className="flex gap-3">
        {/* Y axis — carries the values that are not directly labelled. */}
        <div
          className="gym-tabular flex w-12 shrink-0 flex-col justify-between text-right text-[10px] font-medium text-[var(--gym-text-dim)]"
          style={{ height }}
          aria-hidden
        >
          {ticks.map((t) => (
            <span key={t} className="leading-none">
              {t >= 1000 ? `${Math.round(t / 1000)}k` : Math.round(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1" style={{ height }}>
          {/* Recessive hairline gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="h-px w-full bg-[var(--gym-border)]" />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-[2px]">
            {data.map((d, i) => {
              const pct = max > 0 ? (d.value / max) * 100 : 0;
              const isLatest = i === data.length - 1;
              const isHovered = hovered === i;

              return (
                <div
                  key={d.label}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Full-height hit target — bigger than the mark itself. */}
                  <span className="absolute inset-0" aria-hidden />

                  <div
                    className={`w-full max-w-6 rounded-t-[4px] transition-[height,background-color] duration-200 ${
                      isLatest || isHovered ? "bg-[var(--gym-accent)]" : "bg-[var(--gym-text-dim)]"
                    }`}
                    style={{ height: `${Math.max(d.value > 0 ? 2 : 0, pct)}%` }}
                  />

                  {isHovered && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--gym-border-strong)] bg-[var(--gym-bg)] px-2.5 py-1.5 text-center shadow-lg">
                      <span className="block text-[10px] font-medium text-[var(--gym-text-muted)]">
                        {d.fullLabel ?? d.label}
                      </span>
                      <span className="block text-xs font-bold text-[var(--gym-text)]">{formatValue(d.value)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* X axis */}
      <div className="mt-2 flex gap-3">
        <span className="w-12 shrink-0" aria-hidden />
        <div className="flex min-w-0 flex-1 gap-[2px]">
          {data.map((d, i) => (
            <span
              key={d.label}
              className={`flex-1 text-center text-[10px] font-semibold ${
                i === data.length - 1 ? "text-[var(--gym-text)]" : "text-[var(--gym-text-dim)]"
              }`}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="sr-only">{caption}</figcaption>
      <table id={tableId} className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.fullLabel ?? d.label}</th>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

import type { Member, PaymentRecord } from "./types";

/**
 * Derived series for the dashboard and reports.
 *
 * Pure functions over the store's arrays — both screens read the same numbers,
 * and nothing here touches React so the shapes stay easy to reason about.
 *
 * Isomorphic and dependency-free.
 */

export interface MonthPoint {
  key: string;
  /** Axis label, e.g. "Mar". */
  label: string;
  /** Tooltip / table label, e.g. "March 2026". */
  fullLabel: string;
  value: number;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Revenue per calendar month, oldest first, always `months` entries long. */
export function monthlyRevenue(payments: PaymentRecord[], now: Date, months = 6): MonthPoint[] {
  const series: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    series.push({
      key: monthKey(d),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      fullLabel: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      value: 0,
    });
  }

  const index = new Map(series.map((m) => [m.key, m]));
  for (const p of payments) {
    const entry = index.get(monthKey(new Date(p.date)));
    if (entry) entry.value += p.amount;
  }
  return series;
}

/** Revenue per day for the last `days` days, oldest first — sparkline input. */
export function dailyRevenue(payments: PaymentRecord[], now: Date, days = 12): number[] {
  const buckets = new Array<number>(days).fill(0);
  const today = startOfDay(now).getTime();
  const DAY = 86_400_000;

  for (const p of payments) {
    const paid = startOfDay(new Date(p.date)).getTime();
    const offset = Math.round((today - paid) / DAY);
    if (offset >= 0 && offset < days) {
      buckets[days - 1 - offset] += p.amount;
    }
  }
  return buckets;
}

/** Cumulative member count at the end of each of the last `months` months. */
export function memberGrowth(members: Member[], now: Date, months = 6): number[] {
  const series: number[] = [];
  for (let i = months - 1; i >= 0; i--) {
    // Exclusive upper bound: the first instant of the following month.
    const cutoff = new Date(now.getFullYear(), now.getMonth() - i + 1, 1).getTime();
    series.push(members.filter((m) => new Date(m.memberSince).getTime() < cutoff).length);
  }
  return series;
}

/** Number of members who joined in the given month. */
export function joinedInMonth(members: Member[], now: Date): number {
  const key = monthKey(now);
  return members.filter((m) => monthKey(new Date(m.memberSince)) === key).length;
}

/**
 * Signed percentage change, rounded. Returns 0 when there is no baseline to
 * compare against, so callers can simply hide the delta.
 */
export function percentDelta(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

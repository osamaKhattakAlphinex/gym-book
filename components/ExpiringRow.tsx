"use client";

import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate, initials, statusLabel } from "@/lib/utils";
import type { Member, MembershipStatus } from "@/lib/types";

const URGENCY: Record<MembershipStatus, { text: string; dot: string; chip: string }> = {
  active: {
    text: "text-[var(--gym-success)]",
    dot: "bg-[var(--gym-success)]",
    chip: "border-[var(--gym-success)]/30 bg-[var(--gym-success)]/10 text-[var(--gym-success)]",
  },
  expiring: {
    text: "text-[var(--gym-warning)]",
    dot: "bg-[var(--gym-warning)]",
    chip: "border-[var(--gym-warning)]/30 bg-[var(--gym-warning)]/10 text-[var(--gym-warning)]",
  },
  expired: {
    text: "text-[var(--gym-danger)]",
    dot: "bg-[var(--gym-danger)]",
    chip: "border-[var(--gym-danger)]/30 bg-[var(--gym-danger)]/10 text-[var(--gym-danger)]",
  },
};

/**
 * One member in the dashboard's expiring list.
 *
 * Deliberately a dense row rather than a card with two full-width buttons: a
 * gym owner scans this list for who to chase, so eight names should fit on a
 * phone screen instead of two.
 */
export function ExpiringRow({
  member,
  status,
  daysRemaining,
  onRemind,
}: {
  member: Member;
  status: MembershipStatus;
  daysRemaining: number;
  onRemind: (member: Member) => void;
}) {
  const tone = URGENCY[status];
  const outstanding = Math.max(0, member.fee - member.amountPaid);

  return (
    <div className="flex items-center gap-3 px-3 py-3 transition hover:bg-[var(--gym-surface-2)] sm:px-4">
      <span
        className={`gym-figure flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs ${tone.chip}`}
        aria-hidden
      >
        {initials(member.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[var(--gym-text)]">{member.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--gym-text-muted)]">
          <span className={`font-semibold ${tone.text}`}>{statusLabel(status, daysRemaining)}</span>
          <span aria-hidden>·</span>
          <span className="gym-tabular">{formatDate(member.expiryDate)}</span>
        </p>
      </div>

      {/* Lead with what is actually collectable; the fee alone is not news. */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="gym-tabular text-sm font-bold text-[var(--gym-text)]">
          {formatCurrency(outstanding > 0 ? outstanding : member.fee)}
        </p>
        <p className="text-[11px] text-[var(--gym-text-muted)]">{outstanding > 0 ? "Outstanding" : member.plan}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onRemind(member)}
          aria-label={`Send a reminder to ${member.name}`}
          title="Send reminder"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--gym-border)] bg-[var(--gym-surface-2)] text-[var(--gym-text-muted)] transition hover:border-[var(--gym-accent)] hover:text-[var(--gym-accent)] active:scale-95"
        >
          <MessageCircle size={16} />
        </button>
        <Link
          href={`/members/${member.id}`}
          aria-label={`Open ${member.name}'s profile`}
          title="Open member"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--gym-accent)] text-black transition hover:bg-[var(--gym-accent-strong)] active:scale-95"
        >
          <ChevronRight size={17} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

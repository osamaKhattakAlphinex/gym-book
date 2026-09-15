"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Users } from "lucide-react";
import { useGym } from "@/lib/store";
import { getMembershipStatus } from "@/lib/utils";
import { MemberCard } from "@/components/MemberCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MembershipStatus } from "@/lib/types";

type FilterKey = "all" | MembershipStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expiring", label: "Expiring" },
  { key: "expired", label: "Expired" },
];

function MembersInner() {
  const { state } = useGym();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [filter, setFilter] = useState<FilterKey>((searchParams.get("filter") as FilterKey) ?? "all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get("focus") === "1") {
      inputRef.current?.focus();
    }
  }, [searchParams]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.members
      .map((m) => ({ member: m, ...getMembershipStatus(m.expiryDate) }))
      .filter(({ status }) => filter === "all" || status === filter)
      .filter(({ member }) => !q || member.name.toLowerCase().includes(q) || member.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [state.members, query, filter]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: state.members.length, active: 0, expiring: 0, expired: 0 };
    for (const m of state.members) {
      c[getMembershipStatus(m.expiryDate).status]++;
    }
    return c;
  }, [state.members]);

  return (
    <div className="px-4 pt-5 md:px-8 md:pt-6">
      <h1 className="gym-display mb-4 text-3xl text-[var(--gym-text)]">Members</h1>

      <div className="relative mb-3">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--gym-text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone number..."
          className="w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface)] py-3 pl-10 pr-3 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]"
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === f.key
                ? "border-[var(--gym-accent)] bg-[var(--gym-accent)] text-black"
                : "border-[var(--gym-border)] bg-[var(--gym-surface)] text-[var(--gym-text-muted)]"
            }`}
          >
            {f.label} <span className="opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="Try a different search term or filter." />
      ) : (
        <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3">
          {results.map(({ member }) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={null}>
      <MembersInner />
    </Suspense>
  );
}

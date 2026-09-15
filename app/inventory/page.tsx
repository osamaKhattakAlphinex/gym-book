"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Wrench, Plus } from "lucide-react";
import { useGym } from "@/lib/store";
import { EquipmentCard } from "@/components/EquipmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EquipmentCondition } from "@/lib/types";

type FilterKey = "all" | EquipmentCondition;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Good", label: "Good" },
  { key: "Needs Repair", label: "Needs Repair" },
  { key: "Out of Service", label: "Out of Service" },
];

function InventoryInner() {
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
    return state.inventory
      .filter((item) => filter === "all" || item.condition === filter)
      .filter((item) => !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || (item.location ?? "").toLowerCase().includes(q));
  }, [state.inventory, query, filter]);

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: state.inventory.length, Good: 0, "Needs Repair": 0, "Out of Service": 0 };
    for (const item of state.inventory) c[item.condition]++;
    return c;
  }, [state.inventory]);

  return (
    <div className="px-4 pt-5 md:px-8 md:pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="gym-display text-3xl text-[var(--gym-text)]">Inventory</h1>
        <Link
          href="/inventory/new"
          className="hidden items-center gap-1.5 rounded-xl bg-[var(--gym-accent)] px-3.5 py-2 text-xs font-bold text-black md:flex"
        >
          + Add Equipment
        </Link>
      </div>

      <div className="relative mb-3">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--gym-text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search equipment, category, location..."
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
        <EmptyState icon={Wrench} title="No equipment found" description="Try a different search term or filter, or add your first piece of equipment." />
      ) : (
        <div className="space-y-2.5 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 xl:grid-cols-3">
          {results.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Link
        href="/inventory/new"
        aria-label="Add Equipment"
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gym-accent)] text-black shadow-lg shadow-[var(--gym-accent)]/30 transition active:scale-95 md:hidden"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={null}>
      <InventoryInner />
    </Suspense>
  );
}

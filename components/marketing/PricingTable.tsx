"use client";

import { useState } from "react";
import { PricingCard } from "@/components/marketing/cards";
import { TIERS, annualSavingsPercent } from "@/lib/marketing/content";

/** Plan cards with a monthly / yearly billing toggle. */
export function PricingTable() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <div className="mb-10 flex justify-center">
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--gym-border)] bg-[var(--gym-surface)] p-1"
        >
          <button
            type="button"
            onClick={() => setAnnual(false)}
            aria-pressed={!annual}
            className={`gym-display rounded-full px-4 py-2 text-xs tracking-widest transition ${
              annual ? "text-[var(--gym-text-muted)] hover:text-[var(--gym-text)]" : "bg-[var(--gym-accent)] text-black"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            aria-pressed={annual}
            className={`gym-display flex items-center gap-1.5 rounded-full px-4 py-2 text-xs tracking-widest transition ${
              annual ? "bg-[var(--gym-accent)] text-black" : "text-[var(--gym-text-muted)] hover:text-[var(--gym-text)]"
            }`}
          >
            Yearly
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                annual ? "bg-black/15 text-black" : "bg-[var(--gym-success)]/15 text-[var(--gym-success)]"
              }`}
            >
              -{annualSavingsPercent()}%
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} annual={annual} />
        ))}
      </div>
    </>
  );
}

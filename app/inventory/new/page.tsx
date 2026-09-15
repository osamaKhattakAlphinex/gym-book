"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useGym } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { EQUIPMENT_CATEGORIES, EQUIPMENT_CONDITIONS, formatDateInput } from "@/lib/utils";
import type { EquipmentCategory, EquipmentCondition } from "@/lib/types";

export default function AddEquipmentPage() {
  const { addEquipment } = useGym();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("Cardio");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<EquipmentCondition>("Good");
  const [location, setLocation] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(formatDateInput(new Date()));
  const [notes, setNotes] = useState("");

  const canSubmit = name.trim().length > 1 && quantity > 0;

  const submit = () => {
    if (!canSubmit) return;
    const item = addEquipment({
      name: name.trim(),
      category,
      quantity,
      condition,
      location: location || undefined,
      purchaseDate: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
      notes: notes || undefined,
    });
    showToast("Equipment added successfully.");
    router.push(`/inventory/${item.id}`);
  };

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="gym-display mb-1 text-3xl text-[var(--gym-text)]">Add Equipment</h1>
      <p className="mb-6 text-sm text-[var(--gym-text-muted)]">Register a new machine or accessory in your inventory.</p>

      <div className="mx-auto max-w-xl space-y-6">
        <Section title="Details">
          <Field label="Equipment Name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Treadmill" className={inputClass} />
          </Field>
          <Field label="Category">
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                    category === c ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className={inputClass}
              />
            </Field>
            <Field label="Location (optional)">
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Cardio Zone" className={inputClass} />
            </Field>
          </div>
          <Field label="Purchase Date (optional)">
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputClass} />
          </Field>
        </Section>

        <Section title="Condition">
          <div className="flex gap-2">
            {EQUIPMENT_CONDITIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition ${
                  condition === c ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Serial number, warranty info"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Section>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gym-accent)] py-3.5 text-sm font-bold text-black transition active:scale-[0.98] disabled:opacity-40"
        >
          <CheckCircle2 size={18} />
          Add Equipment
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3.5 py-2.5 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
      <h2 className="mb-3.5 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">{title}</h2>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">
        {label} {required && <span className="text-[var(--gym-danger)]">*</span>}
      </span>
      {children}
    </label>
  );
}

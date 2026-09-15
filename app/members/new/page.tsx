"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useGym, computeExpiry } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { PLANS, PLAN_FEES, formatDateInput } from "@/lib/utils";
import type { Gender, PaymentMethod, PaymentStatus, Plan } from "@/lib/types";

export default function AddMemberPage() {
  const { addMember } = useGym();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+92 3");
  const [gender, setGender] = useState<Gender>("Male");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [plan, setPlan] = useState<Plan>("Monthly");
  const [startDate, setStartDate] = useState(formatDateInput(new Date()));

  const [fee, setFee] = useState(PLAN_FEES.Monthly);
  const [amountPaid, setAmountPaid] = useState(PLAN_FEES.Monthly);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [manualStatus, setManualStatus] = useState<PaymentStatus | null>(null);

  const expiryDate = useMemo(() => computeExpiry(plan, new Date(startDate).toISOString()), [plan, startDate]);

  const autoStatus: PaymentStatus = amountPaid >= fee && fee > 0 ? "Paid" : amountPaid > 0 ? "Partial" : "Pending";
  const paymentStatus = manualStatus ?? autoStatus;

  const canSubmit = name.trim().length > 1 && phone.trim().length > 6;

  const onSelectPlan = (p: Plan) => {
    setPlan(p);
    setFee(PLAN_FEES[p]);
    setAmountPaid(PLAN_FEES[p]);
    setManualStatus(null);
  };

  const submit = () => {
    if (!canSubmit) return;
    const member = addMember({
      name: name.trim(),
      phone: phone.trim(),
      gender,
      dob: dob || undefined,
      address: address || undefined,
      notes: notes || undefined,
      plan,
      startDate: new Date(startDate).toISOString(),
      expiryDate,
      fee,
      amountPaid,
      paymentMethod: method,
      paymentStatus,
    });
    showToast("Member added successfully.");
    router.push(`/members/${member.id}`);
  };

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="gym-display mb-1 text-3xl text-[var(--gym-text)]">Add Member</h1>
      <p className="mb-6 text-sm text-[var(--gym-text-muted)]">Fill in the details to register a new member.</p>

      <div className="mx-auto max-w-xl space-y-6">
        <Section title="Profile">
          <Field label="Full Name" required>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahmed Khan" className={inputClass} />
          </Field>
          <Field label="Phone Number" required>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" className={inputClass} />
          </Field>
          <Field label="Gender">
            <div className="flex gap-2">
              {(["Male", "Female", "Other"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                    gender === g ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Date of Birth (optional)">
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Address (optional)">
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House / street / city" className={inputClass} />
          </Field>
        </Section>

        <Section title="Membership">
          <Field label="Membership Plan">
            <div className="grid grid-cols-2 gap-2">
              {PLANS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectPlan(p)}
                  className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                    plan === p ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Expiry Date">
              <input readOnly value={formatDateInput(expiryDate)} className={`${inputClass} opacity-70`} />
            </Field>
          </div>
        </Section>

        <Section title="Payment">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Membership Fee">
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </Field>
            <Field label="Amount Paid">
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => {
                  setAmountPaid(Number(e.target.value) || 0);
                  setManualStatus(null);
                }}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Payment Method">
            <div className="flex gap-2">
              {(["Cash", "Bank Transfer", "Other"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition ${
                    method === m ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Payment Status">
            <div className="flex gap-2">
              {(["Paid", "Partially Paid", "Pending"] as const).map((s) => {
                const value: PaymentStatus = s === "Partially Paid" ? "Partial" : (s as PaymentStatus);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setManualStatus(value)}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition ${
                      paymentStatus === value ? "border-[var(--gym-accent)] bg-[var(--gym-accent)]/10 text-[var(--gym-accent)]" : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Field>
        </Section>

        <Section title="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Prefers evening workouts"
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
          Add Member
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

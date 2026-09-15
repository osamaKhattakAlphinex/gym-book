"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { waMeLink } from "@/lib/whatsapp/templates";
import { tryNormalizePhone } from "@/lib/integrations/phone";
import { PRODUCT, TIERS } from "@/lib/marketing/content";

const SIZES = ["Under 100 members", "100 – 400 members", "400 – 1,000 members", "Over 1,000 members", "Opening soon"];

const TRACKING = ["A paper register", "Excel or Google Sheets", "Another software", "Nothing yet"];

/**
 * Trial / demo enquiry form.
 *
 * There is no public enquiries backend yet, so rather than pretend to submit,
 * this composes the enquiry as a WhatsApp message to the sales number — the
 * same pre-filled `wa.me` approach the product itself uses for reminders, and
 * the channel Pakistani gym owners actually reply on.
 */
export function TrialForm() {
  const [name, setName] = useState("");
  const [gym, setGym] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState(SIZES[1]);
  const [tracking, setTracking] = useState(TRACKING[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const salesNumber = tryNormalizePhone(PRODUCT.salesPhone);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!gym.trim()) {
      setError("Please tell us your gym's name.");
      return;
    }
    if (!tryNormalizePhone(phone)) {
      setError("Please enter a valid Pakistani mobile number, e.g. 0300 1234567.");
      return;
    }
    if (!salesNumber) {
      setError("We could not open WhatsApp. Please call us instead.");
      return;
    }

    setError(null);

    const message = [
      `Hi ${PRODUCT.name}, I would like to start a free trial.`,
      "",
      `Name: ${name.trim()}`,
      `Gym: ${gym.trim()}`,
      `Phone: ${phone.trim()}`,
      `Gym size: ${size}`,
      `Currently tracking with: ${tracking}`,
      note.trim() ? `Note: ${note.trim()}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.open(waMeLink(salesNumber.msisdn, message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const fieldClass =
    "w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-bg)] px-3.5 py-3 text-sm text-[var(--gym-text)] outline-none transition focus:border-[var(--gym-accent)]";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--gym-text-muted)]";

  return (
    <form onSubmit={onSubmit} className="gym-card p-6">
      <h2 className="gym-display text-2xl text-[var(--gym-text)]">Start your free trial</h2>
      <p className="mt-1.5 text-sm text-[var(--gym-text-muted)]">
        Fourteen days on your own member list, no card. Fill this in and we will open WhatsApp with your details ready to
        send.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="trial-name" className={labelClass}>
            Your name
          </label>
          <input
            id="trial-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ahmed Khan"
            autoComplete="name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="trial-gym" className={labelClass}>
            Gym name
          </label>
          <input
            id="trial-gym"
            value={gym}
            onChange={(e) => setGym(e.target.value)}
            placeholder="Iron Peak Fitness"
            autoComplete="organization"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="trial-phone" className={labelClass}>
            Mobile number
          </label>
          <input
            id="trial-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0300 1234567"
            inputMode="tel"
            autoComplete="tel"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="trial-size" className={labelClass}>
            How many members?
          </label>
          <select id="trial-size" value={size} onChange={(e) => setSize(e.target.value)} className={fieldClass}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="trial-tracking" className={labelClass}>
            How do you track them today?
          </label>
          <select
            id="trial-tracking"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className={fieldClass}
          >
            {TRACKING.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="trial-note" className={labelClass}>
            Anything we should know? <span className="font-medium normal-case text-[var(--gym-text-dim)]">(optional)</span>
          </label>
          <textarea
            id="trial-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Questions, or what you need it to do"
            className={`${fieldClass} resize-none`}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--gym-danger)]">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </p>
      )}

      {sent && !error && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--gym-success)]">
          <CheckCircle2 size={16} className="shrink-0" />
          WhatsApp opened — press send and we will set your account up today.
        </p>
      )}

      <button type="submit" className="gym-btn gym-btn-primary mt-6 w-full py-3.5 text-sm">
        Send on WhatsApp
        <Send size={16} strokeWidth={2.5} />
      </button>

      <p className="mt-3 text-center text-xs text-[var(--gym-text-dim)]">
        Plans from {new Intl.NumberFormat("en-US").format(TIERS[0].monthly)} PKR a month. Prefer to talk? Call{" "}
        <a href={`tel:${PRODUCT.salesPhone.replace(/\s/g, "")}`} className="font-semibold text-[var(--gym-text-muted)] underline">
          {PRODUCT.salesPhone}
        </a>
      </p>
    </form>
  );
}

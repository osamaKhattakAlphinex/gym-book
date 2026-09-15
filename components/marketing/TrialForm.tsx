"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { waMeLink } from "@/lib/whatsapp/templates";
import { tryNormalizePhone } from "@/lib/integrations/phone";
import { GYM, PROGRAMS } from "@/lib/marketing/content";

const TIMES = ["Early morning (5–8 AM)", "Morning (8–11 AM)", "Afternoon (12–4 PM)", "Evening (5–8 PM)", "Late evening (8–11 PM)"];

/**
 * Free-trial enquiry form.
 *
 * There is no public enquiries backend yet, so rather than pretend to submit,
 * this composes the enquiry as a WhatsApp message to the gym — the same
 * pre-filled `wa.me` approach the owner's reminder flow already uses, and the
 * channel a Pakistani gym actually gets booked through.
 */
export function TrialForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [program, setProgram] = useState(PROGRAMS[0].name);
  const [time, setTime] = useState(TIMES[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const gymNumber = tryNormalizePhone(GYM.phone);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (!tryNormalizePhone(phone)) {
      setError("Please enter a valid Pakistani mobile number, e.g. 0300 1234567.");
      return;
    }
    if (!gymNumber) {
      setError("We could not open WhatsApp. Please call us instead.");
      return;
    }

    setError(null);

    const message = [
      `Hi ${GYM.name}, I would like to book a free trial session.`,
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Interested in: ${program}`,
      `Preferred time: ${time}`,
      note.trim() ? `Note: ${note.trim()}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.open(waMeLink(gymNumber.msisdn, message), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const fieldClass =
    "w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-bg)] px-3.5 py-3 text-sm text-[var(--gym-text)] outline-none transition focus:border-[var(--gym-accent)]";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--gym-text-muted)]";

  return (
    <form onSubmit={onSubmit} className="gym-card p-6">
      <h2 className="gym-display text-2xl text-[var(--gym-text)]">Book your free session</h2>
      <p className="mt-1.5 text-sm text-[var(--gym-text-muted)]">
        Fill this in and we will open WhatsApp with your details ready to send.
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
          <label htmlFor="trial-program" className={labelClass}>
            What do you want to try?
          </label>
          <select id="trial-program" value={program} onChange={(e) => setProgram(e.target.value)} className={fieldClass}>
            {PROGRAMS.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
            <option value="Not sure yet">Not sure yet — recommend something</option>
          </select>
        </div>

        <div>
          <label htmlFor="trial-time" className={labelClass}>
            When can you train?
          </label>
          <select id="trial-time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass}>
            {TIMES.map((t) => (
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
            placeholder="Injuries, goals, or questions"
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
          WhatsApp opened — press send and we will confirm your slot.
        </p>
      )}

      <button type="submit" className="gym-btn gym-btn-primary mt-6 w-full py-3.5 text-sm">
        Send on WhatsApp
        <Send size={16} strokeWidth={2.5} />
      </button>

      <p className="mt-3 text-center text-xs text-[var(--gym-text-dim)]">
        Prefer to talk? Call{" "}
        <a href={`tel:${GYM.phone.replace(/\s/g, "")}`} className="font-semibold text-[var(--gym-text-muted)] underline">
          {GYM.phone}
        </a>
      </p>
    </form>
  );
}

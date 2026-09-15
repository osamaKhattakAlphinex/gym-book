"use client";

import { useState } from "react";
import { Bell, Database, LogOut, MessageSquare, Plug, RotateCcw } from "lucide-react";
import { useGym } from "@/lib/store";
import { PLAN_FEES, PLANS, formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IntegrationsPanel } from "@/components/IntegrationsPanel";

export default function SettingsPage() {
  const { state, updateSettings, resetDemoData } = useGym();
  const { showToast } = useToast();

  const [gymName, setGymName] = useState(state.settings.gymName);
  const [ownerName, setOwnerName] = useState(state.settings.ownerName);
  const [phone, setPhone] = useState(state.settings.phone);
  const [reminderMessage, setReminderMessage] = useState(state.settings.reminderMessage);
  const [notifyExpiring, setNotifyExpiring] = useState(state.settings.notifyExpiring);
  const [notifyPayments, setNotifyPayments] = useState(state.settings.notifyPayments);

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const save = () => {
    updateSettings({ gymName, ownerName, phone, reminderMessage, notifyExpiring, notifyPayments });
    showToast("Settings saved.");
  };

  return (
    <div className="px-4 pb-10 pt-5 md:px-8 md:pt-6">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-[var(--gym-text)]">Settings</h1>

      <div className="mx-auto max-w-xl space-y-5">
        <Section title="Gym Profile">
          <Field label="Gym Name">
            <input value={gymName} onChange={(e) => setGymName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Owner Name">
            <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Phone Number">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Currency">
            <div className="rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3.5 py-2.5 text-sm font-semibold text-[var(--gym-text)]">
              PKR — Rs.
            </div>
          </Field>
        </Section>

        <Section title="Membership Plans" icon={Database}>
          <div className="divide-y divide-[var(--gym-border)]">
            {PLANS.map((p) => (
              <div key={p} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold text-[var(--gym-text)]">{p}</span>
                <span className="font-bold text-[var(--gym-accent)]">{formatCurrency(PLAN_FEES[p])}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Reminder Settings" icon={MessageSquare}>
          <Field label="Default Reminder Message">
            <textarea
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          <p className="text-xs text-[var(--gym-text-muted)]">
            Placeholders: {"{name}"}, {"{firstName}"}, {"{gym}"}, {"{date}"}, {"{amount}"}, {"{plan}"}, {"{link}"}.
          </p>
        </Section>

        <Section title="Integrations" icon={Plug}>
          <IntegrationsPanel />
        </Section>

        <Section title="Notification Settings" icon={Bell}>
          <ToggleRow label="Expiring membership alerts" checked={notifyExpiring} onChange={setNotifyExpiring} />
          <ToggleRow label="Payment notifications" checked={notifyPayments} onChange={setNotifyPayments} />
        </Section>

        <button onClick={save} className="w-full rounded-xl bg-[var(--gym-accent)] py-3.5 text-sm font-bold text-black transition active:scale-[0.98]">
          Save Settings
        </button>

        <Section title="Data & Backup" icon={Database}>
          <button
            onClick={() => showToast("Export ready — check your downloads.")}
            className="w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-2.5 text-sm font-semibold text-[var(--gym-text)]"
          >
            Export Data
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-2.5 text-sm font-semibold text-[var(--gym-text)]"
          >
            <RotateCcw size={14} />
            Reset Demo Data
          </button>
        </Section>

        <button
          onClick={() => setConfirmLogout(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gym-danger)]/40 bg-[var(--gym-danger)]/10 py-3 text-sm font-bold text-[var(--gym-danger)]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        description="This will restore the original sample members, payments and activity, discarding anything you've added."
        confirmLabel="Reset"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirmReset(false);
          showToast("Demo data reset.");
        }}
      />

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        description="You will need to sign in again to access the dashboard."
        confirmLabel="Logout"
        destructive
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          showToast("Logged out.");
        }}
      />
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] px-3.5 py-2.5 text-sm text-[var(--gym-text)] outline-none focus:border-[var(--gym-accent)]";

function Section({ title, icon: Icon, children }: { title: string; icon?: typeof Bell; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-4">
      <h2 className="mb-3.5 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--gym-text-muted)]">
        {Icon && <Icon size={14} />}
        {title}
      </h2>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--gym-text)]">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-[var(--gym-text)]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[var(--gym-accent)]" : "bg-[var(--gym-surface-2)] border border-[var(--gym-border)]"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

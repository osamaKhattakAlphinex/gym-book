"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Loader2, RefreshCw } from "lucide-react";
import { fetchIntegrationStatus, type IntegrationStatus } from "@/lib/client/messaging";

/**
 * Live integration status for the Settings screen.
 *
 * The whole point of the env-driven design is that nobody has to read code to
 * find out whether payments and reminders are live. This panel names the exact
 * variables that are still missing, so a deploy is a copy-paste away from
 * working. It only ever shows variable *names* — the server never sends values.
 */
export function IntegrationsPanel() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    let alive = true;
    fetchIntegrationStatus().then((s) => {
      if (!alive) return;
      setStatus(s);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(load, [load]);

  const recheck = () => {
    setLoading(true);
    load();
  };

  if (loading && !status) {
    return (
      <p className="flex items-center gap-2 text-sm text-[var(--gym-text-muted)]">
        <Loader2 size={14} className="animate-spin" />
        Checking integrations…
      </p>
    );
  }

  if (!status) {
    return <p className="text-sm text-[var(--gym-text-muted)]">Could not reach the server to check integrations.</p>;
  }

  const wa = status.whatsApp;
  const jc = status.jazzCash;

  return (
    <div className="space-y-4">
      <Row
        title="WhatsApp"
        live={wa.configured}
        liveLabel={wa.dryRun ? "Test mode" : wa.provider === "meta" ? "Cloud API" : "Twilio"}
        offLabel="Manual (wa.me links)"
      >
        {wa.configured ? (
          <p className="text-xs text-[var(--gym-text-muted)]">
            Reminders and receipts are delivered automatically.
            {wa.dryRun && " Dry run is on — messages are logged, not sent."}
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--gym-text-muted)]">
              Reminders still work — WhatsApp opens with the message ready and you tap send. To deliver them
              automatically, set either the Meta or the Twilio variables:
            </p>
            <VarList label="WhatsApp Cloud API" vars={wa.providers.meta.missing} />
            <VarList label="Twilio" vars={wa.providers.twilio.missing} />
          </>
        )}
        <p className="mt-2 break-all text-[11px] text-[var(--gym-text-muted)]">Webhook URL: {wa.webhookUrl}</p>
      </Row>

      <Row
        title="JazzCash"
        live={jc.configured}
        liveLabel={jc.environment === "live" ? "Live" : "Sandbox"}
        offLabel="Not configured"
      >
        {jc.configured ? (
          <p className="text-xs text-[var(--gym-text-muted)]">
            Merchant {jc.merchantId} · {jc.environment}. Members can pay by wallet, Raast or card.
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--gym-text-muted)]">
              Cash entry works as normal. Add these to enable online payment links:
            </p>
            <VarList label="JazzCash" vars={jc.missing} />
          </>
        )}
        <p className="mt-2 break-all text-[11px] text-[var(--gym-text-muted)]">Return URL: {jc.returnUrl}</p>
      </Row>

      <button
        onClick={recheck}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] py-2.5 text-sm font-semibold text-[var(--gym-text)] disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
        Re-check
      </button>
    </div>
  );
}

function Row({
  title,
  live,
  liveLabel,
  offLabel,
  children,
}: {
  title: string;
  live: boolean;
  liveLabel: string;
  offLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--gym-border)] bg-[var(--gym-surface-2)] p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-[var(--gym-text)]">{title}</span>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            live
              ? "border-[var(--gym-success)]/40 bg-[var(--gym-success)]/10 text-[var(--gym-success)]"
              : "border-[var(--gym-border)] text-[var(--gym-text-muted)]"
          }`}
        >
          {live ? <CheckCircle2 size={11} /> : <CircleDashed size={11} />}
          {live ? liveLabel : offLabel}
        </span>
      </div>
      {children}
    </div>
  );
}

function VarList({ label, vars }: { label: string; vars: string[] }) {
  if (vars.length === 0) return null;
  return (
    <div className="mt-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--gym-text-muted)]">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {vars.map((name) => (
          <li key={name} className="font-mono text-[11px] text-[var(--gym-warning)]">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

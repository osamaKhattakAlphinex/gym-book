"use client";

import type { MessageKind, MessageLanguage, MessageParams, SendMessageResult } from "@/lib/whatsapp/types";

/**
 * Browser-side wrappers around the integration routes.
 *
 * These never throw: every screen that sends a reminder or starts a payment
 * needs something to show the owner, including "WhatsApp isn't set up yet,
 * here's the link — tap send". Error handling lives here so the components
 * stay about layout.
 */

export interface IntegrationStatus {
  appBaseUrl: string;
  jazzCash: {
    configured: boolean;
    environment: "sandbox" | "live";
    missing: string[];
    returnUrl: string;
    merchantId: string | null;
  };
  whatsApp: {
    configured: boolean;
    provider: "meta" | "twilio" | "link";
    dryRun: boolean;
    missing: string[];
    forcedProviderUnavailable: string | null;
    webhookUrl: string;
    providers: {
      meta: { configured: boolean; missing: string[] };
      twilio: { configured: boolean; missing: string[] };
    };
  };
}

export async function fetchIntegrationStatus(): Promise<IntegrationStatus | null> {
  try {
    const response = await fetch("/api/integrations/status", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as IntegrationStatus;
  } catch {
    return null;
  }
}

export interface SendWhatsAppInput {
  to: string;
  kind: MessageKind;
  message?: string;
  language?: MessageLanguage;
  params?: Partial<MessageParams>;
  reference?: string;
}

export async function sendWhatsApp(input: SendWhatsAppInput): Promise<SendMessageResult> {
  try {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json()) as { result?: SendMessageResult; error?: string };
    if (body.result) return body.result;

    return {
      status: "failed",
      channel: "link",
      message: input.message ?? "",
      to: input.to,
      error: body.error ?? `Send failed (HTTP ${response.status})`,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "failed",
      channel: "link",
      message: input.message ?? "",
      to: input.to,
      error: error instanceof Error ? error.message : "Network error",
      sentAt: new Date().toISOString(),
    };
  }
}

export interface CheckoutInput {
  amount: number;
  description?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
}

export interface CheckoutResponse {
  txnRefNo: string;
  action: string;
  fields: Record<string, string>;
  amount: number;
  expiresAt: string;
  environment: "sandbox" | "live";
  payUrl: string;
}

export async function createJazzCashCheckout(
  input: CheckoutInput
): Promise<{ ok: true; checkout: CheckoutResponse } | { ok: false; error: string; missing?: string[] }> {
  try {
    const response = await fetch("/api/jazzcash/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = await response.json();
    if (!response.ok) {
      return { ok: false, error: body.error ?? `Checkout failed (HTTP ${response.status})`, missing: body.missing };
    }
    return { ok: true, checkout: body as CheckoutResponse };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

/**
 * Posts a signed JazzCash field set from the browser.
 *
 * JazzCash's hosted checkout only accepts a form POST, so this builds one on
 * the fly rather than navigating to a URL.
 */
export function submitJazzCashForm(action: string, fields: Record<string, string>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

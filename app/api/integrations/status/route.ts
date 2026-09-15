import { NextResponse } from "next/server";
import { appBaseUrl, jazzCashConfig, whatsAppConfig } from "@/lib/integrations/config";

export const dynamic = "force-dynamic";

/**
 * What is wired up right now.
 *
 * The Settings screen calls this so the owner (or whoever is deploying) can
 * see at a glance whether JazzCash and WhatsApp are live, and exactly which
 * environment variables are still missing if they are not.
 *
 * Only names are returned — never a token, password or salt.
 */
export async function GET() {
  const jazzCash = jazzCashConfig();
  const whatsApp = whatsAppConfig();

  return NextResponse.json({
    appBaseUrl: appBaseUrl(),
    jazzCash: {
      configured: jazzCash.configured,
      environment: jazzCash.environment,
      missing: jazzCash.missing,
      returnUrl: jazzCash.returnUrl,
      merchantId: jazzCash.merchantId ? `${jazzCash.merchantId.slice(0, 4)}••••` : null,
    },
    whatsApp: {
      configured: whatsApp.configured,
      provider: whatsApp.provider,
      dryRun: whatsApp.dryRun,
      missing: whatsApp.missing,
      forcedProviderUnavailable: whatsApp.forcedProviderUnavailable ?? null,
      webhookUrl: `${appBaseUrl()}/api/whatsapp/webhook`,
      providers: {
        meta: { configured: whatsApp.meta.configured, missing: whatsApp.meta.missing },
        twilio: { configured: whatsApp.twilio.configured, missing: whatsApp.twilio.missing },
      },
    },
  });
}

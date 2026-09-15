import { NextResponse } from "next/server";
import { whatsAppConfig } from "@/lib/integrations/config";
import { parseMetaWebhook, parseTwilioWebhook, verifyMetaSignature } from "@/lib/whatsapp";
import type { InboundMessageEvent } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

/**
 * Inbound WhatsApp webhook — one endpoint for both providers.
 *
 * Point either provider's callback URL at `/api/whatsapp/webhook`:
 *   - Meta verifies ownership with a GET carrying `hub.challenge`, then POSTs
 *     JSON signed with `X-Hub-Signature-256`;
 *   - Twilio POSTs form-encoded status callbacks and replies.
 *
 * The content type tells them apart, so nothing has to be configured to
 * choose between them.
 */

/** Meta's subscription handshake. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = whatsAppConfig().meta.verifyToken;

  if (!expected) {
    return NextResponse.json({ error: "WHATSAPP_VERIFY_TOKEN is not set" }, { status: 503 });
  }
  if (mode === "subscribe" && token === expected && challenge) {
    // Meta requires the raw challenge back as text/plain.
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const config = whatsAppConfig();
  let events: InboundMessageEvent[] = [];

  if (contentType.includes("application/x-www-form-urlencoded")) {
    events = parseTwilioWebhook(new URLSearchParams(await request.text()));
  } else {
    // Meta signs the exact bytes, so read the body as text before parsing.
    const raw = await request.text();

    if (config.meta.appSecret) {
      const signature = request.headers.get("x-hub-signature-256");
      if (!verifyMetaSignature(raw, signature, config.meta.appSecret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    try {
      events = parseMetaWebhook(JSON.parse(raw));
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  for (const event of events) {
    if (event.statusUpdate) {
      console.info("[whatsapp] delivery %s for %s", event.statusUpdate.status, event.statusUpdate.messageId);
    } else {
      console.info("[whatsapp] inbound from %s: %s", event.from, event.text ?? "(no text)");
    }
  }

  // Both providers retry on a non-2xx, so acknowledge even when there is
  // nothing to do with the event.
  return NextResponse.json({ received: events.length });
}

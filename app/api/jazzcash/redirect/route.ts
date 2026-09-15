import { NextResponse } from "next/server";
import { jazzCashConfig } from "@/lib/integrations/config";
import { signStoredCheckout, JazzCashNotConfiguredError } from "@/lib/jazzcash/client";
import { getTransaction } from "@/lib/server/transactionStore";

export const dynamic = "force-dynamic";

/**
 * Hands a stored transaction over to JazzCash.
 *
 * JazzCash's hosted checkout is a form POST, not a URL you can link to, so
 * this returns a tiny self-submitting page. That is what makes the WhatsApp
 * payment link (`/pay/<ref>`) work: the member taps a normal link, lands here,
 * and JazzCash's own page opens with the amount already filled in.
 *
 * The signature is recomputed on every request from the merchant password in
 * the environment, so nothing secret has to be stored to keep a link payable.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  const txnRefNo = new URL(request.url).searchParams.get("ref");
  if (!txnRefNo) return NextResponse.json({ error: "'ref' query parameter is required" }, { status: 400 });

  const record = await getTransaction(txnRefNo);
  if (!record?.checkoutFields) {
    return NextResponse.json({ error: "Unknown or expired payment link" }, { status: 404 });
  }
  if (record.status === "successful") {
    return NextResponse.json({ error: "This payment has already been completed" }, { status: 409 });
  }

  try {
    const { action, fields } = signStoredCheckout(record.checkoutFields, jazzCashConfig());

    const inputs = Object.entries(fields)
      .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
      .join("\n    ");

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Opening JazzCash…</title>
  <style>
    body { margin:0; display:grid; place-items:center; min-height:100dvh;
           font:600 15px/1.5 system-ui, sans-serif; background:#0a0b0c; color:#e8e9ea; }
    .box { text-align:center; padding:24px; }
    .spin { width:34px; height:34px; margin:0 auto 14px; border-radius:50%;
            border:3px solid #2a2d31; border-top-color:#c8f04b; animation:s .8s linear infinite; }
    @keyframes s { to { transform:rotate(360deg); } }
    button { margin-top:14px; padding:10px 18px; border:0; border-radius:10px;
             background:#c8f04b; color:#000; font:700 14px system-ui; cursor:pointer; }
  </style>
</head>
<body>
  <form id="jazzcash" method="POST" action="${escapeHtml(action)}">
    ${inputs}
    <div class="box">
      <div class="spin"></div>
      <p>Taking you to JazzCash…</p>
      <noscript><button type="submit">Continue to JazzCash</button></noscript>
    </div>
  </form>
  <script>document.getElementById('jazzcash').submit();</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof JazzCashNotConfiguredError) {
      return NextResponse.json({ error: error.message, missing: error.missing }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Could not open JazzCash";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { appBaseUrl, jazzCashConfig } from "@/lib/integrations/config";
import { buildCheckout, checkoutPageUrl, stripSecrets, JazzCashNotConfiguredError } from "@/lib/jazzcash/client";
import { saveTransaction } from "@/lib/server/transactionStore";
import { checkApiSecret } from "@/lib/server/apiAuth";

export const dynamic = "force-dynamic";

interface CheckoutBody {
  amount?: number;
  description?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  billReference?: string;
  returnUrl?: string;
  metadata?: string[];
}

/**
 * Creates a JazzCash hosted-checkout transaction.
 *
 * Returns the signed form fields (POST them from the browser) *and* a
 * shareable `payUrl` the owner can send on WhatsApp — the member opens it on
 * their phone and pays with JazzCash wallet, Easypaisa, Raast or a card.
 */
export async function POST(request: Request) {
  const auth = checkApiSecret(request);
  if (!auth.ok) return auth.response;

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "'amount' must be a positive number of rupees" }, { status: 400 });
  }

  const config = jazzCashConfig();

  try {
    const checkout = buildCheckout(
      {
        amount,
        description: body.description ?? "Gym membership fee",
        billReference: body.billReference ?? body.memberId,
        memberId: body.memberId,
        memberName: body.memberName,
        memberPhone: body.memberPhone,
        returnUrl: body.returnUrl,
        metadata: body.metadata ?? [body.memberId ?? "", body.memberName ?? ""].filter(Boolean),
      },
      config
    );

    await saveTransaction({
      txnRefNo: checkout.txnRefNo,
      kind: "checkout",
      status: "pending",
      amount,
      description: body.description ?? "Gym membership fee",
      billReference: body.billReference ?? body.memberId,
      memberId: body.memberId,
      memberName: body.memberName,
      memberPhone: body.memberPhone,
      environment: config.environment,
      checkoutFields: stripSecrets(checkout.fields),
    });

    return NextResponse.json({
      txnRefNo: checkout.txnRefNo,
      action: checkout.action,
      fields: checkout.fields,
      amount: checkout.amount,
      expiresAt: checkout.expiresAt,
      environment: config.environment,
      payUrl: checkoutPageUrl(checkout.txnRefNo, appBaseUrl()),
    });
  } catch (error) {
    if (error instanceof JazzCashNotConfiguredError) {
      return NextResponse.json({ error: error.message, missing: error.missing }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Could not create the JazzCash transaction";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { jazzCashConfig } from "@/lib/integrations/config";
import { chargeWallet, JazzCashNotConfiguredError } from "@/lib/jazzcash/client";
import { saveTransaction, updateTransaction } from "@/lib/server/transactionStore";
import { checkApiSecret } from "@/lib/server/apiAuth";

export const dynamic = "force-dynamic";

interface WalletBody {
  amount?: number;
  mobileNumber?: string;
  cnic?: string;
  description?: string;
  memberId?: string;
  memberName?: string;
  billReference?: string;
}

/**
 * Charges a member's JazzCash mobile account server-to-server.
 *
 * The member approves the debit in their JazzCash app. JazzCash sometimes
 * answers "pending" while it waits for that approval, so the response carries
 * the transaction reference — poll `/api/jazzcash/status` with it rather than
 * assuming the first answer is final.
 */
export async function POST(request: Request) {
  const auth = checkApiSecret(request);
  if (!auth.ok) return auth.response;

  let body: WalletBody;
  try {
    body = (await request.json()) as WalletBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "'amount' must be a positive number of rupees" }, { status: 400 });
  }
  if (!body.mobileNumber) return NextResponse.json({ error: "'mobileNumber' is required" }, { status: 400 });
  if (!body.cnic) return NextResponse.json({ error: "'cnic' is required (last 6 digits)" }, { status: 400 });

  const config = jazzCashConfig();
  const description = body.description ?? "Gym membership fee";

  try {
    const result = await chargeWallet(
      {
        amount,
        description,
        mobileNumber: body.mobileNumber,
        cnic: body.cnic,
        billReference: body.billReference ?? body.memberId,
        memberId: body.memberId,
        memberName: body.memberName,
      },
      config
    );

    await saveTransaction({
      txnRefNo: result.txnRefNo,
      kind: "wallet",
      status: result.status,
      amount,
      description,
      billReference: body.billReference ?? body.memberId,
      memberId: body.memberId,
      memberName: body.memberName,
      memberPhone: body.mobileNumber,
      responseCode: result.responseCode,
      responseMessage: result.responseMessage,
      retrievalReferenceNo: result.retrievalReferenceNo,
      environment: config.environment,
    });
    if (result.status === "successful") {
      await updateTransaction(result.txnRefNo, { status: "successful" });
    }

    return NextResponse.json(
      {
        txnRefNo: result.txnRefNo,
        status: result.status,
        ok: result.ok,
        responseCode: result.responseCode,
        responseMessage: result.responseMessage,
        amount: result.amount ?? amount,
        retrievalReferenceNo: result.retrievalReferenceNo,
        environment: config.environment,
      },
      { status: result.status === "failed" ? 402 : 200 }
    );
  } catch (error) {
    if (error instanceof JazzCashNotConfiguredError) {
      return NextResponse.json({ error: error.message, missing: error.missing }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "JazzCash wallet charge failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

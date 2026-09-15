import { NextResponse } from "next/server";
import { jazzCashConfig } from "@/lib/integrations/config";
import { inquire, JazzCashNotConfiguredError } from "@/lib/jazzcash/client";
import { getTransaction, updateTransaction } from "@/lib/server/transactionStore";

export const dynamic = "force-dynamic";

/**
 * Authoritative status of one transaction.
 *
 * This asks JazzCash rather than trusting the locally stored state, then
 * writes the answer back — so a payment that completed while the owner's phone
 * was off still shows up correctly the next time the page is opened.
 */
export async function GET(request: Request) {
  const txnRefNo = new URL(request.url).searchParams.get("ref");
  if (!txnRefNo) return NextResponse.json({ error: "'ref' query parameter is required" }, { status: 400 });

  const config = jazzCashConfig();
  const stored = await getTransaction(txnRefNo);

  if (!config.configured) {
    if (!stored) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    return NextResponse.json({ source: "local", transaction: stored, missing: config.missing }, { status: 200 });
  }

  try {
    const result = await inquire(txnRefNo, config);
    const updated = await updateTransaction(txnRefNo, {
      status: result.status,
      responseCode: result.responseCode,
      responseMessage: result.responseMessage,
      retrievalReferenceNo: result.retrievalReferenceNo,
    });

    return NextResponse.json({
      source: "jazzcash",
      txnRefNo,
      status: result.status,
      responseCode: result.responseCode,
      responseMessage: result.responseMessage,
      amount: result.amount ?? stored?.amount,
      transaction: updated ?? stored,
    });
  } catch (error) {
    if (error instanceof JazzCashNotConfiguredError) {
      return NextResponse.json({ error: error.message, missing: error.missing }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Status inquiry failed";
    return NextResponse.json({ error: message, transaction: stored }, { status: 502 });
  }
}

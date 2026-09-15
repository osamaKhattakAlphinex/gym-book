import { NextResponse } from "next/server";
import { listTransactions } from "@/lib/server/transactionStore";
import { checkApiSecret } from "@/lib/server/apiAuth";

export const dynamic = "force-dynamic";

/** Server-side JazzCash transactions, newest first. Optionally per member. */
export async function GET(request: Request) {
  const auth = checkApiSecret(request);
  if (!auth.ok) return auth.response;

  const params = new URL(request.url).searchParams;
  const limitParam = Number.parseInt(params.get("limit") ?? "", 10);

  const transactions = await listTransactions({
    memberId: params.get("member") ?? undefined,
    limit: Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100,
  });

  // checkoutFields carry no secrets, but they are noise for every caller here.
  return NextResponse.json({
    transactions: transactions.map((transaction) => {
      const copy = { ...transaction };
      delete copy.checkoutFields;
      return copy;
    }),
  });
}

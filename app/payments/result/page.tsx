import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { getTransaction } from "@/lib/server/transactionStore";
import { formatCurrency } from "@/lib/utils";
import type { JazzCashTransactionStatus } from "@/lib/jazzcash/types";

export const dynamic = "force-dynamic";

/**
 * Where JazzCash sends the member (or the owner) after a payment attempt.
 *
 * The status in the query string is only a hint — the transaction record has
 * already been settled against JazzCash's own inquiry API by the callback
 * route, so that record wins whenever it exists.
 */
export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; status?: string; message?: string }>;
}) {
  const { ref, status: hinted, message } = await searchParams;
  const transaction = ref ? await getTransaction(ref) : null;
  const status = (transaction?.status ?? hinted ?? "pending") as JazzCashTransactionStatus;

  const view = {
    successful: {
      icon: CheckCircle2,
      color: "var(--gym-success)",
      title: "Payment received",
      body: transaction
        ? `${formatCurrency(transaction.amount)} received${transaction.memberName ? ` from ${transaction.memberName}` : ""}. A receipt has been sent on WhatsApp.`
        : "Your payment went through. Thank you!",
    },
    pending: {
      icon: Clock,
      color: "var(--gym-warning)",
      title: "Payment pending",
      body: "JazzCash has not confirmed this payment yet. If money was deducted it will settle shortly — please don't pay twice.",
    },
    cancelled: {
      icon: XCircle,
      color: "var(--gym-text-muted)",
      title: "Payment cancelled",
      body: "No money was taken. You can try again whenever you're ready.",
    },
    failed: {
      icon: XCircle,
      color: "var(--gym-danger)",
      title: "Payment failed",
      body: message || transaction?.responseMessage || "JazzCash could not complete this payment. Please try again.",
    },
  }[status];

  const Icon = view.icon;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-6 text-center">
        <span
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `color-mix(in srgb, ${view.color} 12%, transparent)`, color: view.color }}
        >
          <Icon size={30} />
        </span>
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--gym-text)]">{view.title}</h1>
        <p className="mt-2 text-sm text-[var(--gym-text-muted)]">{view.body}</p>

        {ref && (
          <p className="mt-4 text-[11px] text-[var(--gym-text-muted)]">
            Reference {ref}
            {transaction?.responseCode ? ` · code ${transaction.responseCode}` : ""}
          </p>
        )}

        {status !== "successful" && ref && transaction && (
          <Link
            href={`/pay/${encodeURIComponent(ref)}`}
            className="mt-5 block w-full rounded-xl bg-[var(--gym-accent)] py-3 text-sm font-bold text-black"
          >
            Try again
          </Link>
        )}

        <Link href="/" className="mt-3 block text-xs font-semibold text-[var(--gym-text-muted)] underline">
          Back to GymBook
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { jazzCashConfig } from "@/lib/integrations/config";
import { getTransaction } from "@/lib/server/transactionStore";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pay your gym fee",
  description: "Pay your gym membership fee with JazzCash.",
};

/**
 * The page a member lands on from the WhatsApp payment link.
 *
 * Deliberately plain: the amount, who it is for, and one button. Members open
 * this on a cheap Android with a patchy connection, having tapped a link in a
 * chat — anything more than that is friction on the only screen where the gym
 * actually gets paid.
 */
export default async function PayPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const transaction = await getTransaction(ref);
  const config = jazzCashConfig();

  if (!transaction) {
    return (
      <Shell title="Payment link not found">
        <p className="text-sm text-[var(--gym-text-muted)]">
          This payment link is no longer valid. Please ask the gym to send you a new one.
        </p>
      </Shell>
    );
  }

  if (transaction.status === "successful") {
    return (
      <Shell title="Already paid">
        <p className="text-sm text-[var(--gym-text-muted)]">
          {formatCurrency(transaction.amount)} was already received for {transaction.memberName ?? "this membership"}.
          Thank you!
        </p>
        <p className="mt-3 text-xs text-[var(--gym-text-muted)]">Receipt no. {transaction.txnRefNo}</p>
      </Shell>
    );
  }

  if (!config.configured) {
    return (
      <Shell title="Online payment unavailable">
        <p className="text-sm text-[var(--gym-text-muted)]">
          Online payments are not switched on yet. Please pay at the gym, or contact the owner.
        </p>
      </Shell>
    );
  }

  return (
    <Shell title={transaction.memberName ? `Salam, ${transaction.memberName.split(" ")[0]}` : "Pay your fee"}>
      <p className="text-sm text-[var(--gym-text-muted)]">{transaction.description}</p>

      <p className="my-6 text-center text-4xl font-extrabold tracking-tight text-[var(--gym-text)]">
        {formatCurrency(transaction.amount)}
      </p>

      <a
        href={`/api/jazzcash/redirect?ref=${encodeURIComponent(transaction.txnRefNo)}`}
        className="block w-full rounded-xl bg-[var(--gym-accent)] py-3.5 text-center text-sm font-bold text-black transition active:scale-[0.98]"
      >
        Pay with JazzCash
      </a>

      <p className="mt-3 text-center text-xs text-[var(--gym-text-muted)]">
        You can pay with your JazzCash wallet, Easypaisa, Raast or a debit/credit card.
      </p>

      {config.environment === "sandbox" && (
        <p className="mt-4 rounded-lg border border-[var(--gym-warning)]/40 bg-[var(--gym-warning)]/10 px-3 py-2 text-center text-xs font-semibold text-[var(--gym-warning)]">
          Test mode — no real money will be charged.
        </p>
      )}

      <p className="mt-5 text-center text-[11px] text-[var(--gym-text-muted)]">Reference {transaction.txnRefNo}</p>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--gym-border)] bg-[var(--gym-surface)] p-6">
        <h1 className="mb-3 text-xl font-extrabold tracking-tight text-[var(--gym-text)]">{title}</h1>
        {children}
        <p className="mt-6 text-center text-[11px] text-[var(--gym-text-muted)]">
          Powered by <Link href="/" className="font-semibold text-[var(--gym-text-muted)] underline">GymBook</Link>
        </p>
      </div>
    </div>
  );
}

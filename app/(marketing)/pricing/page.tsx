import { ChevronDown, Check, Minus } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { PricingTable } from "@/components/marketing/PricingTable";
import { TIERS, FAQS, PRODUCT } from "@/lib/marketing/content";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Pricing",
  description:
    "GymBook plans from Rs. 2,500 a month. Every plan includes the full product; bigger plans add WhatsApp automation, JazzCash, branches and staff logins.",
};

/** Feature matrix — `included` is keyed on the tier id. */
const COMPARISON: { feature: string; included: (id: string) => boolean }[] = [
  { feature: "Member directory and search", included: () => true },
  { feature: "Expiry tracking and alerts", included: () => true },
  { feature: "Cash and bank payment records", included: () => true },
  { feature: "Pre-filled WhatsApp reminders", included: () => true },
  { feature: "Revenue and membership reports", included: () => true },
  { feature: "Automated WhatsApp Business API", included: (id) => id !== "starter" },
  { feature: "JazzCash links and checkout", included: (id) => id !== "starter" },
  { feature: "Equipment inventory", included: (id) => id !== "starter" },
  { feature: "Multiple branches", included: (id) => id === "pro" },
  { feature: "Spreadsheet import and export", included: (id) => id === "pro" },
  { feature: "Unlimited staff logins with roles", included: (id) => id === "pro" },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Costs less than one lapsed member"
        description="Pick by how many members you have on the books. No setup fee, no contract, and your data leaves with you if you go."
      />

      <Section>
        <PricingTable />

        <p className="mt-6 text-center text-xs text-[var(--gym-text-dim)]">
          Prices in Pakistani Rupees, exclusive of tax. Every plan starts with a 14-day trial — no card required.
        </p>
      </Section>

      {/* ------------------------------------------------------ Comparison */}
      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading eyebrow="Compare" title="What comes with each plan" />

        {/*
          * The matrix is a table from md up, where four columns fit the
          * container. On a phone it becomes one collapsible block per plan —
          * a wide table would force the whole page to scroll sideways.
          */}
        <div className="mt-8 hidden md:block">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">GymBook features by plan</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-2/5 border-b border-[var(--gym-border)] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--gym-text-muted)]"
                >
                  Feature
                </th>
                {TIERS.map((tier) => (
                  <th
                    key={tier.id}
                    scope="col"
                    className={`border-b border-[var(--gym-border)] px-4 py-3 text-center ${
                      tier.featured ? "text-[var(--gym-accent)]" : "text-[var(--gym-text)]"
                    }`}
                  >
                    <span className="gym-display block text-sm tracking-wide">{tier.name}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--gym-text-muted)]">
                      {formatCurrency(tier.monthly)}/mo
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-[var(--gym-border)]">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-[var(--gym-text-muted)]">
                    {row.feature}
                  </th>
                  {TIERS.map((tier) => {
                    const yes = row.included(tier.id);
                    return (
                      <td key={tier.id} className="px-4 py-3 text-center">
                        {yes ? (
                          <>
                            <Check size={17} strokeWidth={2.5} className="mx-auto text-[var(--gym-accent)]" aria-hidden />
                            <span className="sr-only">Included</span>
                          </>
                        ) : (
                          <>
                            <Minus size={17} className="mx-auto text-[var(--gym-text-dim)]" aria-hidden />
                            <span className="sr-only">Not included</span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 space-y-3 md:hidden">
          {TIERS.map((tier) => (
            <details key={tier.id} open={tier.featured} className="group gym-card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <span>
                  <span
                    className={`gym-display block text-base ${
                      tier.featured ? "text-[var(--gym-accent)]" : "text-[var(--gym-text)]"
                    }`}
                  >
                    {tier.name}
                  </span>
                  <span className="text-xs text-[var(--gym-text-muted)]">
                    {formatCurrency(tier.monthly)}/mo · {tier.memberCap}
                  </span>
                </span>
                <ChevronDown size={18} className="shrink-0 text-[var(--gym-accent)] transition group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="border-t border-[var(--gym-border)] px-5 py-3">
                {COMPARISON.map((row) => {
                  const yes = row.included(tier.id);
                  return (
                    <li key={row.feature} className="flex items-center gap-2.5 py-1.5 text-sm">
                      {yes ? (
                        <Check size={15} strokeWidth={2.5} className="shrink-0 text-[var(--gym-accent)]" aria-hidden />
                      ) : (
                        <Minus size={15} className="shrink-0 text-[var(--gym-text-dim)]" aria-hidden />
                      )}
                      <span className={yes ? "text-[var(--gym-text)]" : "text-[var(--gym-text-dim)] line-through"}>
                        {row.feature}
                      </span>
                      <span className="sr-only">{yes ? "Included" : "Not included"}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- FAQ */}
      <Section>
        <SectionHeading eyebrow="Questions" title={`Before you switch to ${PRODUCT.name}`} align="center" />

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQS.map((faq) => (
            /* <details> keeps the accordion working without client JavaScript. */
            <details key={faq.question} className="group gym-card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-[var(--gym-text)] transition hover:bg-[var(--gym-surface-2)]">
                {faq.question}
                <ChevronDown size={18} className="shrink-0 text-[var(--gym-accent)] transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="border-t border-[var(--gym-border)] px-5 py-4 text-sm leading-relaxed text-[var(--gym-text-muted)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}

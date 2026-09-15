import { ChevronDown, Check, Minus } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { PricingCard } from "@/components/marketing/cards";
import { MEMBERSHIP_TIERS, FAQS } from "@/lib/marketing/content";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Membership",
  description:
    "Iron Peak Fitness membership plans from Rs. 5,000 a month. Full floor access, all group classes and a coach-led induction on every plan.",
};

/** Feature matrix — every plan includes the first four rows. */
const COMPARISON: { feature: string; included: (tier: string) => boolean }[] = [
  { feature: "Full gym floor access", included: () => true },
  { feature: "All group classes", included: () => true },
  { feature: "Coach-led induction", included: () => true },
  { feature: "Locker room and showers", included: () => true },
  { feature: "Body composition checks", included: (t) => t !== "Monthly" },
  { feature: "Personalised training block", included: (t) => t !== "Monthly" },
  { feature: "Guest passes", included: (t) => t !== "Monthly" },
  { feature: "Personal training sessions", included: (t) => t === "6 Months" || t === "Yearly" },
  { feature: "Nutrition consultation", included: (t) => t === "6 Months" || t === "Yearly" },
  { feature: "Priority class booking", included: (t) => t === "6 Months" || t === "Yearly" },
  { feature: "Membership freezes", included: (t) => t === "Yearly" },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Membership"
        title="Simple plans, no joining fee"
        description="Four commitments, one gym. Everything is included on every plan — longer terms simply cost less per month and add coaching extras."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERSHIP_TIERS.map((tier) => (
            <PricingCard key={tier.plan} tier={tier} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--gym-text-dim)]">
          Prices in Pakistani Rupees. Pay by cash, bank transfer or JazzCash — we can send a payment link to your WhatsApp.
        </p>
      </Section>

      {/* ------------------------------------------------------ Comparison */}
      <Section className="border-y border-[var(--gym-border)] bg-[var(--gym-surface)]">
        <SectionHeading eyebrow="Compare" title="What comes with each plan" />

        {/*
          * The matrix is a table from md up, where five columns fit the
          * container. On a phone it becomes one collapsible block per plan —
          * a 640px-wide table would force the whole page to scroll sideways.
          */}
        <div className="mt-8 hidden md:block">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">Membership features by plan</caption>
            <thead>
              <tr>
                <th scope="col" className="w-2/5 border-b border-[var(--gym-border)] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--gym-text-muted)]">
                  Feature
                </th>
                {MEMBERSHIP_TIERS.map((tier) => (
                  <th
                    key={tier.plan}
                    scope="col"
                    className={`border-b border-[var(--gym-border)] px-4 py-3 text-center ${
                      tier.featured ? "text-[var(--gym-accent)]" : "text-[var(--gym-text)]"
                    }`}
                  >
                    <span className="gym-display block text-sm tracking-wide">{tier.name}</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--gym-text-muted)]">{tier.plan}</span>
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
                  {MEMBERSHIP_TIERS.map((tier) => {
                    const yes = row.included(tier.plan);
                    return (
                      <td key={tier.plan} className="px-4 py-3 text-center">
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
          {MEMBERSHIP_TIERS.map((tier) => (
            <details key={tier.plan} open={tier.featured} className="group gym-card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <span>
                  <span
                    className={`gym-display block text-base ${
                      tier.featured ? "text-[var(--gym-accent)]" : "text-[var(--gym-text)]"
                    }`}
                  >
                    {tier.name}
                  </span>
                  <span className="text-xs text-[var(--gym-text-muted)]">{formatCurrency(tier.price)} · {tier.plan}</span>
                </span>
                <ChevronDown size={18} className="shrink-0 text-[var(--gym-accent)] transition group-open:rotate-180" aria-hidden />
              </summary>
              <ul className="border-t border-[var(--gym-border)] px-5 py-3">
                {COMPARISON.map((row) => {
                  const yes = row.included(tier.plan);
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
        <SectionHeading eyebrow="Questions" title="Before you join" align="center" />

        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {FAQS.map((faq) => (
            /* <details> keeps the accordion working without client JavaScript. */
            <details key={faq.question} className="group gym-card overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-[var(--gym-text)] transition hover:bg-[var(--gym-surface-2)]">
                {faq.question}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-[var(--gym-accent)] transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="border-t border-[var(--gym-border)] px-5 py-4 text-sm leading-relaxed text-[var(--gym-text-muted)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBanner
        title="Still deciding? Train first."
        description="Use the free session before you pick a plan. Most people know which commitment suits them after one workout on the floor."
      />
    </>
  );
}

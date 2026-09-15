import { Section, SectionHeading } from "@/components/marketing/Section";
import { PageHero, CtaBanner } from "@/components/marketing/blocks";
import { IntegrationCard } from "@/components/marketing/cards";
import { INTEGRATIONS } from "@/lib/marketing/content";

export const metadata = {
  title: "Integrations",
  description:
    "WhatsApp Business API, Twilio, JazzCash, Easypaisa, Raast and bank transfer — how GymBook connects to the rails your gym already uses.",
};

const CATEGORIES = ["Messaging", "Payments", "Localisation"];

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Works with what you already use"
        description="Add credentials and a rail goes live on the next request, with no code change and no migration. Add none, and everything still works — you just press send yourself."
      />

      {CATEGORIES.map((category, i) => {
        const items = INTEGRATIONS.filter((x) => x.category === category);
        if (items.length === 0) return null;

        return (
          <Section
            key={category}
            className={i % 2 === 1 ? "border-y border-[var(--gym-border)] bg-[var(--gym-surface)]" : ""}
          >
            <SectionHeading eyebrow={category} title={CATEGORY_TITLES[category]} />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {items.map((integration) => (
                <IntegrationCard key={integration.name} integration={integration} />
              ))}
            </div>
          </Section>
        );
      })}

      <Section className="border-t border-[var(--gym-border)]">
        <div className="gym-card p-6 md:p-8">
          <h2 className="gym-display text-2xl text-[var(--gym-text)]">Nothing configured? Still works.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--gym-text-muted)]">
            This is the part most software gets wrong. Every integration here is optional, and the product is useful on
            day one without a single credential: cash entry is unchanged, and reminders open WhatsApp with the message
            written and the right number attached. You press send. Connect an API account whenever you are ready, and
            the same messages start sending themselves.
          </p>
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}

const CATEGORY_TITLES: Record<string, string> = {
  Messaging: "Reaching your members",
  Payments: "Taking the money",
  Localisation: "In the words they read",
};

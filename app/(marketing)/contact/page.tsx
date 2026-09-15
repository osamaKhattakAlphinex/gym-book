import Link from "next/link";
import { Phone, Mail, Clock3, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { PageHero } from "@/components/marketing/blocks";
import { TrialForm } from "@/components/marketing/TrialForm";
import { PRODUCT, ASSURANCES } from "@/lib/marketing/content";

export const metadata = {
  title: "Start a free trial",
  description:
    "Start a 14-day GymBook trial on your own member list, or talk to us on WhatsApp. No card required, setup the same day.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get started"
        title="Run it on your own gym"
        description="Fourteen days with your real member list. We import your spreadsheet, you see whether it saves you the front-desk headache, and you decide after."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TrialForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="gym-card p-6">
              <h2 className="gym-display text-lg text-[var(--gym-text)]">Talk to a human</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <a
                    href={`tel:${PRODUCT.salesPhone.replace(/\s/g, "")}`}
                    className="text-[var(--gym-text-muted)] transition hover:text-[var(--gym-accent)]"
                  >
                    {PRODUCT.salesPhone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <a
                    href={`mailto:${PRODUCT.salesEmail}`}
                    className="break-all text-[var(--gym-text-muted)] transition hover:text-[var(--gym-accent)]"
                  >
                    {PRODUCT.salesEmail}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Clock3 size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <span className="text-[var(--gym-text-muted)]">{PRODUCT.supportHours}</span>
                </li>
                <li className="flex gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <span className="text-[var(--gym-text-muted)]">{PRODUCT.address}</span>
                </li>
              </ul>
            </div>

            <div className="gym-card p-6">
              <h2 className="gym-display text-lg text-[var(--gym-text)]">What you get on trial</h2>
              <ul className="mt-4 space-y-3">
                {ASSURANCES.map((assurance) => {
                  const Icon = assurance.icon;
                  return (
                    <li key={assurance.label} className="flex items-center gap-2.5 text-sm text-[var(--gym-text-muted)]">
                      <Icon size={16} className="shrink-0 text-[var(--gym-accent)]" />
                      {assurance.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="gym-stripes gym-card p-6">
              <h2 className="gym-display flex items-center gap-2 text-lg text-[var(--gym-text)]">
                <MessageCircle size={18} className="text-[var(--gym-accent)]" />
                Rather look first?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gym-text-muted)]">
                The demo is the real product with a sample gym loaded — nothing to sign up for.
              </p>
              <Link href="/dashboard" className="gym-btn gym-btn-ghost mt-4 w-full py-3 text-sm">
                Open the demo
                <ArrowRight size={15} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

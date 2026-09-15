import { MapPin, Phone, Mail, Clock3, Navigation, ParkingCircle } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { PageHero } from "@/components/marketing/blocks";
import { TrialForm } from "@/components/marketing/TrialForm";
import { GYM } from "@/lib/marketing/content";

export const metadata = {
  title: "Contact & Free Trial",
  description:
    "Book a free trial session at Iron Peak Fitness in Gulberg III, Lahore. Opening hours, directions, phone and WhatsApp.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Come and train with us"
        description="Book your free session, ask about memberships, or just turn up during opening hours and ask for a coach at reception."
      />

      <Section>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TrialForm />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="gym-card p-6">
              <h2 className="gym-display text-lg text-[var(--gym-text)]">Find us</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <span className="text-[var(--gym-text-muted)]">{GYM.address}</span>
                </li>
                <li className="flex gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <a
                    href={`tel:${GYM.phone.replace(/\s/g, "")}`}
                    className="text-[var(--gym-text-muted)] transition hover:text-[var(--gym-accent)]"
                  >
                    {GYM.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <a
                    href={`mailto:${GYM.email}`}
                    className="break-all text-[var(--gym-text-muted)] transition hover:text-[var(--gym-accent)]"
                  >
                    {GYM.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <ParkingCircle size={17} className="mt-0.5 shrink-0 text-[var(--gym-accent)]" />
                  <span className="text-[var(--gym-text-muted)]">Free parking for members, on site</span>
                </li>
              </ul>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${GYM.name}, ${GYM.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gym-btn gym-btn-ghost mt-5 w-full py-3 text-sm"
              >
                Open in Maps
                <Navigation size={15} strokeWidth={2.5} />
              </a>
            </div>

            <div className="gym-card p-6">
              <h2 className="gym-display flex items-center gap-2 text-lg text-[var(--gym-text)]">
                <Clock3 size={18} className="text-[var(--gym-accent)]" />
                Opening hours
              </h2>
              <ul className="mt-4 divide-y divide-[var(--gym-border)]">
                {GYM.hours.map((entry) => (
                  <li key={entry.days} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="text-[var(--gym-text-muted)]">{entry.days}</span>
                    <span className="font-semibold text-[var(--gym-text)]">{entry.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="gym-stripes gym-card p-6">
              <h2 className="gym-display text-lg text-[var(--gym-text)]">Already a member?</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gym-text-muted)]">
                Renewals, payment links and receipts all go through WhatsApp. Message us on the number above and we will sort
                it out the same day.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

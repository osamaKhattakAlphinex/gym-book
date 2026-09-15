import {
  Users,
  BellRing,
  Wallet,
  CalendarClock,
  Dumbbell,
  ChartNoAxesColumn,
  MessageCircle,
  CircleDollarSign,
  Languages,
  Receipt,
  ShieldCheck,
  Smartphone,
  Zap,
  Database,
  type LucideIcon,
} from "lucide-react";

/**
 * Content for the public marketing site.
 *
 * GymBook is the product being sold; the gym in the dashboard (Iron Peak
 * Fitness) is a tenant, not the subject of this site. Keep that split — the
 * marketing copy addresses gym owners, never their members.
 *
 * Subscription pricing lives here and is deliberately NOT derived from
 * `PLAN_FEES`: those are the membership fees a gym charges its own members,
 * which have nothing to do with what a gym pays for the software.
 */

export const PRODUCT = {
  name: "GymBook",
  tagline: "Gym management that runs on WhatsApp.",
  description:
    "Memberships, renewals, payments and reminders for Pakistani gyms — without the register, the spreadsheet or the awkward conversation about money.",
  salesEmail: "sales@gymbook.pk",
  salesPhone: "+92 300 0000000",
  address: "Gulberg III, Main Boulevard, Lahore",
  supportHours: "Support 9 AM – 9 PM, seven days a week",
} as const;

export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: "120+", label: "Gyms running on it" },
  { value: "38k", label: "Memberships tracked" },
  { value: "94%", label: "Renewal reminder open rate" },
  { value: "< 1 day", label: "Average setup time" },
];

/* ------------------------------------------------------------------ Features */

export interface Feature {
  slug: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    slug: "members",
    name: "Member directory",
    icon: Users,
    tagline: "Every member, one screen",
    description:
      "Names, numbers, plans, join dates and full payment history — searchable and filterable. Replaces the register without asking anyone to learn a database.",
  },
  {
    slug: "expiry",
    name: "Expiry tracking",
    icon: CalendarClock,
    tagline: "Nobody lapses quietly",
    description:
      "Every membership is sorted into active, expiring within seven days, or expired. Open the app and the list of people to chase is already written.",
  },
  {
    slug: "reminders",
    name: "WhatsApp reminders",
    icon: BellRing,
    tagline: "Sent where members actually read",
    description:
      "Fee reminders, expiry warnings and receipts go out over WhatsApp in English or Roman Urdu. Configure the Business API and they send themselves.",
  },
  {
    slug: "payments",
    name: "Payments & renewals",
    icon: Wallet,
    tagline: "Cash first, digital when you want it",
    description:
      "Record cash in two taps, or send a JazzCash link a member pays from their phone. Renewals update the expiry date and the books in the same action.",
  },
  {
    slug: "inventory",
    name: "Equipment inventory",
    icon: Dumbbell,
    tagline: "Know what is broken",
    description:
      "Track every machine, its condition and its maintenance log. The dashboard flags anything needing repair before a member finds it first.",
  },
  {
    slug: "reports",
    name: "Reports",
    icon: ChartNoAxesColumn,
    tagline: "Where the month actually went",
    description:
      "Monthly revenue, new joiners, renewals and lapsed members — the numbers you need for a landlord, a partner or your own peace of mind.",
  },
];

/* -------------------------------------------------------------- Integrations */

export interface Integration {
  name: string;
  icon: LucideIcon;
  category: string;
  description: string;
  status: "Built in" | "Optional";
}

export const INTEGRATIONS: Integration[] = [
  {
    name: "WhatsApp Business API",
    icon: MessageCircle,
    category: "Messaging",
    description:
      "Connect a Meta Cloud API account and reminders, warnings and receipts send automatically to every member.",
    status: "Optional",
  },
  {
    name: "Twilio for WhatsApp",
    icon: Smartphone,
    category: "Messaging",
    description: "Already on Twilio? Point GymBook at your credentials instead — same messages, same templates.",
    status: "Optional",
  },
  {
    name: "Pre-filled wa.me links",
    icon: Zap,
    category: "Messaging",
    description:
      "With nothing configured at all, every reminder still opens WhatsApp with the message written and the right number attached. You press send.",
    status: "Built in",
  },
  {
    name: "JazzCash",
    icon: CircleDollarSign,
    category: "Payments",
    description:
      "Shareable payment links, mobile-account charges and card checkout, with signature-verified callbacks and an automatic receipt.",
    status: "Optional",
  },
  {
    name: "Cash, bank transfer, Easypaisa, Raast",
    icon: Receipt,
    category: "Payments",
    description: "Recorded as first-class payment methods. Digital rails are additive — cash entry never becomes a second-class path.",
    status: "Built in",
  },
  {
    name: "Roman Urdu messaging",
    icon: Languages,
    category: "Localisation",
    description:
      "Every template ships in plain English and Roman Urdu, because that is what members actually read on a cheap Android.",
    status: "Built in",
  },
];

/* ------------------------------------------------------------ How it works */

export interface WorkflowStep {
  step: string;
  title: string;
  body: string;
}

export const WORKFLOW: WorkflowStep[] = [
  {
    step: "01",
    title: "Move your register across",
    body: "Add members by hand or send us your spreadsheet and we import it. Most gyms are running the same afternoon they sign up.",
  },
  {
    step: "02",
    title: "Let it watch the dates",
    body: "GymBook sorts every membership by how close it is to expiring, so the day's follow-up list writes itself instead of living in your head.",
  },
  {
    step: "03",
    title: "Collect without the awkwardness",
    body: "Reminders and payment links go out over WhatsApp. Nobody gets asked about money in front of other people at the front desk.",
  },
];

/* ----------------------------------------------------------------- Pricing */

export interface Tier {
  id: string;
  name: string;
  /** Monthly price in PKR, billed monthly. */
  monthly: number;
  memberCap: string;
  blurb: string;
  featured: boolean;
  perks: string[];
}

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: 2500,
    memberCap: "Up to 100 members",
    blurb: "For a single floor finding its feet.",
    featured: false,
    perks: [
      "Member directory and expiry tracking",
      "Cash and bank payment records",
      "Pre-filled WhatsApp reminders",
      "Monthly revenue reports",
      "One staff login",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 5000,
    memberCap: "Up to 400 members",
    blurb: "For a busy gym that has outgrown the register.",
    featured: true,
    perks: [
      "Everything in Starter",
      "Automated WhatsApp Business API sending",
      "JazzCash payment links and checkout",
      "Equipment inventory and maintenance log",
      "Five staff logins",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 9000,
    memberCap: "Unlimited members",
    blurb: "For multi-branch operators.",
    featured: false,
    perks: [
      "Everything in Growth",
      "Multiple branches under one account",
      "Per-branch reporting and revenue split",
      "Spreadsheet import and data export",
      "Unlimited staff logins with roles",
    ],
  },
];

/** Annual billing gives two months free — stated once, computed everywhere. */
export const ANNUAL_FREE_MONTHS = 2;

export function annualPrice(tier: Tier): number {
  return tier.monthly * (12 - ANNUAL_FREE_MONTHS);
}

export function annualSavingsPercent(): number {
  return Math.round((ANNUAL_FREE_MONTHS / 12) * 100);
}

/* -------------------------------------------------------------- Assurances */

export interface Assurance {
  icon: LucideIcon;
  label: string;
}

export const ASSURANCES: Assurance[] = [
  { icon: ShieldCheck, label: "No setup fee, cancel any month" },
  { icon: Database, label: "Export your data whenever you want" },
  { icon: Smartphone, label: "Works on any phone — no app to install" },
  { icon: MessageCircle, label: "Support in Urdu and English" },
];

/* ------------------------------------------------------------ Testimonials */

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I was chasing renewals from a notebook and losing maybe fifteen members a month to nothing but forgetfulness. The reminders alone paid for it in the first week.",
    name: "Bilal Ahmed",
    detail: "Owner, Iron Peak Fitness · Lahore",
    initials: "BA",
  },
  {
    quote:
      "My front desk staff learnt it in an afternoon. No training, no manual. They already knew how to send a WhatsApp.",
    name: "Ayesha Siddiqui",
    detail: "Owner, Core Strength Studio · Karachi",
    initials: "AS",
  },
  {
    quote:
      "The JazzCash links changed how the first week of the month goes. Members pay from home instead of promising to bring cash tomorrow.",
    name: "Usman Tariq",
    detail: "Owner, Peak Athletics · Islamabad",
    initials: "UT",
  },
];

/* --------------------------------------------------------------------- FAQ */

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Do I need a WhatsApp Business API account?",
    answer:
      "No. Without one, every reminder still opens WhatsApp with the message written out and addressed to the right member — you just press send. Connect an API account later and the same messages start sending themselves.",
  },
  {
    question: "What if my members only pay cash?",
    answer:
      "Then nothing changes about how you collect. Cash is a first-class payment method, recorded in two taps. JazzCash and card links are there if you want them, never required.",
  },
  {
    question: "Can I move my existing members across?",
    answer:
      "Yes. Add them by hand, or send us your spreadsheet and we will import it for you. Import and export are included on Pro and available on request for every plan.",
  },
  {
    question: "Does it work on a phone?",
    answer:
      "GymBook is built mobile-first — most owners run the whole thing from their phone at the front desk. There is no app to install; it runs in the browser.",
  },
  {
    question: "What happens if I stop paying?",
    answer:
      "Your account becomes read-only rather than disappearing, and you can export everything you have put in. We do not hold your member list hostage.",
  },
  {
    question: "Is there a contract?",
    answer:
      "No. Monthly plans cancel at the end of the month you are in. Annual billing saves two months and is refunded pro-rata if you leave early.",
  },
];

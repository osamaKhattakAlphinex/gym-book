import {
  Dumbbell,
  Flame,
  Swords,
  HeartPulse,
  Waves,
  BicepsFlexed,
  ShowerHead,
  ParkingCircle,
  Wifi,
  Lock,
  Snowflake,
  CupSoda,
  type LucideIcon,
} from "lucide-react";
import { PLAN_FEES, PLAN_MONTHS } from "@/lib/utils";
import type { Plan } from "@/lib/types";

/**
 * Content for the public marketing site.
 *
 * Kept as data rather than inlined in the pages so the same programs, plans
 * and trainers stay consistent across the home page and the detail pages.
 * Membership pricing is derived from `PLAN_FEES` — the marketing site and the
 * owner's dashboard quote the same numbers by construction.
 */

export const GYM = {
  name: "Iron Peak Fitness",
  tagline: "Train hard. Recover smart. Repeat.",
  phone: "+92 300 0000000",
  email: "hello@ironpeakfitness.pk",
  address: "Gulberg III, Main Boulevard, Lahore",
  hours: [
    { days: "Monday – Friday", time: "5:00 AM – 11:00 PM" },
    { days: "Saturday", time: "6:00 AM – 10:00 PM" },
    { days: "Sunday", time: "8:00 AM – 8:00 PM" },
  ],
} as const;

export interface Stat {
  value: string;
  label: string;
}

export interface Program {
  slug: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  level: "Beginner friendly" | "All levels" | "Intermediate+";
  duration: string;
}

export const PROGRAMS: Program[] = [
  {
    slug: "strength",
    name: "Strength & Powerlifting",
    icon: Dumbbell,
    tagline: "Squat, bench, deadlift",
    description:
      "Platform work on calibrated plates with coached technique on the big three. Programming blocks run eight weeks, with a tested max at the end of each.",
    level: "All levels",
    duration: "60–75 min",
  },
  {
    slug: "hiit",
    name: "HIIT & Conditioning",
    icon: Flame,
    tagline: "Short rounds, full send",
    description:
      "Interval circuits built on rowers, bikes and sleds. Every station scales up or down, so a first-timer and a competitor can work the same clock.",
    level: "All levels",
    duration: "45 min",
  },
  {
    slug: "boxing",
    name: "Boxing & Pad Work",
    icon: Swords,
    tagline: "Footwork, combinations, rounds",
    description:
      "Technical boxing from stance and guard through to pad rounds with a coach. Non-contact by default; sparring is optional and supervised.",
    level: "Beginner friendly",
    duration: "60 min",
  },
  {
    slug: "functional",
    name: "Functional Fitness",
    icon: BicepsFlexed,
    tagline: "Carry, climb, lift, move",
    description:
      "Kettlebells, sandbags and gymnastics rings in mixed-modal workouts. Built for strength that transfers outside the gym floor.",
    level: "Intermediate+",
    duration: "60 min",
  },
  {
    slug: "cardio",
    name: "Cardio & Endurance",
    icon: HeartPulse,
    tagline: "Build the engine",
    description:
      "Zone-two treadmill and cycling work with heart-rate guidance, plus threshold sessions for members training for a race.",
    level: "Beginner friendly",
    duration: "30–60 min",
  },
  {
    slug: "mobility",
    name: "Mobility & Yoga",
    icon: Waves,
    tagline: "Move better, hurt less",
    description:
      "Guided mobility flows and restorative yoga on the mat floor. The session most members skip and every coach here recommends.",
    level: "All levels",
    duration: "45 min",
  },
];

export interface Trainer {
  name: string;
  role: string;
  specialty: string;
  experience: string;
  initials: string;
}

export const TRAINERS: Trainer[] = [
  {
    name: "Bilal Ahmed",
    role: "Head Strength Coach",
    specialty: "Powerlifting · Olympic lifting",
    experience: "11 years",
    initials: "BA",
  },
  {
    name: "Ayesha Siddiqui",
    role: "Conditioning Lead",
    specialty: "HIIT · Endurance programming",
    experience: "7 years",
    initials: "AS",
  },
  {
    name: "Usman Tariq",
    role: "Boxing Coach",
    specialty: "Boxing · Pad work · Footwork",
    experience: "9 years",
    initials: "UT",
  },
  {
    name: "Hina Malik",
    role: "Mobility & Yoga Coach",
    specialty: "Mobility · Injury rehab",
    experience: "6 years",
    initials: "HM",
  },
];

export interface ClassSlot {
  time: string;
  name: string;
  coach: string;
  program: string;
}

export interface ScheduleDay {
  day: string;
  short: string;
  slots: ClassSlot[];
}

export const SCHEDULE: ScheduleDay[] = [
  {
    day: "Monday",
    short: "Mon",
    slots: [
      { time: "6:00 AM", name: "Strength — Lower", coach: "Bilal Ahmed", program: "Strength" },
      { time: "7:30 AM", name: "HIIT Circuit", coach: "Ayesha Siddiqui", program: "HIIT" },
      { time: "6:00 PM", name: "Boxing Fundamentals", coach: "Usman Tariq", program: "Boxing" },
      { time: "8:00 PM", name: "Mobility Flow", coach: "Hina Malik", program: "Mobility" },
    ],
  },
  {
    day: "Tuesday",
    short: "Tue",
    slots: [
      { time: "6:00 AM", name: "Functional Fitness", coach: "Ayesha Siddiqui", program: "Functional" },
      { time: "7:30 AM", name: "Zone 2 Cardio", coach: "Hina Malik", program: "Cardio" },
      { time: "6:00 PM", name: "Strength — Upper", coach: "Bilal Ahmed", program: "Strength" },
      { time: "7:30 PM", name: "Pad Rounds", coach: "Usman Tariq", program: "Boxing" },
    ],
  },
  {
    day: "Wednesday",
    short: "Wed",
    slots: [
      { time: "6:00 AM", name: "HIIT Circuit", coach: "Ayesha Siddiqui", program: "HIIT" },
      { time: "7:30 AM", name: "Mobility Flow", coach: "Hina Malik", program: "Mobility" },
      { time: "6:00 PM", name: "Strength — Full Body", coach: "Bilal Ahmed", program: "Strength" },
      { time: "8:00 PM", name: "Boxing Fundamentals", coach: "Usman Tariq", program: "Boxing" },
    ],
  },
  {
    day: "Thursday",
    short: "Thu",
    slots: [
      { time: "6:00 AM", name: "Strength — Lower", coach: "Bilal Ahmed", program: "Strength" },
      { time: "7:30 AM", name: "Functional Fitness", coach: "Ayesha Siddiqui", program: "Functional" },
      { time: "6:00 PM", name: "Threshold Intervals", coach: "Hina Malik", program: "Cardio" },
      { time: "7:30 PM", name: "Pad Rounds", coach: "Usman Tariq", program: "Boxing" },
    ],
  },
  {
    day: "Friday",
    short: "Fri",
    slots: [
      { time: "6:00 AM", name: "HIIT Circuit", coach: "Ayesha Siddiqui", program: "HIIT" },
      { time: "7:30 AM", name: "Strength — Upper", coach: "Bilal Ahmed", program: "Strength" },
      { time: "5:30 PM", name: "Open Platform", coach: "Bilal Ahmed", program: "Strength" },
      { time: "7:00 PM", name: "Restorative Yoga", coach: "Hina Malik", program: "Mobility" },
    ],
  },
  {
    day: "Saturday",
    short: "Sat",
    slots: [
      { time: "8:00 AM", name: "Team Conditioning", coach: "Ayesha Siddiqui", program: "HIIT" },
      { time: "10:00 AM", name: "Strength — Full Body", coach: "Bilal Ahmed", program: "Strength" },
      { time: "12:00 PM", name: "Boxing Open Mat", coach: "Usman Tariq", program: "Boxing" },
    ],
  },
  {
    day: "Sunday",
    short: "Sun",
    slots: [
      { time: "9:00 AM", name: "Mobility Flow", coach: "Hina Malik", program: "Mobility" },
      { time: "11:00 AM", name: "Zone 2 Cardio", coach: "Ayesha Siddiqui", program: "Cardio" },
    ],
  },
];

export const WEEKLY_CLASS_COUNT = SCHEDULE.reduce((sum, day) => sum + day.slots.length, 0);

export const STATS: Stat[] = [
  { value: "500+", label: "Active members" },
  { value: String(WEEKLY_CLASS_COUNT), label: "Classes a week" },
  { value: String(TRAINERS.length), label: "Expert coaches" },
  { value: "18h", label: "Open daily" },
];

export interface MembershipTier {
  plan: Plan;
  name: string;
  price: number;
  months: number;
  perMonth: number;
  savingsPercent: number;
  featured: boolean;
  perks: string[];
}

const MONTHLY_RATE = PLAN_FEES.Monthly;

function tier(plan: Plan, name: string, perks: string[], featured = false): MembershipTier {
  const months = PLAN_MONTHS[plan];
  const price = PLAN_FEES[plan];
  const undiscounted = MONTHLY_RATE * months;
  return {
    plan,
    name,
    price,
    months,
    perMonth: Math.round(price / months),
    savingsPercent: Math.round(((undiscounted - price) / undiscounted) * 100),
    featured,
    perks,
  };
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  tier("Monthly", "Starter", [
    "Full gym floor access",
    "All group classes",
    "Locker room and showers",
    "Induction session with a coach",
  ]),
  tier("3 Months", "Committed", [
    "Everything in Starter",
    "Monthly body composition check",
    "Personalised training block",
    "Guest pass each month",
  ]),
  tier("6 Months", "Athlete", [
    "Everything in Committed",
    "Two personal training sessions",
    "Nutrition consultation",
    "Priority class booking",
  ], true),
  tier("Yearly", "Iron", [
    "Everything in Athlete",
    "Six personal training sessions",
    "Free kit bag and shaker",
    "Two membership freezes a year",
  ]),
];

export interface Facility {
  icon: LucideIcon;
  label: string;
}

export const FACILITIES: Facility[] = [
  { icon: ShowerHead, label: "Hot showers & changing rooms" },
  { icon: Lock, label: "Secure member lockers" },
  { icon: Snowflake, label: "Fully air-conditioned floor" },
  { icon: ParkingCircle, label: "Free on-site parking" },
  { icon: Wifi, label: "High-speed Wi-Fi" },
  { icon: CupSoda, label: "Protein & smoothie bar" },
];

export interface Testimonial {
  quote: string;
  name: string;
  detail: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I came in barely able to deadlift the bar. Fourteen months later I pulled 140 kg. The coaches actually watch your sets and fix what needs fixing.",
    name: "Hassan Raza",
    detail: "Member since 2024 · Strength",
    initials: "HR",
  },
  {
    quote:
      "The 6 AM HIIT class is the only reason I get up. It is busy, it is loud, and everyone there knows my name.",
    name: "Fatima Noor",
    detail: "Member since 2025 · HIIT",
    initials: "FN",
  },
  {
    quote:
      "Clean floor, working equipment, no waiting for a rack at peak hour. After three other gyms in Lahore, that is worth the fee on its own.",
    name: "Usman Ali",
    detail: "Member since 2024 · Functional",
    initials: "UA",
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const FAQS: Faq[] = [
  {
    question: "Can I try the gym before I join?",
    answer:
      "Yes. Your first session is free, including any group class on the schedule. Bring trainers and a water bottle, and arrive ten minutes early so a coach can run you through the floor.",
  },
  {
    question: "Do I need to book classes in advance?",
    answer:
      "Classes are first come, first served for most members, and Athlete and Iron memberships get priority booking. Peak evening slots fill up, so booking the day before is sensible.",
  },
  {
    question: "What if I am completely new to training?",
    answer:
      "Every membership starts with an induction session. A coach walks you through the equipment, takes your baseline numbers and writes a first four-week plan.",
  },
  {
    question: "How do I pay?",
    answer:
      "Cash at reception, bank transfer, or JazzCash — including a payment link we can send straight to your WhatsApp. Renewal reminders go out a week before your membership expires.",
  },
  {
    question: "Can I freeze my membership?",
    answer:
      "Six-month and yearly memberships include freezes for travel, illness or injury. Let reception know before the freeze starts and we adjust your expiry date.",
  },
];

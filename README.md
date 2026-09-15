# Gym Membership Dashboard

GymBook — mobile-first gym management software for Pakistani gyms, plus the public site that sells it. Built for owners who currently track members on paper and in spreadsheets.

Two surfaces in one app: a **public product site** at `/` aimed at gym owners, and the **owner's dashboard** at `/dashboard` where a subscribed gym runs its day.

## What it does

- **Product marketing site** (`/`) — the public site for GymBook itself, addressed to gym owners rather than their members: the problem it solves, the feature grid, how setup works, subscription pricing with a monthly/yearly toggle and a feature comparison, owner testimonials, an FAQ, and a trial enquiry form that opens WhatsApp pre-filled. Pages: `/features`, `/integrations`, `/pricing`, `/contact`.
- **Dashboard** (`/dashboard`) — stat tiles with trend sparklines and period deltas, a six-month revenue column chart, a membership mix breakdown, a dense "needs chasing" list with inline reminder/open actions, recent activity and quick actions.
- **Members** — searchable/filterable directory, member detail with a countdown progress bar and payment history, add/edit/delete.
- **Renewals & Payments** — fast renew and record-payment flows that update expiry dates, payment history, and dashboard counts immediately.
- **Expiring Soon** — Today / 3 / 7 / 30-day tabs grouped by urgency, with a WhatsApp / SMS / Call reminder sheet and an editable pre-written message.
- **Payments, Reports, Notifications, Settings** — payment history with summaries and filters, revenue and membership reporting, a notification center, and gym/owner settings.
- **WhatsApp reminders & receipts** — fee reminders, expiry warnings and payment receipts in English or Roman Urdu, sent by the WhatsApp Business API when one is configured and as a pre-filled `wa.me` link when it isn't.
- **JazzCash payments** — shareable payment links, direct mobile-account charges and card checkout, with signature-verified callbacks and an automatic WhatsApp receipt.

Status logic: **Active** (>7 days to expiry), **Expiring Soon** (0–7 days), **Expired** (past due) — shown with both color and text, never color alone.

## Design

Dark charcoal foundation with an electric lime accent, condensed uppercase display type (Oswald) over Inter body text, bordered cards and athletic textures — diagonal bar-tape stripes, a faint mat grid, and an overhead spotlight wash on heroes. No glassmorphism, and colour is never the only signal: statuses carry text, and the comparison table marks inclusion with icons plus screen-reader text.

The public site and the owner's dashboard share one set of tokens and utility classes in `app/globals.css`, so both read as the same gym. The dashboard keeps bottom navigation + a floating Add Member action on mobile and a sidebar on desktop; `AppChrome` keeps that chrome off the marketing pages and off the member-facing payment routes.

Dashboard figures are set in Inter with proportional numerals rather than the condensed display face — those are numbers read for precision, and `tabular-nums` is reserved for columns that must align vertically. Charts follow one rule set: a single series gets no legend, the current period carries the accent while earlier periods sit in a neutral de-emphasis gray, bar thickness is capped with a rounded data-end, and every chart also exposes its values as a visually hidden table so nothing is available on hover alone.

Two audiences, one design system. The marketing site sells **GymBook**; the gym inside the dashboard (Iron Peak Fitness) is a tenant, not the subject of the public site. Subscription pricing is deliberately *not* derived from `PLAN_FEES` — those are the fees a gym charges its own members, which have nothing to do with what a gym pays for the software.

## Payments & messaging

Both integrations are environment-driven: add the credentials and they go live on the next request, with no code change. With nothing configured the app still works — cash entry is unchanged and reminders open WhatsApp with the message pre-filled for the owner to tap send.

```bash
cp .env.example .env.local   # then fill in what you have
```

Settings → Integrations shows what is live and names any variable that is still missing. Full write-up, including how it was verified: [`docs/jazzcash-whatsapp.md`](docs/jazzcash-whatsapp.md).

## Data

Derived series for the dashboard and reports (monthly revenue, daily collections, member growth, period deltas) live in `lib/analytics.ts` as pure functions over the store's arrays, so both screens read the same numbers.

Member and payment state lives in a client-side React context backed by `localStorage`, seeded with 20 realistic members (Pakistani names/phone numbers, PKR currency) spread across active, expiring, and expired statuses. Every action — adding a member, recording a payment, renewing a membership — updates counts and activity across every screen immediately. There is no member database or owner auth yet.

JazzCash transactions are the exception: callbacks arrive from JazzCash's servers with no browser attached, so those records are kept server-side (`lib/server/transactionStore.ts`) behind a narrow interface, ready to move to MongoDB.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · lucide-react · JazzCash · WhatsApp Cloud API / Twilio

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

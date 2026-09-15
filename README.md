# Gym Membership Dashboard

A mobile-first gym membership and subscription management prototype, built for a local gym owner who currently tracks members on paper and in spreadsheets.

## What it does

- **Dashboard** — active/expiring/expired counts, today's collections, an expiring-membership alert list, quick actions, recent activity, and a membership overview bar.
- **Members** — searchable/filterable directory, member detail with a countdown progress bar and payment history, add/edit/delete.
- **Renewals & Payments** — fast renew and record-payment flows that update expiry dates, payment history, and dashboard counts immediately.
- **Expiring Soon** — Today / 3 / 7 / 30-day tabs grouped by urgency, with a WhatsApp / SMS / Call reminder sheet and an editable pre-written message.
- **Payments, Reports, Notifications, Settings** — payment history with summaries and filters, a simple revenue chart, a notification center, and gym/owner settings.
- **WhatsApp reminders & receipts** — fee reminders, expiry warnings and payment receipts in English or Roman Urdu, sent by the WhatsApp Business API when one is configured and as a pre-filled `wa.me` link when it isn't.
- **JazzCash payments** — shareable payment links, direct mobile-account charges and card checkout, with signature-verified callbacks and an automatic WhatsApp receipt.

Status logic: **Active** (>7 days to expiry), **Expiring Soon** (0–7 days), **Expired** (past due) — shown with both color and text, never color alone.

## Design

Dark charcoal foundation with an electric lime accent, bold typography, bordered cards, no gradients or glassmorphism — built to read as a real gym operations tool rather than a generic AI dashboard. Bottom navigation + a floating Add Member action on mobile, a sidebar on desktop, same visual language on both.

## Payments & messaging

Both integrations are environment-driven: add the credentials and they go live on the next request, with no code change. With nothing configured the app still works — cash entry is unchanged and reminders open WhatsApp with the message pre-filled for the owner to tap send.

```bash
cp .env.example .env.local   # then fill in what you have
```

Settings → Integrations shows what is live and names any variable that is still missing. Full write-up, including how it was verified: [`docs/jazzcash-whatsapp.md`](docs/jazzcash-whatsapp.md).

## Data

Member and payment state lives in a client-side React context backed by `localStorage`, seeded with 20 realistic members (Pakistani names/phone numbers, PKR currency) spread across active, expiring, and expired statuses. Every action — adding a member, recording a payment, renewing a membership — updates counts and activity across every screen immediately. There is no member database or owner auth yet.

JazzCash transactions are the exception: callbacks arrive from JazzCash's servers with no browser attached, so those records are kept server-side (`lib/server/transactionStore.ts`) behind a narrow interface, ready to move to MongoDB.

## Stack

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS v4 · lucide-react · JazzCash · WhatsApp Cloud API / Twilio

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

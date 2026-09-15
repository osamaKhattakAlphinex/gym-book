# JazzCash & WhatsApp — implementation report

This document covers the payments and messaging system built on top of the
GymBook dashboard: what exists, how it behaves before and after credentials are
supplied, and how it was verified.

The guiding constraint was the one in the request: **put the variables in the
environment and it works immediately.** No build flags, no code edits, no
feature toggles in a database. Every integration reads `process.env` through one
module and reports its own readiness through one endpoint.

---

## 1. What was built

| Area | Delivered |
| --- | --- |
| JazzCash hosted checkout | Signed field set for the JazzCash payment page (wallet, Raast, debit/credit card) |
| JazzCash mobile account | Server-to-server wallet charge (`DoMWALLETTransaction`) with pending-state polling |
| JazzCash status inquiry | Authoritative transaction lookup, used to settle every callback |
| JazzCash callback | Signature-verified return URL that settles the payment and fires the receipt |
| Shareable payment links | `/pay/<ref>` — a member-facing page the owner sends on WhatsApp |
| WhatsApp Cloud API (Meta) | Text and approved-template sending, webhook verification, delivery receipts |
| WhatsApp via Twilio | Same interface, form-encoded API, status callbacks |
| wa.me fallback | Zero-configuration path — the message is pre-filled, the owner taps send |
| Message templates | 6 message kinds × English and Roman Urdu |
| Bulk reminders | "Remind all" on the Expiring Soon screen, concurrency-capped |
| Owner visibility | Settings → Integrations shows live status and names any missing variable |

---

## 2. Behaviour with and without credentials

The system has no "not implemented" state. It has a *degraded* state that is
still useful, which matters because the spec is explicit that the gym owner must
get value on day one without an API account.

| | No environment variables | With variables |
| --- | --- | --- |
| **Reminders** | WhatsApp opens with the message pre-filled; owner taps send (`status: "manual"`) | Delivered by the API (`status: "sent"`), no owner action |
| **Receipts** | Same — pre-filled, one tap | Sent automatically the moment a payment settles |
| **Bulk remind** | Hidden (opening 20 tabs is worse than doing it by hand) | One tap reminds everyone in the window |
| **Payments** | Cash and manual entry, exactly as before | Payment links, wallet charges and card checkout |
| **Settings** | Names the exact variables that are missing | Shows provider, environment and merchant prefix |

Every send response carries a `waLink`, including failures. If the WhatsApp API
is down, the UI opens the pre-filled chat and says so — the reminder is never
silently lost.

---

## 3. Environment variables

Full annotated list in [`.env.example`](../.env.example). The short version:

```bash
# JazzCash — all three required together
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_ENV=sandbox            # or: live

# WhatsApp — either block, or neither
WHATSAPP_ACCESS_TOKEN=          # Meta Cloud API
WHATSAPP_PHONE_NUMBER_ID=
#   ...or...
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

APP_BASE_URL=https://your-deployment      # auto-detected on Vercel
GYMBOOK_API_SECRET=                       # required on any public deployment
```

Provider selection is automatic: Meta if configured, else Twilio, else the
wa.me fallback. `WHATSAPP_PROVIDER` pins one explicitly, and if the pinned
provider is not fully configured the app falls back rather than failing, and
says which variables are missing.

### URLs to register with the providers

| Provider | Setting | Value |
| --- | --- | --- |
| JazzCash merchant portal | Return URL | `$APP_BASE_URL/api/jazzcash/callback` |
| Meta (WhatsApp) | Webhook callback URL | `$APP_BASE_URL/api/whatsapp/webhook` |
| Meta (WhatsApp) | Verify token | the value of `WHATSAPP_VERIFY_TOKEN` |
| Twilio | Status callback URL | `$APP_BASE_URL/api/whatsapp/webhook` |

---

## 4. Architecture

```
lib/integrations/config.ts     every environment read, in one place
lib/integrations/phone.ts      +92 / 0300 / 923.. normalisation (isomorphic)

lib/jazzcash/secureHash.ts     HMAC-SHA256 message integrity, both directions
lib/jazzcash/client.ts         checkout, wallet charge, inquiry, callback parsing
lib/jazzcash/types.ts          wire shapes + response-code interpretation

lib/whatsapp/index.ts          provider selection, send, bulk send, webhook parsing
lib/whatsapp/templates.ts      message copy, EN + Roman Urdu (isomorphic)
lib/whatsapp/providers/        meta.ts · twilio.ts · link.ts

lib/server/transactionStore.ts server-side payment records
lib/server/apiAuth.ts          optional bearer-token guard

app/api/jazzcash/…             checkout · wallet · status · callback · redirect · transactions
app/api/whatsapp/…             send · webhook
app/api/integrations/status    what is configured, names only — never values
```

Two design rules run through all of it:

**Nothing throws at import time.** A missing variable downgrades an integration
to `configured: false`. The app boots, the dashboard works, and the Settings
screen explains what is absent. This is what makes "add the variable and it
works" true rather than aspirational.

**Failures fall back, they do not disappear.** A provider outage returns a
wa.me link. A dropped JazzCash callback is recovered by the status inquiry. A
read-only filesystem switches the transaction store to memory rather than
erroring.

### Why a server-side transaction store exists

The rest of GymBook keeps its data in `localStorage`. JazzCash callbacks arrive
from JazzCash's servers with no browser attached, so the transaction has to
exist somewhere the server can find it. `lib/server/transactionStore.ts` is a
small JSON file with an in-memory mirror, behind a narrow interface — the swap
point for the MongoDB `payments` collection in the spec. On a read-only
filesystem (Vercel's default) it runs from memory alone; payments still
complete, which is why `inquire()` is always treated as the source of truth
rather than the stored row.

### Secrets are never persisted

A payment link has to stay payable after a restart, which means the checkout
fields must be stored. `pp_Password` and `pp_SecureHash` are stripped before
the record is written and recomputed from the environment when the link is
opened. The merchant password never reaches disk.

---

## 5. Security

| Concern | Handling |
| --- | --- |
| Forged payment callback | `pp_SecureHash` verified with a constant-time compare; an unverified payload can never mark a payment successful |
| Replayed or dropped callback | Anything not a *verified* success is re-checked against JazzCash's inquiry API before it is trusted |
| Forged WhatsApp webhook | `X-Hub-Signature-256` verified against `WHATSAPP_APP_SECRET`, over the raw request bytes |
| Meta webhook subscription | `hub.verify_token` compared against `WHATSAPP_VERIFY_TOKEN`; 503 rather than a blind 200 when unset |
| Open API routes | `GYMBOOK_API_SECRET` enables bearer-token auth on send/checkout/wallet/transactions |
| Secret leakage | `/api/integrations/status` returns variable *names* and a 4-character merchant prefix; no values |
| Double receipts | `receiptSentAt` on the transaction record guards against a re-POSTed callback |

The callback and webhook routes stay outside the bearer-token guard on purpose:
they authenticate by signature, and the providers cannot send a bearer token.

---

## 6. How it was verified

Exercised against a running server, with a local mock standing in for
`graph.facebook.com` and `api.twilio.com`, and a second implementation of the
JazzCash hashing algorithm written in Python for cross-checking.

| Check | Result |
| --- | --- |
| Secure hash vs. independent implementation | Identical digest |
| Hosted checkout field set | 14 signed fields, amount in paisa, PKT timestamps |
| Correctly signed success callback | Settled `successful`, receipt fired once, `settledAt` recorded |
| **Forged callback claiming success** | **Rejected** — stayed `pending`, no receipt, warning logged |
| Meta text send | Correct Graph URL, bearer auth, `type: "text"` payload |
| Meta template send | `type: "template"`, positional body parameters |
| Meta webhook, valid signature | `200`, 2 events parsed (1 inbound, 1 delivery receipt) |
| Meta webhook, bad signature | `401` |
| Meta webhook verification handshake | Challenge echoed as `text/plain`; wrong token → `403` |
| Twilio send | Correct account URL, Basic auth, `whatsapp:+92…` addressing |
| Twilio status callback | `200`, delivery event parsed |
| Bulk send with one bad number | 2 sent, 1 failed, per-message errors returned |
| Provider unreachable | `status: "failed"` **with** a usable `waLink` |
| `GYMBOOK_API_SECRET` set | Unauthenticated send/checkout → `401`; callback still `303` |
| **Empty environment** | Reminders returned a wa.me link; checkout returned `503` naming all three missing variables |
| Phone normalisation | `+92 300 1234567`, `0300 1234567`, `03001234567` → `923001234567`; junk rejected |
| `npm run build` · `tsc --noEmit` · `npm run lint` | Clean |

---

## 7. Going live

1. Put the JazzCash sandbox credentials in `.env.local`, leave `JAZZCASH_ENV=sandbox`.
2. Register `$APP_BASE_URL/api/jazzcash/callback` as the Return URL in the merchant portal.
3. Open Settings → Integrations; both rows should read live.
4. Send yourself a payment link from a member's page and pay it end to end.
5. Switch `JAZZCASH_ENV=live` and swap in the production credentials.
6. Set `GYMBOOK_API_SECRET` before the deployment is publicly reachable.

For WhatsApp, get the Cloud API number verified and the templates approved
before relying on automatic reminders — outside the 24-hour customer service
window Meta only delivers approved templates, which is why
`WHATSAPP_TEMPLATE_*` exists. Until then the wa.me fallback covers the gap with
no cost and no approval.

---

## 8. Not included

- **Scheduled reminder cron.** The spec puts automated cron messaging out of
  scope for the MVP, and member data currently lives in the browser, so the
  server cannot enumerate who is due. The batch endpoint a scheduler would call
  (`POST /api/whatsapp/send` with `messages: [...]`) is built and tested; it
  needs the members to move server-side first.
- **Owner authentication.** Still out of scope per the spec. `GYMBOOK_API_SECRET`
  is the stopgap for a public deployment.
- **Refunds.** The JazzCash refund endpoint is configured but no UI calls it.
- **MongoDB.** The transaction store is file-backed behind an interface; moving
  it is a contained change.

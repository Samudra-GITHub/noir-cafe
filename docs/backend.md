# Backend — optional services

The site runs fully static without any of these. Each service switches on a
feature when its keys are present (see [`.env.example`](../.env.example)), and
every feature says plainly when it is running without its backend.

| Service | Enables | Without it |
| --- | --- | --- |
| **Anthropic** (`ANTHROPIC_API_KEY`) | `/concierge` — the AI barista (streams Claude, grounded in the site's own menu, shop, recipes and cafés) | The concierge shows as resting; no canned replies |
| **Supabase** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | Orders and reservations stored in Postgres, live availability (menu and tables), synced favourites | Orders and bookings are validated by the server against default capacity but not stored — labelled *demo* |
| **Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) | "Pay now" via Checkout; the webhook marks orders paid | Pay at pickup only |
| **Resend** (`RESEND_API_KEY`, `RESERVATIONS_FROM`) | Reservation confirmation emails (HTML + calendar invite) | The pass, QR and calendar download still work; no email is sent |
| **Web Push** (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `PUSH_ADMIN_TOKEN`) | A Notifications switch in the phone menu; `POST /api/push/send` notifies subscribers (needs Supabase for storage) | No notification offer anywhere |
| **Clerk** (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) | Sign-in on `/order`; favourites follow the account | Guests order without an account; favourites stay on the device |

## Security model

- Secrets are read only in `src/server/*` (every module imports `server-only`).
- The browser never sends a price: `/api/orders` recomputes each line from
  `src/data/ordering.ts` (menu prices + the menu's own extras) and validates the
  café, the pickup slot (New York time, the café's real hours, 10-minute grid)
  and every item and quantity.
- Supabase is used with the service role from the server only; row-level
  security is on, and the anon key can read nothing but availability.
- Stripe webhooks are verified against the raw body and signing secret.
- `/api/concierge` and `/api/orders` carry a per-IP courtesy rate limit
  (`src/server/rate-limit.ts`); put a shared store behind it for a hard limit.
- The Clerk proxy (`src/proxy.ts`) runs only on the ordering routes.

## Supabase setup

1. Create a project and run [`supabase/migrations/0001_ordering.sql`](../supabase/migrations/0001_ordering.sql)
   (SQL editor or `supabase db push`). It creates `menu_availability`, `orders`
   and `favorites`, enables RLS, adds the tables to Realtime and seeds every menu item as available.
2. Mark an item sold out: `update menu_availability set available = false where slug = 'cardamom-bun';`
   — `/order` picks it up within a minute.
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.

## Reservations

- `GET /api/reservations/availability?day=YYYY-MM-DD` returns remaining covers
  per time and seating area (window, indoor, outdoor). Times already past are closed; bookings open up to 60 days ahead.
- `POST /api/reservations` validates and books. With Supabase, the `book_table`
  function (`supabase/migrations/0002_reservations.sql`) locks the area's capacity row and inserts only if the party fits — no double-booking.
  Capacities live in `reservation_capacity` (defaults 8 / 16 / 10 covers).
- The confirmation carries a code (`NC-XXXXXX`) and a QR (`NOIR-RES:<code>`) for the host stand, an RFC 5545 invite (`src/lib/ics.ts`), and — with Resend — an email (`src/server/email.ts`).

## Reviews

Only genuine reviews are shown — none are seeded or invented. Submissions land in
`reviews` as *pending* (`supabase/migrations/0003_reviews.sql`); set `status = 'approved'`
to publish one. Without Supabase the product pages say there are no reviews yet.

## Installable app (PWA)

`public/sw.js` (no dependencies): pages network-first with the offline page as
fallback; `/menu`, `/locations` and `/offline` precached with their build assets
so they open offline; hashed assets cache-first; photography stale-while-
revalidate (capped); films and APIs never cached; push display and click. The
manifest carries shortcuts and install screenshots; iOS launch screens come from
`scripts/generate-splash.mjs`. Phones get an install offer from the second visit.

## Stripe setup

1. Set `STRIPE_SECRET_KEY` (test mode first).
2. Add a webhook endpoint → `https://<site>/api/stripe/webhook` for
   `checkout.session.completed` and `checkout.session.async_payment_succeeded`;
   set `STRIPE_WEBHOOK_SECRET`.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin (used for redirects).

## API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/concierge` | GET · POST | Availability · streamed barista reply |
| `/api/ordering` | GET | Sold-out slugs, which payments/accounts are on |
| `/api/orders` | POST | Validate, price and place an order (or start Checkout) |
| `/api/orders/confirm` | GET | Paid order summary after Checkout |
| `/api/stripe/webhook` | POST | Mark orders paid |
| `/api/favorites` | GET · PUT | Account favourites (Clerk + Supabase) |
| `/api/reservations/availability` | GET | Remaining covers per time and area |
| `/api/reservations` | POST | Book a table (atomic with Supabase), email confirmation |
| `/api/reviews` | GET · POST | Approved product reviews · submit one for moderation |
| `/api/push/subscribe` | POST · DELETE | Store / forget a push subscription |
| `/api/push/send` | POST | Notify every subscriber (Bearer `PUSH_ADMIN_TOKEN`) |
| `/api/currency` | GET | ECB reference rates from USD (Frankfurter, cached 6 h); `?amount&to` converts |
| `/api/weather` | GET | New York weather (Open-Meteo, cached 15 min) for the atmosphere and locations |
| `/api/health` | GET | Which integrations are configured (booleans only) — see `src/server/providers.ts` |

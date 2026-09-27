# Backend — optional services

The site runs fully static without any of these. Each service switches on a
feature when its keys are present (see [`.env.example`](../.env.example)), and
every feature says plainly when it is running without its backend.

| Service | Enables | Without it |
| --- | --- | --- |
| **Anthropic** (`ANTHROPIC_API_KEY`) | `/concierge` — the AI barista (streams Claude, grounded in the site's own menu, shop, recipes and cafés) | The concierge shows as resting; no canned replies |
| **Supabase** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | Orders stored in Postgres, live "sold out today" availability, synced favourites | Orders are validated and priced by the server but not stored — labelled *demo* |
| **Stripe** (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) | "Pay now" via Checkout; the webhook marks orders paid | Pay at pickup only |
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

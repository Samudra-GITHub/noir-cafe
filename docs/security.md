# Security

What protects the site, where it lives, and what to change when an integration
is switched on. Reporting a vulnerability: see [SECURITY.md](../SECURITY.md).

## Response headers — `security-headers.ts`

Sent on every route through `next.config.ts → headers()`.

| Header | Value | Why |
| :-- | :-- | :-- |
| `Content-Security-Policy` | see below | Limits where scripts, styles, frames and connections may come from |
| `X-Content-Type-Options` | `nosniff` | No MIME sniffing |
| `X-Frame-Options` | `DENY` | No framing (also `frame-ancestors 'none'`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Paths never leak to other origins |
| `Permissions-Policy` | camera, microphone, payment, USB, topics off; geolocation and motion sensors `self` | Locations asks for position (nearest café); the 3D cup tilts with the phone |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` | Isolates the window; keeps sign-in popups working |
| `Strict-Transport-Security` | 2 years, subdomains, preload | Only when `NEXT_PUBLIC_SITE_URL` is https |
| `X-Powered-By` | removed | `poweredByHeader: false` |

### Content-Security-Policy

With no integrations configured the policy is:

```text
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self';
frame-src 'none'; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'
```

- **Why `'unsafe-inline'` for scripts.** Every page is prerendered. A nonce-based
  policy must be generated per request, which would make all 44 pages dynamic
  and give up static delivery (Next's CSP guide). Inline scripts on the site are
  Next's own bootstrap, JSON-LD, the atmosphere boot and early-reveal snippets.
  No script is loaded from a third party unless its integration is configured,
  and no user input is ever rendered as HTML.
- **Google Fonts** are allowed for the Japanese pages only (Noto Serif/Sans JP).
- **Each integration adds its own origins, and only when configured:** Clerk
  (its Frontend API host, derived from the publishable key, plus
  `img.clerk.com`, `clerk-telemetry.com`, and Cloudflare Turnstile), Plausible
  (the configured script origin), Google Analytics (`googletagmanager.com`,
  `google-analytics.com`). Stripe Checkout is a full-page redirect and needs no
  CSP entry. Vercel Web Analytics is same-origin.
- `upgrade-insecure-requests` is added in production over https. Development adds
  `'unsafe-eval'` and `ws:` for React's debugging and hot reload.

## Images

`images.remotePatterns` is empty: the optimizer serves only files from
`public/`, so it can't be used as an open proxy. SVGs are not optimized.

## Rate limiting — `src/server/rate-limit.ts`

A fixed-window limit per client address (`x-forwarded-for`, set by the platform).

| Endpoint | Limit |
| :-- | :-- |
| `POST /api/concierge` | 20 / 10 min |
| `POST /api/orders` | 12 / 10 min |
| `POST /api/reservations` | 8 / 10 min |
| `POST /api/reviews` | 5 / hour |
| `POST /api/push/subscribe` | 10 / hour |
| `POST /api/push/send` | 20 / 10 min (plus a constant-time bearer check) |
| `GET /api/orders/confirm` | 30 / 10 min |
| `PUT /api/favorites` | 30 / min |
| `GET /api/reservations/availability` | 60 / min |
| `GET /api/currency` | 120 / min |
| Newsletter (server action) | 5 / 10 min |

`/api/weather` and `/api/ordering` take no input and are served from the
platform cache. `/api/stripe/webhook` is authenticated by Stripe's signature.

The limiter is in memory, so on serverless each instance counts on its own.
That blunts floods but isn't a global cap. For one, back `rateLimit()` with a
shared store (Upstash Redis, Vercel KV); the function signature stays the same.

## Input validation

Every route validates on the server; client validation is only for convenience.

- **Orders:** item slugs from the menu data, modifiers sanitized per item,
  quantities bounded, prices recomputed on the server, pickup slot checked
  against café hours.
- **Reservations:** date must be bookable, time in the published slots, guest
  count and seating from fixed lists, name and email bounded and checked.
- **Reviews, favourites, push:** fixed shapes, bounded lengths, lists capped. A
  push `url` must be a same-origin path (`/…`, never `//host`).
- **Concierge:** message count and length capped. The model sees only site data.
- **Currency:** amount must be a finite number from 0 to 1,000,000; currency from
  the supported list.
- **Newsletter:** email up to 254 characters, validated on the server.

## Secrets

All secrets are server-only (`src/server/*` imports `server-only`) and read from
the environment. The only public values are the ones prefixed `NEXT_PUBLIC_`.
`.env*` is git-ignored except the template, `.env.example`. `/api/health` reports
only whether each provider is configured.

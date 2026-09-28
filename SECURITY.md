# Security Policy

## Supported versions

| Version | Supported |
| :-- | :-- |
| 1.x | Yes |

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Use GitHub's [private vulnerability reporting](https://github.com/Samudra-GITHub/noir-cafe/security/advisories/new) with a description of the issue, steps to reproduce and the potential impact. You can expect an acknowledgement within 72 hours.

## Scope

Noir Café is a prerendered Next.js site with optional server integrations —
Supabase (orders, reservations, reviews, favourites, push subscriptions), Clerk
(sign-in), Stripe (Checkout), Resend (confirmation email), Anthropic (the
concierge) and Web Push. Each is off until its keys are set; without them no
personal data is stored server-side, and the bag, saved recipes and preferences
live only in the visitor's browser.

In scope: the route handlers under `src/app/api`, the proxy, server actions,
the security headers and CSP, and anything that could expose a secret or another
visitor's data. How the site is hardened is described in
[docs/security.md](docs/security.md).

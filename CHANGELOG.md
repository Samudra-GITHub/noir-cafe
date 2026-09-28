# Changelog

All notable changes to this project are documented here.

## [v1.0.0-noir-cafe] — Signature Edition — 2026-09-28

The desktop that shipped in 1.0.0 stays exactly as designed: every phase below was
screenshot-diffed against it at 1440 px and never drifted more than 0.021%. Everything
new lives on phones (below 768 px), on new routes, or behind the server.

### V25 — Signature release

- **Security.** Content-Security-Policy, HSTS (over https), `nosniff`, `DENY` framing,
  a strict referrer policy, a Permissions-Policy and COOP on every response
  (`security-headers.ts`). Third-party origins are allowed only for integrations that
  are configured. The image optimizer allows no remote hosts, and `X-Powered-By` is gone.
- **Rate limits** on every endpoint that takes input: currency, availability, order
  confirmation, favourites, push send, and the newsletter action, in addition to the
  existing ones. A shared `limited()` guard returns 429 with `Retry-After`.
- **Validation.** Push notification links must be same-origin paths (`//host` is
  rejected), and push text is length-bounded. Newsletter emails are capped at 254
  characters, with a localized "too many tries" message.
- **Analytics hooks** for Vercel Web Analytics, Plausible and Google Analytics 4. All
  are off until their variable is set, load `lazyOnload`, and skip visitors who send
  GPC or Do Not Track. `track()` events: reservation confirmed, order placed,
  newsletter subscribed, language and currency changed, app installed. No personal data.
- **Providers.** One registry (`src/server/providers.ts`) for Supabase, Clerk, Stripe,
  Resend, Anthropic and Web Push, recording what each powers, its keys and its fallback.
  `GET /api/health` reports which are on. `NEXT_PUBLIC_SUPABASE_URL` is accepted as an
  alias. `.env.example` covers every key, with the site URL, Search Console
  verification and analytics added.
- **SEO.** `WebSite` JSON-LD per language, Search Console verification, and `robots.txt`
  now keeps crawlers out of the API, the offline page and order receipts.
- **Branding and PWA.** `favicon.ico` (16/32/48, `scripts/generate-favicon.mjs`)
  alongside the SVG and Apple icons. The manifest gains language, shortcut icons and a
  launch handler.
- **Docs.** `docs/security.md`, `reports/final-launch-report.md`, a new README.
  `puppeteer-core` and `sharp` are now dev dependencies.

### M24 — Sams Studio case study

`case-study/` is generated from the repository. It contains 13 Behance panels, 8
mockups, 7 motion-breakdown SVGs with real timings, 9 design-system sheets, a
development timeline, GitHub media (animated README hero, architecture, folder tree,
tech stack, previews, badges), social sets for Instagram, LinkedIn, X, Pinterest and
Threads with captions, and a press kit with logo lockups.

### M23 — Four languages, four currencies

The site is available in English, 日本語, Français and Italiano under `app/[lang]`. The
proxy picks the language from the saved choice, then the browser, then English, and
English stays unprefixed. 641 strings are translated side by side, and coffee terms
stay in their own names. Prices can be shown in USD, EUR, JPY or GBP, using ECB rates
converted on the server (`/api/currency`) and formatted with `Intl`. The menu base
stays USD. Noto Serif/Sans JP load on Japanese pages only. Logical CSS properties are
used throughout, so layouts are ready for right-to-left languages. There are 44
prerendered pages, with hreflang and localized metadata.

### M22 — Accessibility gold standard

A full audit against WCAG 2.2 AA found 0 axe violations. Keyboard and focus
scenarios, reduced-motion answers for every animation, and 320 px reflow are
documented in `docs/accessibility`.

### M21 — Installable app

The menu and cafés work offline, with a service worker and an offline page. The
release adds branded launch screens for every iPhone and iPad, an install offer from
the second visit, and opt-in push notifications (VAPID).

### M20 — New York, live

A schematic map of the three neighbourhoods on phones, with subway lines in MTA
colours. It shows live New York time and weather, sunrise and sunset, live hours with
countdowns, the nearest station, and an optional distance computed on the device. The
ambience follows real New York rain.

### M19 — Story as a cinematic journey on phones

Five pinned chapters — Origin, Farmers, Roasting, Brewing and Ritual — use
scroll-driven transitions, pull quotes and a swipeable founding timeline.

### M18 — Premium shop

Brew guides on every product open in the Recipe Studio. The reviews architecture shows
only approved reviews; submissions are moderated and none are seeded. The release also
adds an accessible star rating.

### M17 — Real reservations

- Availability for each seating area, with atomic booking and no double booking.
- A Wallet-style pass with a scannable QR code.
- An RFC 5545 calendar invite.
- Confirmation email ready to go through Resend.

### M16 — Order ahead

- Café and pickup slot chosen within real hours.
- Drink customisation with real prices, and favourites.
- Server-side price recomputation.
- Supabase, Stripe Checkout and optional Clerk sign-in. Without them, orders run in a
  clearly labelled demo mode.

### M15 — Page transitions 2.0

The View Transitions API chooses a cut by destination (liquid, steam, stain, push or
dissolve). Page titles are shared elements. Reduced motion swaps pages instantly.

### M14 — AI barista-concierge

Claude streams replies grounded in the site's own menu, shop, recipes and cafés. The
key stays on the server. Without the key, the concierge shows as resting and gives no
canned replies.

### M12–M13 — 3D journey and Recipe Studio

- `/cup` is a scroll-driven three.js journey with procedural beans, cup, latte art and
  steam.
- `/brewing-lab/studio` covers dose, ratio, grind and water, an extraction model, a roast
  simulator, a flavour wheel and a brew timer.

### M11 — Sound and haptics

Procedural Web Audio (café ambience, pour, steam, grinder, cups) is muted by default.
Vibration patterns can be switched off. Both are loaded only when turned on.

### M10 — Atmosphere engine for phones

Light follows New York's clock. Phones also get steam that answers scroll speed,
optional rain, grain and dust, each at no more than 8% opacity. The desktop keeps its
designed light.

### M9 — Performance

Mobile Lighthouse went from 84–92 to 89–92, and desktop scores 99. The first-load
JavaScript shrank by 28.7 KB gzipped per route. LazyMotion, deferred films and
trimmed fonts are behind the gains.

### M1–M8 — Mobile-first experience below 768 px

- A full-screen hero and a glass bottom dock.
- Swipeable drink cards, sticky menu chips and sheets.
- A Wallet-style reservation and a product page in the style of the Apple Store.

## [1.0.0] — 2026-09-26

### Added

- **Phase 9 — Master polish.** First-visit loader, blur-and-grain route transitions, pinned scroll story across five films, ambient audio architecture, coffee-bean cursor, unified photographic grade, manifest, Open Graph and Twitter cards, structured data, robots and sitemap, caching and image optimisation.
- **Phase 8 — Shop.** Editorial storefront, category filters, quick view with roast, variant and quantity selectors.
- **Phase 7 — Locations.** Illustrated map with coffee-bean markers, flagship panel with ambient film, open-now status.
- **Phase 6 — Reservation.** Keyboard calendar, time, guests, seating, validated details, live summary.
- **Phase 5 — Brewing Lab.** Live recipe card, transformation cards, five expandable brewing methods with timers and indicators.
- **Phase 4 — Our Story.** Editorial hero, pull quote, image reveals, values, founding timeline.
- **Phase 3 — Menu.** Scrollspy index, roast meters, flavor chips, mobile accordion.
- **Phase 2.5 — Homepage polish.** Warm glass, film grain, steam, micro-interactions, AA contrast tokens.
- **Phase 2 — Homepage.** Pixel-matched build of every homepage section.
- **Phase 1 — Design system.** Tokens, Tailwind v4 theme, primitives and motion utilities.

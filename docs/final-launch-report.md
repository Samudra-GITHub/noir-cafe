# Noir Café — final launch report

**Release:** `v1.0.0-noir-cafe` — Signature Edition · **Date:** 2026-09-28 ·
**Build:** Next.js 16.3.6 (Turbopack), React 19.2, production `next build` + `next start`

## Verdict

The site is ready to launch with no keys at all. Every page is complete in four
languages, and every integration falls back to a labelled demo mode. Going live on a
real domain needs one value, `NEXT_PUBLIC_SITE_URL`. Each backend feature needs its own
keys (see [Credentials](#credentials-needed-to-go-live)). Nothing in the code is blocked
on them.

## What shipped in this build

| Phase | Result |
| :-- | :-- |
| **M23** — i18n & currency | English (unprefixed), 日本語, Français, Italiano under `app/[lang]` · 44 prerendered pages · 641 strings, 0 missing · USD / EUR / JPY / GBP from ECB rates on the server · Noto JP on Japanese pages only · logical CSS, RTL-safe |
| **M24** — case study | `case-study/`: 13 Behance panels, 8 mockups, 7 motion SVGs, 9 design-system sheets, timeline, GitHub media and badges, 27 social images with captions, press kit |
| **V25** — signature release | Security headers and CSP, rate limits and validation, analytics hooks (off by default), provider registry and `/api/health`, SEO and PWA completion, favicon, docs, README, release notes |

Full notes for every phase: [CHANGELOG.md](../CHANGELOG.md).

## Quality gates

| Gate | Result |
| :-- | :-- |
| TypeScript (`tsc --noEmit`) | ✅ 0 errors |
| ESLint | ✅ 0 errors · 1 warning, carried over from earlier phases (`aria-description` on the map markers — valid ARIA 1.3; the jsx-a11y rule predates it) |
| `next build` | ✅ 44 SSG pages + API routes, OG images, icons, manifest, robots, sitemap |
| `i18n:check` · `rtl:check` | ✅ 641 source strings, 0 missing · 0 physical-direction utilities |
| Device regression (6 devices × 11 routes) | ✅ **227 / 227** — status, horizontal overflow, console, axe serious/critical |
| Desktop unchanged vs the Figma-matched build | ✅ home 0.001% · menu 0.006% · story 0.007% · lab 0.003% · reservation 0.021% · locations 0.004% · shop 0.005% px, heights identical |
| Phase suites | ✅ atmosphere 17/17 · New York live 16/16 · installable/offline 17/17 · accessibility 20/20 · i18n & currency 37/37 |
| Accessibility audit (axe, all routes × phone/desktop) | ✅ 0 violations; pixel-contrast, headings, skip link, focus visibility and motion all pass; results match the committed audit |
| Keyboard & reduced-motion interactions | ✅ 20 / 20 |
| CSP sweep — Chrome | ✅ 88 loads (11 routes × 4 languages × phone/desktop, scrolled through): 0 violations, 0 console or page errors |
| CSP sweep — Microsoft Edge 136 | ✅ 44 loads (English + Japanese): 0 violations, 0 errors |
| Hydration | ✅ No hydration warnings in any sweep |

Responsive screenshots for all six devices and 11 routes are in the QA run output. The
curated set is in [`case-study/screens`](../case-study/screens).

## Lighthouse

Lighthouse 12, production build on localhost, GPU off. Each figure is the median of the
successful runs out of five (see the note below).

| Route | Desktop perf | Mobile perf | Mobile LCP | TBT (mobile) | CLS | A11y · BP · SEO |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Home | **99** | **93** | 3.2 s | 30 ms | 0 | 100 · 100 · 100 |
| Menu | **97** | **82** | 4.7 s | 90 ms | 0 | 100 · 100 · 100 |
| Reservation | **99** | **91** | 3.5 s | 40 ms | 0 | 100 · 100 · 100 |

- The home page on mobile depends on New York's weather. Today was dry; the M24
  case-study figure of **84** was measured with rain on, the heaviest atmosphere state.
  Both are real, and the case study quotes the conservative one.
- **Menu on mobile (82).** The LCP image is preloaded and arrives immediately. Its time
  goes to render delay under the 4× CPU throttle while the page hydrates; the reveal
  itself starts at first paint (verified with an unthrottled probe: LCP 1.47 s). The
  score was 77 at M23. Going further means removing the menu's designed reveal on phones,
  a design change we don't want.
- **Intermittent `NO_NAVSTART`.** 7 of 30 runs ended without a trace, so Lighthouse
  scored them 0. This first appeared with V25's security headers. The likely cause is
  `Cross-Origin-Opener-Policy`, which makes Chrome switch browsing-context groups on
  navigation; Lighthouse's trace can miss that switch. Visitors are unaffected, but
  PageSpeed Insights may occasionally fail to measure. It is **left in place pending your
  decision**, because dropping a security header is a trade-off for you to make. Remove
  the one line in `security-headers.ts` if measurement reliability matters more than
  opener isolation. Nothing on the site opens cross-origin windows except Clerk sign-in,
  which the chosen value already allows.

## Security

Details: [docs/security.md](../docs/security.md).

- **Headers on every response.** CSP, `nosniff`, `X-Frame-Options: DENY` plus
  `frame-ancestors 'none'`, `strict-origin-when-cross-origin`, and Permissions-Policy
  (camera, microphone, payment and topics off; geolocation and motion sensors self-only).
  COOP is set, and HSTS is sent over https. `X-Powered-By` is removed.
- **CSP.** Same-origin scripts, with `'unsafe-inline'` kept deliberately so the 44 pages
  stay static rather than per-request nonce-rendered. A third-party origin appears only
  when its integration is configured.
- **Image optimizer.** No remote hosts.
- **Rate limits.** Every endpoint that takes input is rate-limited, 429 with
  `Retry-After`. The limiter is in memory; see [Known limits](#known-limits).
- **Validation on the server** for every route and the newsletter action. V25 fixed a
  protocol-relative (`//host`) URL in push payloads and bounded push and newsletter
  input.
- **Secrets.** Server-only, from the environment, never committed. `/api/health`
  exposes only booleans.

## SEO

- **Every page has:**
  - a localized title and description, and a canonical URL;
  - hreflang for en, ja, fr and it, with `x-default`;
  - Open Graph with locale and alternates, and Twitter `summary_large_image` with a
    1200 × 630 image per route.
- **Structured data:**
  - `Organization`
  - `WebSite` per language
  - 3 × `CafeOrCoffeeShop` with hours
  - `Menu` with prices
  - `Product` list
- **Crawling:**
  - A sitemap of 44 URLs with alternates.
  - `robots.txt` that disallows `/api/`, the offline page and order receipts.
  - `noindex` on those two pages.
- **Search Console.** Verification is available through
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## PWA

- **Manifest.** Includes id, language, standalone display with an override, theme,
  192 / 512 / maskable icons, three shortcuts with icons, narrow and wide screenshots,
  and a launch handler that focuses the open window.
- **Service worker.** The menu and cafés work offline, and there is an offline page.
- **Launch screens.** 11 iOS/iPadOS launch screens.
- **Icons.** SVG favicon, `favicon.ico` (16/32/48) and an Apple touch icon.
- **Notifications.** Push is opt-in and appears only when VAPID keys exist.

## Analytics

Vercel Web Analytics, Plausible and GA4 are wired and **off**. Each switches on with a
single environment variable. They load after the page is idle, and skip visitors who
send Global Privacy Control or Do Not Track. Six events carry no personal data:
reservation confirmed, order placed, newsletter subscribed, language changed, currency
changed and app installed. The CSP allows each provider's origin only when that provider
is enabled.

## Credentials needed to go live

None of these are in the repository. Each goes in the host's environment (Vercel →
Settings → Environment Variables); `.env.example` documents every one.

| Needed for | Variables | Until then |
| :-- | :-- | :-- |
| **Canonical domain** (SEO, OG, sitemap, HSTS, payment redirects) | `NEXT_PUBLIC_SITE_URL` | URLs resolve to `http://localhost:3000` |
| Orders, availability, reviews, favourites, push storage | `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ run `supabase/migrations`) | Demo orders, default capacity |
| Sign-in | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Guest ordering |
| Card payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Pay at pickup |
| Confirmation email | `RESEND_API_KEY`, `RESERVATIONS_FROM` (verified sender) | No email; the pass and `.ics` still work |
| AI concierge | `ANTHROPIC_API_KEY` | The concierge rests |
| Push notifications | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `PUSH_ADMIN_TOKEN` | No notification switch |
| Analytics (optional) | `NEXT_PUBLIC_VERCEL_ANALYTICS`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_GA_ID` | No analytics |
| CI deploys (optional) | `VERCEL_TOKEN` — in the CI secret store, not the app | Deploy with `npx vercel --prod` |

The Supabase anon key isn't used: every query runs on the server.

## Known limits

- **Translations** were written for this build. Native speakers should review the
  Japanese, French and Italian before launch, especially the marketing lines
  ([docs/i18n.md](../docs/i18n.md)).
- **Open Graph image text** is English on every language. The page titles and
  descriptions around it are localized.
- **Rate limiting** is per server instance. For a hard global limit on serverless, back
  `rateLimit()` with Upstash or Vercel KV.
- **Cross-browser coverage** here is Chrome 154 and Edge 136 (both Chromium). Firefox
  and Safari aren't installed on the build machine. Earlier phases were built with
  their fallbacks in mind: no View Transitions and no scroll-driven animations degrade to
  instant, static states. Still, do one manual pass on Safari (iOS) and Firefox after
  deploy.
- **Menu mobile LCP** — see the Lighthouse notes above.

## Launch checklist

1. Create the Vercel project from `main`; set `NEXT_PUBLIC_SITE_URL` to the domain.
2. Add whichever provider keys you're switching on; run the Supabase migrations first.
3. Deploy, then check `/api/health`, `/robots.txt`, `/sitemap.xml` and one page per
   language.
4. Submit the sitemap in Search Console; register the Stripe webhook at
   `/api/stripe/webhook`.
5. Run PageSpeed Insights on home, menu and reservation, and do a Safari and Firefox
   spot check.

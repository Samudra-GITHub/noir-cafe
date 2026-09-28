<div align="center">

<img src="case-study/github/readme-hero.svg" alt="NOIR CAFÉ — Where every cup tells a story. A cinematic café in Next.js 16 · four languages · installable · WCAG 2.2 AA" width="100%" />

<br />

<img src="case-study/github/badges/lighthouse-desktop.svg" alt="Lighthouse desktop performance 98" height="24" />
<img src="case-study/github/badges/lighthouse-mobile.svg" alt="Lighthouse mobile performance 84" height="24" />
<img src="case-study/github/badges/accessibility.svg" alt="Accessibility 100" height="24" />
<img src="case-study/github/badges/best-practices.svg" alt="Best practices 100" height="24" />
<img src="case-study/github/badges/seo.svg" alt="SEO 100" height="24" />
<img src="case-study/github/badges/wcag.svg" alt="WCAG 2.2 AA" height="24" />
<img src="case-study/github/badges/languages.svg" alt="Four languages" height="24" />
<img src="case-study/github/badges/pwa.svg" alt="Installable PWA" height="24" />

<br />
<br />

**[Live demo](#live-demo)** &nbsp;·&nbsp; **[Case study](case-study/README.md)** &nbsp;·&nbsp; **[Launch report](reports/final-launch-report.md)** &nbsp;·&nbsp; **[Changelog](CHANGELOG.md)** &nbsp;·&nbsp; **[Figma](https://www.figma.com/design/rB8iNTVSekK73jEf5ASRYR/Untitled?node-id=0-1)**

</div>

---

<p align="center">
  <img src="case-study/mockups/macbook-pro.png" alt="Noir Café's home page on a MacBook Pro — the espresso film behind 'Where Every Cup Tells A Story'" width="100%" />
</p>

Noir Café is a specialty-coffee house in New York that exists only as a website — a
brand, identity and product designed and engineered by **Sams Studio**. It started as
seven Figma frames at 1440 px and grew, phase by phase, into a mobile-first product.
Visitors can order ahead, book a real table and get a wallet-style pass, take a 3D
journey through the cup, tune a recipe, ask an AI barista, and install the site as an
app that works offline. It speaks English, 日本語, Français and Italiano and prices in
USD, EUR, JPY or GBP.

One rule held throughout: **the desktop could not change by a pixel.** Every phase was
screenshot-diffed against the Figma-matched build on six devices and never drifted more
than 0.021%. Phones got their own product.

## Live demo

The site runs complete with no accounts or keys. Every integration is optional and
falls back to a clearly labelled demo mode.

```bash
git clone https://github.com/Samudra-GITHub/noir-cafe.git
```

```bash
cd noir-cafe && npm install && npm run dev
```

Then open <http://localhost:3000> — or <http://localhost:3000/ja>, `/fr`, `/it`.
The public deployment link is added here once `NEXT_PUBLIC_SITE_URL` is set on Vercel
(see [Deploy](#deploy)).

## Three rooms, one design

<p align="center">
  <img src="case-study/github/responsive-preview.png" alt="The same home page on a MacBook, an iPad and an iPhone" width="100%" />
</p>

<p align="center">
  <img src="case-study/github/mobile-preview.png" alt="Five phone screens — home, menu, reservation pass, New York map and the Japanese menu" width="100%" />
</p>

## Features

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="case-study/mockups/iphone-16-pro.png" alt="Menu, home and reservation on iPhone 16 Pro" width="100%" />
      <h3>A phone product, not a shrunk page</h3>
      <p>Glass dock, sheets, swipeable drink cards, a story told in five pinned chapters, and an atmosphere that follows New York's clock and real weather. When it rains in New York, it rains on your phone.</p>
    </td>
    <td width="50%" valign="top">
      <img src="case-study/mockups/ipad.png" alt="Brewing Lab on iPad beside the story on iPhone" width="100%" />
      <h3>Order, reserve, brew</h3>
      <p>Order ahead with real pickup slots and server-priced customisation. Book a table against live availability and get a pass with a QR code and a calendar invite. Tune dose, ratio, grind and water in the Recipe Studio.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <img src="case-study/screens/phone-ja-menu.jpg" alt="The menu in Japanese on a phone" width="48%" /> <img src="case-study/screens/phone-fr-menu.jpg" alt="The menu in French on a phone" width="48%" />
      <h3>Four languages, four currencies</h3>
      <p>641 strings translated side by side; espresso stays espresso. Prices convert on the server from ECB reference rates and format with <code>Intl</code>. Japanese gets its own serif and line-breaking rules.</p>
    </td>
    <td width="50%" valign="top">
      <img src="case-study/screens/phone-concierge.jpg" alt="The AI barista-concierge on a phone" width="48%" /> <img src="case-study/screens/phone-cup.jpg" alt="The 3D cup journey on a phone" width="48%" />
      <h3>An AI barista and a 3D cup</h3>
      <p>The concierge streams Claude replies grounded in the real menu, shop and cafés — it can only recommend what exists. <code>/cup</code> is a scroll-driven three.js journey from bean to latte art.</p>
    </td>
  </tr>
</table>

**Also:** an installable app with offline menu and cafés and launch screens; a live New
York map with subway lines and countdowns; procedural sound and haptics (off by
default); cinematic page transitions; a premium shop with brew guides and moderated
reviews.

## Motion

One curve moves everything — `cubic-bezier(0.22, 1, 0.36, 1)` — and every animation has
a reduced-motion answer. The diagrams below are generated from the real timings in the
code.

<table>
  <tr>
    <td width="50%"><img src="case-study/motion-breakdown/01-hero-animation.svg" alt="Hero animation timeline" width="100%" /></td>
    <td width="50%"><img src="case-study/motion-breakdown/07-page-transitions.svg" alt="Page transitions — five voices" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="case-study/motion-breakdown/03-carousel.svg" alt="Carousel springs" width="100%" /></td>
    <td width="50%"><img src="case-study/motion-breakdown/05-steam-engine.svg" alt="Steam engine — atmosphere budget" width="100%" /></td>
  </tr>
  <tr>
    <td width="50%"><img src="case-study/motion-breakdown/02-scroll-story.svg" alt="Scroll story" width="100%" /></td>
    <td width="50%"><img src="case-study/motion-breakdown/04-glass-navigation.svg" alt="Glass navigation" width="100%" /></td>
  </tr>
</table>

## Design system

<p align="center">
  <img src="case-study/design-system/01-color-palette.png" alt="Colour palette with measured contrast ratios" width="49%" />
  <img src="case-study/design-system/02-typography-scale.png" alt="Typography scale" width="49%" />
</p>

Cormorant Garamond for display, Inter for reading, IBM Plex Mono for prices, times and
labels. Warm neutrals and one caramel accent, with darker inks where small text needs
AA contrast. Tokens live in [`src/styles/tokens.css`](src/styles/tokens.css); the full
set of sheets is in [`case-study/design-system`](case-study/design-system).

## Tech stack

<p align="center"><img src="case-study/github/tech-stack.svg" alt="Next.js 16.3, React 19.2, TypeScript 5, Tailwind CSS 4, Framer Motion 12, Three.js and React Three Fiber, Lenis, Supabase, Stripe, Clerk, Anthropic SDK, Web Push" width="100%" /></p>

## Architecture

<p align="center"><img src="case-study/github/architecture.svg" alt="Static by default, dynamic where it earns it: the browser, a proxy that picks the language, prerendered pages, route handlers and optional integrations" width="100%" /></p>

Static by default: 44 pages (11 routes × 4 languages) are prerendered. The proxy chooses
the language (saved choice → browser → English) and scopes Clerk to ordering. Route
handlers do the dynamic work, and every integration is optional:

| Provider | Powers | Without it |
| :-- | :-- | :-- |
| Supabase | Orders, availability, reviews, favourites, push subscriptions | Demo orders (validated, not stored), default capacity |
| Clerk | Optional sign-in, synced favourites | Guest ordering |
| Stripe | Pay now with Checkout | Pay at pickup |
| Resend | Confirmation email with calendar invite | Confirmation page and `.ics` download |
| Anthropic | The AI barista-concierge | The concierge rests |
| Web Push | Notifications from the installed app | No notifications switch |

`GET /api/health` shows which are on. Hardening — CSP, headers, rate limits, validation
— is described in [docs/security.md](docs/security.md).

<p align="center"><img src="case-study/github/folder-structure.svg" alt="Folder structure: src/app/[lang], app/api, components, i18n, lib, server, data, styles, proxy.ts; public, supabase migrations, scripts, docs, case-study" width="100%" /></p>

## Performance

Production build, Lighthouse 12, median of 5 runs on localhost (home page; the release run per route — desktop 97–99, mobile 82–93 — is in the [launch report](reports/final-launch-report.md#lighthouse)):

| | Desktop | Mobile |
| :-- | :-- | :-- |
| Performance | **98** | **84** (home, with rain on — the heaviest atmosphere state) |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| CLS | 0 | 0 |

- three.js, the sound engine and Lenis never ship in any route's first load.
- Translation tables are server-only; the Japanese web fonts load only on Japanese pages.
- Films wait for first paint and idle, and use 720p on phones.
- Images are AVIF/WebP with responsive sizes and cached immutably for a year.

Every phase ran 227 automated checks across iPhone 13, iPhone 15 Pro, Pixel 9, Galaxy
S24, iPad Air and a 1440 MacBook, plus axe in all four languages. Details are in
[docs/perf](docs/perf/README.md), [docs/accessibility](docs/accessibility/README.md)
and the [launch report](reports/final-launch-report.md).

## Development timeline

<p align="center"><img src="case-study/timeline/development-timeline.svg" alt="Development timeline from Phase 1 to V25" width="100%" /></p>

## Installation

Requires Node.js 20.9 or later.

```bash
npm install
```

```bash
npm run dev
```

Checks before a pull request:

```bash
npx tsc --noEmit && npm run lint && npm run i18n:check && npm run rtl:check && npm run build
```

### Environment

Copy [`.env.example`](.env.example) to `.env.local` and fill in only what you need.
Every key is optional; the file explains each one.

### Deploy

```bash
npx vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin so canonical URLs, hreflang, Open
Graph, the sitemap, JSON-LD and HSTS resolve. Then add provider keys as you switch
features on.

## Screenshots

<table>
  <tr>
    <td><img src="case-study/screens/phone-home.jpg" alt="Home, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-menu.jpg" alt="Menu, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-story.jpg" alt="Story, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-reservation.jpg" alt="Reservation, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-locations.jpg" alt="Locations, phone" width="100%" /></td>
  </tr>
  <tr>
    <td><img src="case-study/screens/phone-order.jpg" alt="Order ahead, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-shop.jpg" alt="Shop, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-lab.jpg" alt="Brewing Lab, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-studio.jpg" alt="Recipe Studio, phone" width="100%" /></td>
    <td><img src="case-study/screens/phone-ja-home.jpg" alt="Home in Japanese, phone" width="100%" /></td>
  </tr>
</table>

<p align="center">
  <img src="case-study/screens/desktop-menu.jpg" alt="Menu, desktop" width="49%" />
  <img src="case-study/screens/desktop-reservation.jpg" alt="Reservation, desktop" width="49%" />
</p>

More in [`case-study/`](case-study/README.md): Behance panels, mockups, social sets and
the press kit.

## Credits

- **Design and engineering** — Sams Studio.
- **Photography** — [Unsplash](https://unsplash.com) contributors, under the Unsplash
  License, graded into one warm, filmic language.
- **Film** — ambient coffee clips supplied for the project.
- **Type** — Cormorant Garamond, Inter, IBM Plex Mono, Noto Serif JP and Noto Sans JP
  (SIL Open Font License).
- **Icons** — [Lucide](https://lucide.dev) (ISC).
- **Data** — weather from [Open-Meteo](https://open-meteo.com); exchange rates from
  the ECB via [Frankfurter](https://frankfurter.dev).

See also: [Project overview](PROJECT_OVERVIEW.md) · [Contributing](CONTRIBUTING.md) ·
[Security](SECURITY.md) · [Code of conduct](CODE_OF_CONDUCT.md)

## License

[MIT](LICENSE) for the code. Photography and film are licensed by their owners and are
not covered by the MIT license.

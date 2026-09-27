# Performance — Phase M9

Goal: Lighthouse mobile 92–95+ without changing a single desktop pixel.

## Result

Lighthouse 12, mobile preset (Moto G Power, slow 4G, 4× CPU), **median of 5 runs**,
production build, same machine and harness for before and after
(`--disable-gpu` for stable paint timing). Full table: [`lighthouse-m9.txt`](lighthouse-m9.txt).

| Route | Mobile before (M8) | Mobile after (M9) | Desktop after | LCP (mobile, simulated) |
| --- | --- | --- | --- | --- |
| `/` | 85 | **90** | 99 | 4.2 s → 3.6 s |
| `/menu` | 84 | **90** | 99 | 4.4 s → 3.6 s |
| `/story` | 91 | **92** | 99 | 3.5 s → 3.4 s |
| `/brewing-lab` | 84 | **89** | 99 | 4.5 s → 3.7 s |
| `/reservation` | 92 | **92** | 99 | 3.4 s → 3.3 s |
| `/locations` | 84 | **92** | 99 | 4.4 s → 3.3 s |
| `/shop` | 85 | **91** | 99 | 4.5 s → 3.5 s |

Accessibility, Best Practices and SEO: 100 on every route. TBT ≤ 50 ms. CLS 0.

Desktop is pixel-identical to M8: full-page 1440px captures with motion frozen and
video frames masked differ by ≤ 0.021% of pixels (glyph-edge antialiasing from the
trimmed fonts; no layout or colour change).

## Bundle diff

`node scripts/bundle-report.mjs` (first-load, gzip; `--diff before.json after.json`):

| | Before | After | Δ |
| --- | --- | --- | --- |
| First-load JS | 226–231 KB | 197–202 KB | **−28.7 KB** (−12.5%) |
| Preloaded fonts | 84.2 KB | 69.3 KB | **−14.9 KB** |
| CSS | 18.0 KB | 17.7 KB | −0.3 KB |

Client JS by package: `node scripts/bundle-report.mjs --modules`
(after `npx next experimental-analyze --output`). See [`modules-before.txt`](modules-before.txt).

## What changed

| Task | Implementation |
| --- | --- |
| Framer Motion off the critical path | `LazyMotion` + `m` components everywhere (`strict`); the `domMax` feature bundle is a separate chunk requested **after first paint** (`components/motion/MotionProvider`). |
| Above-the-fold reveals independent of JS | `FadeUp` is a CSS transition + IntersectionObserver; an inline end-of-body script (`lib/early-reveal`) starts reveals already on screen at first paint. The Locations film fades in with CSS. |
| Lenis after first interaction | `lenis/react` replaced by a tiny store (`lib/lenis`); Lenis is imported on the first wheel/keyboard scroll, fine pointers only. |
| Hero video metadata only | `preload="metadata"`; every film waits for first paint + load + idle (`lib/page-ready`), so no video ever competes with the LCP. Hidden story chapters defer film **and** poster. |
| AVIF/WebP posters, next/image | Video posters render through `next/image` (AVIF → WebP, responsive, cover-aware `sizes`), preloaded with `fetchPriority="high"` where above the fold. |
| Remove unused font weights | Runtime audit of every text node: Cormorant 400/500, Inter 400/500/600, Plex Mono 400, italics 400. Plex Mono 500 dropped; italics are static 400; Cormorant and Inter self-hosted with the weight axis trimmed (`src/fonts`). |
| Font subsets only | Latin subset only; italics and mono not preloaded. |
| Preload only critical fonts | Two preloads (upright display + body). next/font self-hosts, so no third-party preconnect is needed. |
| Bundle / route splitting | Framer features, Lenis and the atmosphere canvas are async chunks; route-level splitting is Next's default per page. |
| Bundle analyzer report | `scripts/bundle-report.mjs` (routes, diff, packages). |

## Network waterfall

Before and after, home on mobile (observed trace; markers are observed FCP/LCP):

- [`waterfall-home-before.svg`](waterfall-home-before.svg) — the hero film (1.3 MB) and chapter films start before first paint.
- [`waterfall-home-after.svg`](waterfall-home-after.svg) — nothing but HTML, CSS, two fonts, the poster and scripts before paint; films follow load + idle.
- [`waterfall-menu-after.svg`](waterfall-menu-after.svg)

Regenerate: `node scripts/waterfall.mjs report.json out.svg "Title"`.

## Why not 95 on every page

Lighthouse's simulated LCP counts every byte requested before the observed LCP.
What remains is irreducible for this stack: React + the Next router (~113 KB gz),
the motion hooks used by the scroll-linked hero and nav (~45 KB), two preloaded
fonts (69 KB) and, on `/`, `/menu` and `/brewing-lab`, HTML just over the first
TCP round trip (14.6 KB), which costs ~0.3 s of simulated FCP. The observed LCP on
all pages is 150–400 ms.

## M23: main-thread fixes in the atmosphere engine

While measuring the i18n build, I found and fixed two paths in the phone atmosphere engine (added in M10) that forced repeated style and layout work:

| Cause | Effect (home, mobile, Lighthouse) | Fix |
| --- | --- | --- |
| The light's registered custom properties (`--sun-x`, `--sun-color`…) were `inherits: true` and transitioned on `:root`. When New York's weather turned rain on after load, every element restyled on every frame for 2.4 s. | Style & Layout 5.1 s and TBT ≈ 3 s whenever it rained in New York | The properties are now `inherits: false`, and they live and transition on the two light layers only. |
| The steam and rain canvas read `window.scrollY` inside its frame loop and wrote a data attribute every 15 frames. | A forced style and layout pass on every frame | The scroll position now comes from scroll events. The attribute is written only when its value changes. The loop starts after the page has loaded and gone idle. |

Measured while it was raining in New York, which is the worst case (median of 5 runs):

| Metric | Before | After |
| --- | --- | --- |
| Style & Layout | 5,132 ms | 758 ms |
| TBT | 3,060 ms | 130 ms |
| Home score | 58 | 84 |

The weather now comes from `/api/weather`, which the server caches for 15 minutes, instead of each browser calling Open-Meteo directly.


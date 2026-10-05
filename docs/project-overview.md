# Project Overview

**Noir Café** is a seven-page specialty coffee website built as a cinematic, editorial experience — a design-engineering showcase that treats a café's digital presence with the same care as its coffee.

## Goals

1. Recreate the Figma design faithfully, verified against the exports in a headless browser.
2. Build everything from a single design system — tokens, primitives and one motion language.
3. Make motion meaningful, never decorative, and always optional.
4. Meet AA accessibility and strong Core Web Vitals.

## Pages

| Route | Purpose |
| :-- | :-- |
| `/` | Sticky film hero, scroll story, featured drinks, carousel, story and lab previews, visit and shop |
| `/menu` | Six categories with scrollspy, roast meters and flavor notes |
| `/story` | Founding story, image reveals, values, timeline |
| `/brewing-lab` | Live recipe, transformation cards, five brewing methods with timers |
| `/reservation` | Calendar, time, guests, seating, validated details, live summary |
| `/locations` | Illustrated map, flagship panel, three cafés with open-now status |
| `/shop` | Featured set, filters, quick view with variants and quantity |

## Key decisions

- **Next.js 16 App Router, fully static.** Every route prerenders; metadata, OG images, manifest, robots and sitemap are file-based.
- **Tailwind CSS v4 `@theme` over CSS variables.** Tokens live in one place and cascade to utilities.
- **Framer Motion with shared variants, Lenis for inertia, React View Transitions for routes.**
- **Accessible ink tokens.** Small caramel and muted text use deepened shades that pass AA, while fills keep the original palette.
- **No backend yet.** Reservation, newsletter and bag validate and respond on the client and are ready to wire to services.

## Quality gates

`npm run typecheck`, `npm run lint` and `npm run build` must pass. Pages are verified by section-height and overlay comparison against `design/*.png` at 1440px, interaction tests in headless Chrome, and Lighthouse on the production build.

## What's next (Phase 10)

Public deployment, booking and email integrations, checkout, a CMS for menu and products, and a service worker for offline support.

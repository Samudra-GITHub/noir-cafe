# Noir Café — Sams Studio case study package

Everything a portfolio, a press page or a social launch needs, generated from the
repository itself: screens are captured from a production build, colours and type
come from `src/styles/tokens.css`, menu prices from `src/data/menu.ts`, and every
number quoted in the copy is written to `source/facts.json` from a measurement.

| Folder | Contents |
| --- | --- |
| `behance/` | 13 panels, 1600 px wide — cover, hero, introduction, problem, research, moodboard, typography, colour system, components, motion, mobile experience, final mockups, reflection |
| `mockups/` | MacBook Pro, iPhone 16 Pro, iPad, coffee-table magazine, store poster, tote bag, coffee cup, menu board (2000 × 1400) |
| `motion-breakdown/` | SVG + PNG diagrams with the real timings — hero, scroll story, carousel, glass navigation, steam engine, loader, page transitions |
| `design-system/` | Palette (with measured contrast), type scale, grid, spacing, radius, elevation & glass, motion tokens, icons, components |
| `timeline/` | Development timeline, Phase 1 → V25, from `git log` |
| `github/` | README hero (animated SVG), architecture, folder structure, tech stack, responsive + mobile previews, Lighthouse and standards badges |
| `social/` | Instagram carousel (8) + stories (4), LinkedIn carousel (6), X (3), Pinterest (3), Threads (3) — captions in `social/CAPTIONS.md` |
| `press-kit/` | Logo lockups (SVG + PNG @2×), fact sheet and boilerplate |
| `screens/` | The raw captures everything above is composed from |

## Regenerating

```bash
npm run build && npx next start -p 3100     # a production build to capture
node case-study/source/capture.mjs           # screens/ (desktop, tablet, phone, ja/fr/it)
node case-study/source/render.mjs            # everything else
node case-study/source/render.mjs --only behance,social
```

The renderer drives a local Chrome through `puppeteer-core` (`CHROME_PATH` to override),
compresses with `sharp`, and warns when a composition runs into its footer.
Performance numbers live in `source/measurements.json` — update them from a fresh
Lighthouse run (`median of 5`, see `docs/perf/README.md`) rather than editing copy.

## Sources and credits

- Photography: [Unsplash](https://unsplash.com) contributors, under the Unsplash License, graded for the site (`public/images`). Film: ambient coffee clips supplied for the project (`public/videos`).
- Typefaces: Cormorant Garamond, Inter, IBM Plex Mono, Noto Serif JP / Noto Sans JP — all SIL Open Font License.
- Icons: Lucide (ISC).
- Device frames are drawn in CSS; no third-party mockup templates are used.

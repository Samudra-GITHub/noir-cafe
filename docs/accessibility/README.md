# Accessibility report — Noir Café

**Target:** WCAG 2.2 AA across every route, at phone (390 px) and desktop (1440 px) widths.
**Audited:** 12 routes × 2 viewports = 24 page states, plus 20 interaction scenarios.
**Result:** axe finds 0 violations at any impact level on all 24 page states, and all 20 interaction checks pass.

The numbers in this report come from `node scripts/a11y-audit.mjs` and `node scripts/a11y-interactions.mjs`, run against a production build (`npm run build && npm start -p 3100`). The raw per-page output is in [`audit.json`](./audit.json).

## What is measured

| Area | Method | Success criterion |
| --- | --- | --- |
| Automated rules | axe-core 4.13: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` and best-practice rules. It runs after the whole page has been scrolled, so lazily mounted sections are included. | Various |
| Contrast over imagery | axe marks text over photography, gradients and glass as "needs review". For each such node, the audit hides only that text, captures the real backdrop, and compares the text colour (with its alpha blended) against the **worst** backdrop pixel. | 1.4.3 |
| Structure | Checks `lang`, the document title, exactly one `<h1>`, exactly one `<main>`, no skipped heading levels, and `alt` on every image. | 1.3.1, 2.4.2, 3.1.1 |
| Skip link | It must be the first Tab stop, and activating it must move focus into the main content. | 2.4.1 |
| Focus visible | Tabs through the whole page. Each stop's paint (outline, shadow, border, colour, background, underline) on the element and its three nearest ancestors is compared focused against blurred. | 2.4.7 |
| Dialogs and sheets | Each must be named, take focus on open, trap Tab and Shift+Tab, close on Escape, and return focus to its trigger. | 2.1.2, 2.4.3 |
| Reflow | Each page is loaded at 320 CSS px wide and must not scroll horizontally. | 1.4.10 |
| Text spacing | Applies line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em and paragraph spacing 2em, again at 320 px. | 1.4.12 |
| Target size | On phones, every control must be at least 24 × 24 px. Inline links in running text are exempt. | 2.5.8 |
| Error messages | Submits an invalid email and checks for `aria-invalid`, `aria-describedby` and a message in a live region. | 3.3.1, 4.1.3 |
| Reduced motion | Emulates `prefers-reduced-motion: reduce`, then checks for running long or infinite animations, autoplaying films, atmosphere particles, and View Transition choreography. | 2.3.3, 2.2.2 |

## Results by page

"Focus stops" is the number of Tab stops reached; it is shown as phone / desktop.

| Route | axe (phone / desktop) | Pixel contrast | Focus stops | Skip link | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| `/` | 0 / 0 | pass | 35 / 33 | ✓ | still |
| `/menu` | 0 / 0 | pass | 40 / 29 | ✓ | still |
| `/story` | 0 / 0 | pass | 22 / 22 | ✓ | still |
| `/brewing-lab` | 0 / 0 | pass | 33 / 35 | ✓ | still |
| `/brewing-lab/studio` | 0 / 0 | pass | 44 / 45 | ✓ | still |
| `/cup` | 0 / 0 | pass (measured, see note 2) | 25 / 25 | ✓ | still |
| `/reservation` | 0 / 0 | pass | 25 / 39 | ✓ | still |
| `/locations` | 0 / 0 | pass | 24 / 29 | ✓ | still |
| `/shop` | 0 / 0 | pass | 32 / 33 | ✓ | still |
| `/concierge` | 0 / 0 | pass | 23 / 24 | ✓ | still |
| `/order` | 0 / 0 | pass | 36 / 37 | ✓ | still |
| `/offline` | 0 / 0 | pass | 23 / 24 | ✓ | still |

"Still" means that under reduced motion there are no running infinite or long animations and no playing films. The atmosphere particles stay off, and page changes happen without View Transition choreography.

### Interaction scenarios (20/20)

- **Phone menu sheet**
  - Opens from the keyboard, sets `aria-expanded`, and focus moves in.
  - 50 presses of Tab and Shift+Tab stay inside.
  - Escape closes it and focus returns to the toggle.
- **Modal dialogs** (order customisation on phone and desktop, the drink details sheet on the phone menu, the shop quick view):
  - Each is named and takes focus on open.
  - Focus stays trapped across 40 presses.
  - Escape closes it and focus returns to its trigger.
- **Reflow:** all 12 routes fit in 320 CSS px.
- **Text spacing:** all 12 routes still fit at 320 px with WCAG text spacing applied.
- **Newsletter:** an invalid email sets `aria-invalid`, and the error message is referenced by `aria-describedby` and announced.
- **Reduced motion:** the atmosphere is off, and navigation happens without animated transitions.

## Fixed in this pass

| Issue | Where | Fix |
| --- | --- | --- |
| Dialogs could lose their focus-return target. The effect depended on the inline `onClose`, so any re-render of the parent, or the lazy Lenis instance arriving, re-ran it. Each re-run recorded an element *inside* the dialog as the return target. | `ui/Dialog` | Keep the latest `onClose` in a ref, read Lenis at call time, and key the effect on `open` alone. |
| Flavour-note chips over bright photography dropped to 3.3:1. | `menu/MobileDrinkRail` (phone only) | Changed the chip glass from light to dark tint (`bg-espresso/45`). Now ≥ 4.5:1 over the worst pixel. |
| The pickup `<select>` sized itself to its longest option and pushed `/order` past 320 px. | `order/OrderAhead` | `max-w-full min-w-0` on the select, and `min-w-0` on its label. Its natural width is unchanged wherever it fits. |
| The Recipe Studio column and the timer grid used `auto` tracks, so their content set a minimum width wider than 320 px. | `studio/RecipeStudio`, `studio/StudioTimer` | Added a base `grid-cols-[minmax(0,1fr)]`. The large-screen templates are unchanged. |
| With user text spacing, the widest display word no longer fit a 320 px line. | global `h1–h3` | `overflow-wrap: break-word`. It only applies when a word cannot fit, so normal rendering is unchanged. |
| Hero steam wisps could extend past the viewport edge. | `hero/HeroAtmosphere` | `overflow-x-clip` on the wisp layer. Vertical drift is untouched. |
| The pickup select and the review textarea removed the focus outline. | `order/OrderAhead`, `merchandise/ProductReviews` | Dropped `focus:outline-none`. Keyboard focus now shows the standard caramel ring, and the border change on focus is kept. |
| Footer email and phone links were 15 px tall on phones. | `layout/SiteFooter` | Added an invisible `::after` hit area on phones, giving 43 px tall targets with nothing moving. |

The desktop pixel diff against the M8 baseline stays at or below 0.021% on every existing page, with identical page heights.

## Notes on the remaining automated flags

These are not defects, but the tools report them, so they are recorded here.

1. **The Studio range sliders show "no visible focus"** (5 per page). Their focus ring is drawn on the slider thumb (`.studio-range:focus-visible::-webkit-slider-thumb`, and the same for `::-moz-range-thumb`, in `globals.css`). A DOM style comparison cannot see the thumb pseudo-element, so the tool misses the ring. It has been verified visually.
2. **The `/cup` header text reads as low contrast in the pixel check.** The header renders two stacked tone copies that crossfade, so hiding one copy leaves the other in the sampled "backdrop". Measured directly from the rendered frame, nav text is **10.2:1** on desktop and the logo is **13.8:1** on phone.
3. **Inline links under 24 px on phones:**
   - `menu` and `shop` sit inside a sentence in the concierge's resting message. Inline links in text are exempt under 2.5.8.
   - The footer email and phone links report their text box. Their `::after` hit area, which the check does not measure, is 43 px tall.

## Design-language constraints kept

- Focus uses the site's caramel `--focus-ring`: a 2 px ring with a 3 px offset, shown for `:focus-visible` only. Mouse users see no change.
- Cards with a stretched link (drink, location and shop cards) show the ring on the whole card through `focus-within`, not on the inner text.
- Motion is reduced, not removed. Content still fades or crossfades in place, and nothing moves across the screen.

## Re-running

```bash
npm run build && npm start -- -p 3100
node scripts/a11y-audit.mjs --out docs/accessibility/audit.json
node scripts/a11y-interactions.mjs
```

Both scripts drive Chrome through `puppeteer-core`. Set `CHROME_PATH` if Chrome is not in its default Windows location, and `BASE` to audit another host.

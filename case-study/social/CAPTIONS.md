# Signature Edition — captions, alt text and posting notes

This expands the original launch package in [`/social`](../../social/README.md) (the
10-slide Figma-to-build carousel) with the Signature Edition: four languages,
offline, accessible. Hashtags follow [`social/captions/hashtags.md`](../../social/captions/hashtags.md).
Every figure below comes from `case-study/source/facts.json`.

---

## Instagram — carousel (8 × 1080 × 1350)

| # | File | Alt text |
| :-- | :-- | :-- |
| 01 | `instagram/carousel-01.png` | "NOIR CAFÉ — now in four languages, installable, and fully accessible" over an espresso machine. |
| 02 | `instagram/carousel-02.png` | "English, 日本語, Français, Italiano" beside a phone showing the menu in Japanese. |
| 03 | `instagram/carousel-03.png` | "The menu works without signal" beside a phone showing the offline menu. |
| 04 | `instagram/carousel-04.png` | "When it rains in New York, it rains on your phone" over a dark cup of coffee. |
| 05 | `instagram/carousel-05.png` | "Change the grind. Watch the cup change" above the Recipe Studio with its sliders. |
| 06 | `instagram/carousel-06.png` | "A table, a pass, a calendar invite" beside a phone showing the reservation pass. |
| 07 | `instagram/carousel-07.png` | "0 axe violations. In every language" — WCAG 2.2 AA, reduced motion, 320px reflow, CLS 0. |
| 08 | `instagram/carousel-08.png` | "Coffee is a ritual. Design should be too." over the café interior. |

**Caption**

```text
NOIR CAFÉ — Signature Edition ☕

The café learned three new languages.
日本語. Français. Italiano.
641 strings, translated side by side — and every price in USD, EUR, JPY or GBP.

It also learned to wait for you:
the menu and the cafés open with no signal,
and it installs from the second visit.

When it rains in New York, it rains on your phone.
When you book a table, you get a pass and a calendar invite.
And for everyone — keyboard, screen reader, reduced motion — 0 axe violations, in every language.

The desktop didn't move a pixel.

Coffee is a ritual.
Design should be too.

Full case study — link in bio.
```

## Instagram — stories (4 × 1080 × 1920)

1. `story-01-signature.png` — announcement. Link sticker over the "See the post" bar.
2. `story-02-languages.png` — こんにちは. Bonjour. Buongiorno. No sticker.
3. `story-03-offline.png` — "Add it to your home screen." Link sticker to the site.
4. `story-04-case-study.png` — the full case study. Link sticker over the glass bar to the Behance project.

Keep stickers clear of the top and bottom 250px.

---

## LinkedIn — document carousel (6 × 1080 × 1350)

Export the six slides as one PDF (`carousel-01` … `carousel-06`) and upload as a document.

```text
How do you build a cinematic café website that's fast, accessible and in four languages — without moving the desktop a single pixel?

Noir Café, the Signature Edition:

→ The constraint: every phase was screenshot-diffed against the 1440 Figma build on six devices. Existing pages never drifted more than 0.021%.
→ The approach: phones got their own product — a dock, sheets, a wallet-style reservation pass, an atmosphere that follows New York's clock and weather.
→ The architecture: static by default. 44 prerendered pages across 4 languages; dynamic only where it earns it.
→ The results: 0 axe violations in all four languages, 641 translated strings, 227 automated checks per phase, Lighthouse 98 on desktop.

The lesson I keep: measure every phase. A rain transition on the root element was restyling the whole page every frame on phones. Found by measuring; fixed in a line of CSS.

Full case study in the comments.

#webdevelopment #nextjs #accessibility #i18n #designsystems #frontend
```

---

## X — 3 × 1600 × 900

1. `twitter-01-announcement.png`
   ```text
   Noir Café, Signature Edition ☕
   A cinematic café site — now in English, 日本語, Français and Italiano, installable, and 0 axe violations in every language.
   ```
2. `twitter-02-responsive.png`
   ```text
   The rule: the desktop stays pixel-exact to Figma. Phones get their own product — dock, sheets, a wallet pass.
   ```
3. `twitter-03-motion.png`
   ```text
   Page transitions 2.0 — one grammar, five voices. View Transitions API with a CSS fallback; the destination picks the voice.
   ```

---

## Pinterest — 3 × 1000 × 1500

| File | Title | Description |
| :-- | :-- | :-- |
| `pin-01-poster.png` | Noir Café store poster | "Made slowly. Served simply." — a menu poster with café hours, from the Noir Café identity. |
| `pin-02-objects.png` | Noir Café objects | Takeaway cup, house ceramic and canvas tote carrying the Noir Café ring and wordmark. |
| `pin-03-phones.png` | Designed for the hand | The Noir Café home and story pages on iPhone. |

---

## Threads — 3 × 1080 × 1350

1. `threads-01-typography.png` — "Cormorant for the headline. Inter for the reading. Plex Mono for the price."
2. `threads-02-rain.png` — "It rained in New York during testing. The site noticed — and so did the performance budget. One CSS property later, 3 seconds of main-thread work were gone."
3. `threads-03-languages.png` — "ゆっくりと作り、シンプルに。 Made slowly. Served simply. Now in 日本語 · Français · Italiano."

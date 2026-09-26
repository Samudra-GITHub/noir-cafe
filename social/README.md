# Noir Café × Sams Studio — Instagram launch package

Everything is export-ready for **@samsstudio.design**.

```text
social/
├── carousel/      10 slides · 1080 × 1350 (4:5 feed)
├── stories/       3 stories · 1080 × 1920
├── reel-cover/    1 cover · 1080 × 1920 (title kept inside the 1080 × 1440 grid crop)
├── captions/      caption.md · hashtags.md
└── source/        render.mjs — the layout components that produce every frame
```

## Carousel order

| # | File | Slide | Alt text |
| :-- | :-- | :-- | :-- |
| 01 | `noir-cafe-01.png` | Cover | "NOIR CAFÉ — A cinematic coffee experience" over espresso pouring into a ceramic cup. |
| 02 | `noir-cafe-02.png` | The idea | Editorial page asking what a website at the pace of a pour-over would feel like, with coffee photography. |
| 03 | `noir-cafe-03.png` | Hero experience | The site's full-screen hero with motion annotations: sticky hero, glass nav, steam, parallax. |
| 04 | `noir-cafe-04.png` | Design system | Palette, typography, glass, buttons, spacing and icons. |
| 05 | `noir-cafe-05.png` | Motion | The single easing curve and five motion features on a timeline. |
| 06 | `noir-cafe-06.png` | Pages | A magazine grid of all seven pages. |
| 07 | `noir-cafe-07.png` | Craftsmanship | Roast indicators, flavor chips, film grain and a lifted button. |
| 08 | `noir-cafe-08.png` | Tech stack | Next.js, TypeScript, Tailwind, Framer Motion, Lenis and Vercel. |
| 09 | `noir-cafe-09.png` | Before / after | The Figma frame beside the live build. |
| 10 | `noir-cafe-10.png` | Closing | "Coffee is a ritual. Design should be too." — Sams Studio. |

## Stories

1. `noir-cafe-story-01-launch.png` — launch announcement. Add a link sticker over the glass bar pointing to the post.
2. `noir-cafe-story-02-behind-the-scenes.png` — Figma to build.
3. `noir-cafe-story-03-github.png` — add a link sticker over the glass bar to the repository.

Keep stickers clear of the top 250px and bottom 250px, which Instagram overlays with UI.

## Posting

1. Upload the ten slides in order as one carousel, at 4:5.
2. Paste the caption from `captions/caption.md`; add each slide's alt text under **Advanced settings → Accessibility**.
3. Post the hashtags from `captions/hashtags.md` as the first comment.
4. Share story 1 right after posting; stories 2 and 3 over the following day.

## Re-rendering

The frames are HTML compositions built from shared components (frame, folio, eyebrow, glass card, photo) on the Noir Café tokens. Edit `source/render.mjs`, then run:

```bash
npm i -D puppeteer-core
node social/source/render.mjs
```

Set `CHROME_PATH` if Chrome is not in its default Windows location.

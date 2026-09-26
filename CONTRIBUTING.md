# Contributing to Noir Café

Thank you for taking the time to contribute. This project is built slowly and on purpose — contributions are welcome when they keep that spirit.

## Principles

- **The Figma exports in `design/` are the source of truth.** Do not redesign layouts; propose design changes in an issue first.
- **Tokens before values.** Use the tokens in `src/styles/tokens.css` and the `@theme` in `src/app/globals.css` — no stray hex codes or pixel values.
- **Primitives before one-offs.** Reach for `src/components/ui` and `src/components/motion` before writing new styling.
- **One motion language.** Import variants and easing from `src/lib/motion.ts`. Every animation must respect `prefers-reduced-motion`.
- **Accessibility is not optional.** Keyboard reachable, visible focus, AA contrast, semantic HTML.

## Getting started

```bash
git clone https://github.com/Samudra-GITHub/noir-cafe.git
cd noir-cafe
npm install
npm run dev
```

## Before opening a pull request

```bash
npm run typecheck && npm run lint && npm run build
```

All three must pass. Include before and after screenshots for any visual change, at 1440px and 390px.

## Commits

Short, present-tense summaries (`Add roast meter to menu rows`). Keep pull requests focused on one change.

## Reporting bugs

Open an issue with steps to reproduce, the expected and actual result, your browser, and whether reduced motion is enabled.

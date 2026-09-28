/**
 * Shared layer for the Sams Studio case-study generator: paths, tokens read
 * from the live source (src/styles/tokens.css + the @theme block of
 * src/app/globals.css), fonts, base CSS and small HTML helpers.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "../..");
export const OUT = path.resolve(HERE, "..");
export const BUILD = path.join(HERE, "build");
export const SCREENS = path.join(OUT, "screens");

/** Path from a build HTML file to a repo file. */
export const rel = (p) => path.relative(BUILD, path.join(ROOT, p)).split(path.sep).join("/");
export const screen = (name) => rel(`case-study/screens/${name}.jpg`);

// ── Tokens, straight from the source ─────────────────────────────────────
const tokensCss = fs.readFileSync(path.join(ROOT, "src/styles/tokens.css"), "utf8");
const globalsCss = fs.readFileSync(path.join(ROOT, "src/app/globals.css"), "utf8");
const vars = (css) => Object.fromEntries([...css.matchAll(/--([\w-]+):\s*([^;]+);(?:\s*\/\*\s*([^*]*?)\s*\*\/)?/g)].map((m) => [m[1], { value: m[2].trim(), note: m[3]?.trim() ?? "" }]));
export const TOKENS = { ...vars(tokensCss.split("@media")[0]), ...vars(globalsCss.slice(0, globalsCss.indexOf("@layer base"))) };

export const COLORS = Object.entries(TOKENS)
  .filter(([k, v]) => k.startsWith("noir-") && v.value.startsWith("#"))
  .map(([k, v]) => ({ name: k.replace("noir-", ""), hex: v.value.toUpperCase(), note: v.note }));

export const TYPE_SCALE = Object.entries(TOKENS)
  .filter(([k]) => /^text-[\w-]+$/.test(k) && !k.includes("--"))
  .map(([k, v]) => ({ name: k.replace("text-", ""), size: v.value, px: Math.round(parseFloat(v.value) * 16), note: v.note, lh: TOKENS[`${k}--line-height`]?.value }))
  .filter((t) => t.value !== "" && /rem$/.test(t.size));

export const RADII = Object.entries(TOKENS).filter(([k]) => k.startsWith("radius-")).map(([k, v]) => ({ name: k.replace("radius-", ""), value: v.value }));
export const SHADOWS = Object.entries(TOKENS).filter(([k]) => k.startsWith("shadow-")).map(([k, v]) => ({ name: k.replace("shadow-", ""), value: v.value }));

/** Hex → relative luminance → contrast ratio. */
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// ── Fonts & base CSS ─────────────────────────────────────────────────────
const FONTS = rel("social/source/fonts");
export const CSS = `
@font-face { font-family: "Cormorant"; src: url("${FONTS}/CormorantGaramond-Variable.ttf"); font-weight: 300 700; }
@font-face { font-family: "Inter"; src: url("${FONTS}/Inter.ttf"); font-weight: 100 900; }
@font-face { font-family: "Plex"; src: url("${FONTS}/IBMPlexMono-Regular.ttf"); }
:root {
  --beige:#f8f4ec; --ivory:#fffcf7; --cream:#efe5d7; --espresso:#17120e; --walnut:#3c2415;
  --caramel:#a86a3c; --glow:#b67a4b; --ink:#905b33; --sand:#d8cec0; --stone:#6d645b; --taupe:#8f867e; --char:#35302b; --olive:#5c6e52;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --noise:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .24 0 0 0 0 .14 0 0 0 0 .08 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: var(--w); height: var(--h); overflow: hidden; }
body { font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; color: var(--espresso); }
.frame { position: relative; width: var(--w); height: var(--h); overflow: hidden; }
.paper { background: var(--beige); } .cream { background: var(--cream); } .ivory { background: var(--ivory); }
.dark { background: var(--espresso); color: var(--beige); }
.grain::after { content: ""; position: absolute; inset: 0; background: var(--noise); background-size: 240px; opacity: .06; pointer-events: none; z-index: 60; }
.dark.grain::after { opacity: .08; mix-blend-mode: overlay; filter: invert(1); }
.serif { font-family: Cormorant, Georgia, serif; font-weight: 400; }
.italic { font-style: italic; }
.mono { font-family: Plex, monospace; text-transform: uppercase; letter-spacing: .12em; }
.eyebrow { font-family: Plex, monospace; text-transform: uppercase; letter-spacing: .16em; font-size: 15px; color: var(--ink); }
.dark .eyebrow { color: var(--glow); }
.muted { color: var(--stone); } .dark .muted { color: var(--taupe); }
.photo { position: absolute; inset: 0; background-size: cover; background-position: center; }
.card { background: var(--ivory); border: 1px solid var(--sand); border-radius: 22px; box-shadow: 0 16px 48px rgba(60,36,21,.10); overflow: hidden; }
.shot { border-radius: 16px; overflow: hidden; box-shadow: 0 30px 70px rgba(23,18,14,.28); background: var(--espresso); }
.shot img { display: block; width: 100%; }
.glass { background: rgba(248,244,236,.10); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(30px); border-radius: 26px; }
.glass-cream { background: rgba(248,244,236,.78); border: 1px solid rgba(255,252,247,.6); backdrop-filter: blur(30px); border-radius: 26px; box-shadow: 0 16px 48px rgba(60,36,21,.12); }
.rule { height: 1px; background: currentColor; opacity: .18; }
.logo { display: inline-flex; align-items: center; gap: .45em; font-family: Cormorant, serif; letter-spacing: .02em; }
.logo i { width: 1em; height: 1em; border-radius: 50%; border: .055em solid currentColor; display: block; }
.chip { display: inline-flex; align-items: center; height: 36px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--sand); font-family: Plex, monospace; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--stone); }
.dark .chip { border-color: var(--char); color: var(--cream); }
.stat .n { font-family: Cormorant, serif; font-size: 64px; line-height: 1; }
.stat .l { font-family: Plex, monospace; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; margin-top: 10px; color: var(--stone); }
.dark .stat .l { color: var(--taupe); }
`;

export const page = (w, h, body, extra = "") =>
  `<!doctype html><html><head><meta charset="utf-8"><style>:root{--w:${w}px;--h:${h}px}${CSS}${extra}</style></head><body>${body}</body></html>`;

export const logo = (size = 28) => `<span class="logo" style="font-size:${size}px"><i></i>NOIR CAFÉ</span>`;
export const credit = (dark = false) =>
  `<span class="mono" style="font-size:12px;letter-spacing:.16em;color:${dark ? "var(--taupe)" : "var(--stone)"}">Sams Studio · @samsstudio.design</span>`;

/** Behance-style running header for a numbered chapter. */
export const folio = (n, total, title, dark) => `
  <div style="position:absolute;left:96px;right:96px;top:56px;display:flex;justify-content:space-between;align-items:center;z-index:40">
    ${logo(22)}
    <span class="mono" style="font-size:12px;letter-spacing:.18em;opacity:.7">${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")} · ${title}</span>
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:48px;display:flex;justify-content:space-between;align-items:center;z-index:40">
    ${credit(dark)}<span class="mono" style="font-size:12px;letter-spacing:.16em;opacity:.6">Noir Café — Case study 2026</span>
  </div>`;

export const img = (src, style = "") => `<img src="${src}" style="display:block;width:100%;${style}">`;

/** Read the measured project facts (collected by render.mjs --facts). */
export function facts() {
  const file = path.join(HERE, "facts.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
}

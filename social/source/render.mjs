/**
 * Noir Café × Sams Studio — Instagram launch package renderer.
 *
 * Every frame is an HTML composition built from shared layout components
 * (frame, eyebrow, folio, glass card, photo) using the Noir Café tokens,
 * then rendered to PNG with headless Chrome.
 *
 *   node social/source/render.mjs            (requires puppeteer-core + Chrome)
 *
 * Output: social/carousel/*.png (1080×1350), social/stories/*.png (1080×1920),
 * social/reel-cover/*.png (1080×1920). Source HTML is kept in social/source/build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const BUILD = path.join(HERE, "build");
fs.mkdirSync(BUILD, { recursive: true });

const rel = (p) => path.relative(BUILD, path.join(ROOT, p)).split(path.sep).join("/");
const IMG = {
  crema: rel("public/videos/hero-espresso-poster.webp"),
  latte: rel("public/videos/latte-art-poster.webp"),
  cup: rel("public/videos/perfect-cup-poster.webp"),
  ambience: rel("public/videos/ambience-cafe-poster.webp"),
  beans: rel("public/videos/coffee-beans-poster.webp"),
  pour: rel("public/videos/pour-over-poster.webp"),
  cortado: rel("public/images/home/drink-noir-cortado.jpg"),
  roaster: rel("public/images/home/story-roaster.jpg"),
  table: rel("public/images/story/hero-long-table.jpg"),
  hands: rel("public/images/story/green-beans-hands.jpg"),
  set: rel("public/images/shop/morning-composed.jpg"),
  figma: rel("design/homepage.png"),
  s: (name) => rel(`assets/readme/screens/${name}.jpg`),
};

/* ── Tokens & shared CSS ──────────────────────────────────────────────── */
const FONTS = rel("social/source/fonts");
const CSS = `
@font-face { font-family: "Cormorant"; src: url("${FONTS}/CormorantGaramond-Variable.ttf"); font-weight: 300 700; }
@font-face { font-family: "Inter"; src: url("${FONTS}/Inter.ttf"); font-weight: 100 900; }
@font-face { font-family: "Plex"; src: url("${FONTS}/IBMPlexMono-Regular.ttf"); }
:root {
  --beige:#f8f4ec; --ivory:#fffcf7; --cream:#efe5d7; --espresso:#17120e; --walnut:#3c2415;
  --caramel:#a86a3c; --glow:#b67a4b; --ink:#905b33; --sand:#d8cec0; --stone:#6d645b; --taupe:#8f867e; --char:#35302b;
  --noise:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .24 0 0 0 0 .14 0 0 0 0 .08 0 0 0 1.4 -.2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
* { box-sizing: border-box; margin: 0; }
html, body { width: var(--w); height: var(--h); overflow: hidden; }
body { font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; }
.frame { position: relative; width: var(--w); height: var(--h); overflow: hidden; }
.paper { background: var(--beige); color: var(--espresso); }
.cream { background: var(--cream); color: var(--espresso); }
.dark { background: var(--espresso); color: var(--beige); }
.grain::after { content: ""; position: absolute; inset: 0; background: var(--noise); background-size: 240px; opacity: .07; pointer-events: none; z-index: 50; }
.dark.grain::after { opacity: .09; mix-blend-mode: overlay; filter: invert(1); }
.serif { font-family: Cormorant, Georgia, serif; font-weight: 400; }
.mono { font-family: Plex, monospace; text-transform: uppercase; letter-spacing: .12em; }
.eyebrow { font-family: Plex, monospace; text-transform: uppercase; letter-spacing: .14em; font-size: 20px; color: var(--ink); }
.dark .eyebrow { color: var(--glow); }
.photo { position: absolute; inset: 0; background-size: cover; background-position: center; }
.chrome { position: absolute; left: 72px; right: 72px; display: flex; justify-content: space-between; align-items: center; z-index: 40; }
.chrome.top { top: 64px; } .chrome.bottom { bottom: 60px; }
.logo { display: flex; align-items: center; gap: 14px; font-family: Cormorant, serif; font-size: 30px; letter-spacing: .02em; }
.logo i { width: 30px; height: 30px; border-radius: 50%; border: 1.6px solid currentColor; display: block; }
.folio { font-family: Plex, monospace; font-size: 18px; letter-spacing: .14em; opacity: .75; }
.glass { background: rgba(248,244,236,.10); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border-radius: 28px; }
.glass-cream { background: rgba(248,244,236,.78); border: 1px solid rgba(255,252,247,.6); backdrop-filter: blur(30px); border-radius: 28px; box-shadow: 0 16px 48px rgba(60,36,21,.12); }
.card { background: var(--ivory); border: 1px solid var(--sand); border-radius: 22px; box-shadow: 0 16px 48px rgba(60,36,21,.10); overflow: hidden; }
.shot { border-radius: 18px; overflow: hidden; box-shadow: 0 24px 60px rgba(23,18,14,.28); background: var(--espresso); }
.shot img { display: block; width: 100%; }
.rule { height: 1px; background: currentColor; opacity: .2; }
.anno { position: absolute; font-family: Plex, monospace; font-size: 17px; letter-spacing: .1em; text-transform: uppercase; display: flex; align-items: center; gap: 12px; color: var(--beige); }
.anno b { width: 12px; height: 12px; border-radius: 50%; background: var(--caramel); box-shadow: 0 0 0 6px rgba(168,106,60,.25); display: block; flex: none; }
.btn { display: inline-flex; align-items: center; gap: 18px; height: 72px; padding: 0 34px; border-radius: 999px; font-weight: 600; font-size: 19px; letter-spacing: .02em; text-transform: uppercase; }
.btn svg, .glass > svg { width: 28px; height: 28px; flex: none; }
.chip { display: inline-flex; align-items: center; height: 44px; padding: 0 20px; border-radius: 999px; border: 1px solid var(--sand); font-family: Plex, monospace; font-size: 15px; letter-spacing: .08em; text-transform: uppercase; color: var(--stone); }
.chip.on { background: var(--espresso); color: var(--beige); border-color: var(--espresso); }
`;

const arrow = (c = "currentColor") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`;
const logo = () => `<div class="logo"><i></i>NOIR CAFÉ</div>`;
const chrome = (n, { handle = true } = {}) => `
  <div class="chrome top">${logo()}<div class="folio">${String(n).padStart(2, "0")} / 10</div></div>
  ${handle ? `<div class="chrome bottom"><div class="folio">@SAMSSTUDIO.DESIGN</div><div class="folio">${n < 10 ? "SWIPE →" : "SAVE ✦"}</div></div>` : ""}`;
const page = (w, h, body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>:root{--w:${w}px;--h:${h}px}${CSS}</style></head><body>${body}</body></html>`;

/* ── Carousel ─────────────────────────────────────────────────────────── */
const slides = [];

slides.push(`<div class="frame dark grain">
  <div class="photo" style="background-image:url(${IMG.crema});background-position:52% 50%;filter:saturate(1.05)"></div>
  <div class="photo" style="background:radial-gradient(90% 70% at 70% 30%, rgba(232,168,104,.22), transparent 60%), linear-gradient(180deg, rgba(23,18,14,.35) 0%, rgba(23,18,14,.1) 35%, rgba(23,18,14,.75) 72%, rgba(23,18,14,.96) 100%)"></div>
  ${chrome(1)}
  <div style="position:absolute;left:72px;right:72px;bottom:150px">
    <div class="eyebrow" style="color:var(--cream)">New project · UI/UX · 2026</div>
    <h1 class="serif" style="font-size:212px;line-height:.82;margin-top:34px;letter-spacing:-.01em">NOIR<br>CAFÉ</h1>
    <p class="serif" style="font-size:52px;font-style:italic;margin-top:34px;color:var(--cream)">A cinematic coffee experience.</p>
  </div>
</div>`);

slides.push(`<div class="frame paper grain">
  ${chrome(2)}
  <div style="position:absolute;left:72px;top:190px;width:936px">
    <div class="eyebrow">02 · The idea</div>
    <p class="serif" style="font-size:78px;line-height:1.02;margin-top:30px">What if a café’s website moved at the pace of a <em style="color:var(--ink)">pour-over</em>?</p>
    <p style="font-size:26px;line-height:1.55;color:var(--stone);margin-top:36px;max-width:780px">Noir Café is a seven-page specialty coffee experience — designed in Figma, engineered in Next.js — where every scroll, pause and pour is considered.</p>
  </div>
  <div style="position:absolute;left:72px;right:72px;bottom:140px;height:430px;display:grid;grid-template-columns:1.35fr 1fr;gap:20px">
    <div class="card" style="background:url(${IMG.cortado}) center/cover"></div>
    <div style="display:grid;grid-template-rows:1fr 1fr;gap:20px">
      <div class="card" style="background:url(${IMG.hands}) center/cover"></div>
      <div class="card" style="background:url(${IMG.roaster}) center/cover"></div>
    </div>
  </div>
</div>`);

slides.push(`<div class="frame dark grain">
  ${chrome(3)}
  <div style="position:absolute;left:72px;top:170px"><div class="eyebrow">03 · Hero experience</div>
    <p class="serif" style="font-size:66px;line-height:1;margin-top:22px">The first frame<br>is a film.</p></div>
  <div class="shot" style="position:absolute;left:72px;right:72px;top:420px;height:596px">
    <img src="${IMG.s("home-desktop")}" style="height:100%;object-fit:cover">
  </div>
  <div class="anno" style="left:108px;top:470px"><b></b>Sticky hero · 100svh</div>
  <div class="anno" style="right:108px;top:560px"><b></b>Warm glass nav</div>
  <div class="anno" style="right:120px;top:760px"><b></b>Steam · CSS only</div>
  <div class="anno" style="left:108px;top:930px"><b></b>Parallax −64px · masked reveal</div>
  <div style="position:absolute;left:72px;right:72px;bottom:150px;display:flex;gap:18px">
    <span class="chip" style="border-color:var(--char);color:var(--cream)">Film grain</span>
    <span class="chip" style="border-color:var(--char);color:var(--cream)">Vignette</span>
    <span class="chip" style="border-color:var(--char);color:var(--cream)">Stagger 0.1 → 1.1s</span>
  </div>
</div>`);

const sw = (c, n, hex, dark) => `<div style="border-radius:18px;background:${c};${dark ? "" : "border:1px solid var(--sand);"}height:176px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;color:${dark ? "var(--beige)" : "var(--espresso)"}"><span style="font-weight:600;font-size:20px">${n}</span><span class="mono" style="font-size:13px;opacity:.75">${hex}</span></div>`;
slides.push(`<div class="frame cream grain">
  ${chrome(4)}
  <div style="position:absolute;left:72px;right:72px;top:170px">
    <div class="eyebrow">04 · Design system</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px">
      ${sw("#f8f4ec", "Beige", "#F8F4EC")}${sw("#17120e", "Espresso", "#17120E", 1)}${sw("#3c2415", "Walnut", "#3C2415", 1)}${sw("#a86a3c", "Caramel", "#A86A3C", 1)}
    </div>
    <div class="card" style="margin-top:22px;padding:34px 36px;display:flex;justify-content:space-between;align-items:flex-end">
      <div class="serif" style="font-size:96px;line-height:.9">Aa</div>
      <div style="text-align:right">
        <div class="serif" style="font-size:32px">Cormorant Garamond</div>
        <div style="font-size:22px;color:var(--walnut);margin-top:6px">Inter — quiet body</div>
        <div class="mono" style="font-size:16px;color:var(--ink);margin-top:10px">Plex Mono · $6.50 · 93°C</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:22px">
      <div style="border-radius:22px;height:260px;background:linear-gradient(135deg,#3c2415,#a86a3c);position:relative;overflow:hidden;padding:30px">
        <div style="position:absolute;width:190px;height:190px;border-radius:50%;background:var(--cream);opacity:.35;right:24px;top:18px"></div>
        <div class="glass" style="position:relative;height:84px;display:flex;align-items:center;padding:0 28px;margin-top:40px;color:var(--beige)">${logo()}</div>
        <div class="mono" style="position:relative;color:var(--beige);font-size:13px;margin-top:26px">Glass · blur 30 · .08</div>
      </div>
      <div class="card" style="padding:30px;display:flex;flex-direction:column;gap:18px;justify-content:center">
        <div class="btn" style="background:var(--espresso);color:var(--beige);align-self:flex-start">Reserve table ${arrow()}</div>
        <div class="btn" style="border:1px solid var(--espresso);align-self:flex-start">View drinks ${arrow()}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:22px;margin-top:22px">
      <div class="card" style="padding:28px 30px">
        <div class="mono" style="font-size:13px;color:var(--stone)">Spacing · 4 / 16 / 24 / 40 / 64</div>
        <div style="display:flex;align-items:flex-end;gap:14px;margin-top:18px">${[4, 16, 24, 40, 64].map((v) => `<span style="display:block;width:${v * 2.4}px;height:14px;background:var(--caramel);border-radius:3px"></span>`).join("")}</div>
      </div>
      <div class="card" style="padding:24px 30px;display:flex;align-items:center;justify-content:space-between;color:var(--walnut)">
        ${["M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 11h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3", "M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2", "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4"].map((d) => `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"><path d="${d}"/></svg>`).join("")}
      </div>
    </div>
  </div>
</div>`);

const node = (x, t, s) => `<div style="position:absolute;left:${x}px;top:0;width:190px"><div style="width:18px;height:18px;border-radius:50%;background:var(--caramel);box-shadow:0 0 0 8px rgba(168,106,60,.18)"></div><div class="serif" style="font-size:36px;margin-top:34px">${t}</div><div class="mono" style="font-size:14px;color:var(--taupe);margin-top:12px;line-height:1.6">${s}</div></div>`;
slides.push(`<div class="frame dark grain">
  ${chrome(5)}
  <div style="position:absolute;left:72px;top:170px"><div class="eyebrow">05 · Motion</div>
    <p class="serif" style="font-size:66px;line-height:1;margin-top:22px">One curve.<br>Every movement.</p></div>
  <svg style="position:absolute;left:72px;top:430px" width="936" height="240" viewBox="0 0 936 240">
    <path d="M20 220 H916 M20 220 V20" stroke="#35302b" stroke-width="2"/>
    <path d="M20 220 C150 220 120 20 916 20" fill="none" stroke="#a86a3c" stroke-width="3"/>
    <circle cx="330" cy="46" r="10" fill="#f8f4ec"/>
    <text x="40" y="200" font-family="Plex" font-size="16" fill="#8f867e" letter-spacing="2">CUBIC-BEZIER(0.22, 1, 0.36, 1)</text>
  </svg>
  <div style="position:absolute;left:72px;right:72px;top:730px;height:2px;background:var(--char)"></div>
  <div style="position:absolute;left:72px;right:72px;top:722px">
    ${node(0, "Sticky hero", "PINNED FILM<br>PARALLAX −64")}${node(190, "Steam", "CSS WISPS<br>≤ 8% OPACITY")}${node(380, "Scroll story", "5 CHAPTERS<br>1 FILM PLAYS")}${node(570, "Cursor", "BEAN · RING<br>PROGRESS")}${node(760, "Glass nav", "FROST → CREAM<br>SLIDING RULE")}
  </div>
  <div class="mono" style="position:absolute;left:72px;bottom:150px;font-size:16px;color:var(--taupe)">Transform + opacity only · respects reduced motion</div>
</div>`);

const tile = (img, label, style = "") => `<div style="position:relative;${style}"><div class="shot" style="height:100%"><img src="${img}" style="height:100%;object-fit:cover;object-position:top"></div><div class="mono" style="position:absolute;left:16px;bottom:14px;font-size:13px;color:var(--beige);background:rgba(23,18,14,.55);backdrop-filter:blur(12px);padding:8px 12px;border-radius:999px">${label}</div></div>`;
slides.push(`<div class="frame paper grain">
  ${chrome(6)}
  <div style="position:absolute;left:72px;top:170px"><div class="eyebrow">06 · Seven pages</div></div>
  <div style="position:absolute;left:72px;right:72px;top:230px;bottom:130px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:1.25fr 1fr 1fr;gap:16px">
    ${tile(IMG.s("home-mobile"), "01 Home", "grid-row:span 2")}
    ${tile(IMG.s("menu-desktop"), "02 Menu", "grid-column:span 2")}
    ${tile(IMG.s("story-mobile"), "03 Story", "grid-row:span 2")}
    ${tile(IMG.s("brewing-lab-desktop"), "04 Brewing", "grid-column:span 2")}
    ${tile(IMG.s("reservation-desktop"), "05 Reserve", "grid-column:span 2")}
    ${tile(IMG.s("locations-desktop"), "06 Locations")}
    ${tile(IMG.s("shop-desktop"), "07 Shop")}
  </div>
</div>`);

const pips = (n) => `<span style="display:inline-flex;gap:10px">${[1, 2, 3].map((i) => `<i style="width:16px;height:16px;border-radius:50%;background:${i <= n ? "var(--caramel)" : "var(--sand)"};display:block"></i>`).join("")}</span>`;
slides.push(`<div class="frame paper grain">
  ${chrome(7)}
  <div style="position:absolute;left:72px;top:170px"><div class="eyebrow">07 · Craftsmanship</div>
    <p class="serif" style="font-size:66px;line-height:1;margin-top:22px">The details<br>no one asks for.</p></div>
  <div style="position:absolute;left:72px;right:72px;top:430px;display:grid;grid-template-columns:1fr 1fr;gap:22px">
    <div class="card" style="padding:34px;height:250px">
      <div class="mono" style="font-size:14px;color:var(--stone)">Roast indicator</div>
      <div style="display:flex;flex-direction:column;gap:20px;margin-top:26px">
        <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:22px">Light</span>${pips(1)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:22px">Medium</span>${pips(2)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:22px">Dark</span>${pips(3)}</div>
      </div>
    </div>
    <div class="card" style="padding:34px;height:250px">
      <div class="mono" style="font-size:14px;color:var(--stone)">Flavor chips</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:26px">
        <span class="chip on">All drinks</span><span class="chip">Cacao</span><span class="chip">Fig</span><span class="chip">White peach</span><span class="chip">Orange blossom</span>
      </div>
    </div>
    <div style="border-radius:22px;height:300px;position:relative;overflow:hidden;background:url(${IMG.beans}) center/cover">
      <div style="position:absolute;inset:0;background:var(--noise);background-size:120px;opacity:.35;mix-blend-mode:overlay"></div>
      <div class="glass" style="position:absolute;left:22px;bottom:22px;padding:14px 20px;color:var(--beige)"><span class="mono" style="font-size:14px">Film grain · 7%</span></div>
    </div>
    <div style="border-radius:22px;height:300px;background:var(--beige);border:1px solid var(--sand);position:relative;overflow:hidden">
      <div style="position:absolute;inset:0;background:var(--noise);background-size:160px;opacity:.28"></div>
      <div style="position:absolute;left:34px;top:34px" class="mono"><span style="font-size:14px;color:var(--stone)">Micro-interaction</span></div>
      <div class="btn" style="position:absolute;left:34px;bottom:44px;background:var(--caramel);color:var(--beige);transform:translateY(-4px);box-shadow:0 18px 34px -14px rgba(60,36,21,.6)">Lift 2px ${arrow()}</div>
      <div style="position:absolute;right:40px;bottom:58px;width:58px;height:58px;border-radius:50%;border:1.5px solid var(--caramel);display:grid;place-items:center">
        <svg width="16" height="20" viewBox="0 0 20 26"><ellipse cx="10" cy="13" rx="9" ry="12" fill="#a86a3c"/><path d="M10 2c-3 3.5-3 7.5 0 11s3 7.5 0 11" stroke="#3c2415" stroke-width="1.4" fill="none"/></svg>
      </div>
    </div>
  </div>
</div>`);

const tech = (name, sub, glyph) => `<div class="card" style="background:#1f1914;border-color:var(--char);box-shadow:none;padding:30px;height:210px;display:flex;flex-direction:column;justify-content:space-between;color:var(--beige)"><div>${glyph}</div><div><div class="serif" style="font-size:40px">${name}</div><div class="mono" style="font-size:13px;color:var(--taupe);margin-top:8px">${sub}</div></div></div>`;
slides.push(`<div class="frame dark grain">
  ${chrome(8)}
  <div style="position:absolute;left:72px;top:170px"><div class="eyebrow">08 · Built with</div>
    <p class="serif" style="font-size:66px;line-height:1;margin-top:22px">Engineered like<br>a slow bar.</p></div>
  <div style="position:absolute;left:72px;right:72px;top:440px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
    ${tech("Next.js 16", "App Router · static", `<svg width="54" height="54" viewBox="0 0 54 54"><circle cx="27" cy="27" r="26" fill="#f8f4ec"/><path d="M19 17v20M19 17l17 22M35 17v14" stroke="#17120e" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`)}
    ${tech("TypeScript", "Strict", `<svg width="54" height="54" viewBox="0 0 54 54"><rect width="54" height="54" rx="8" fill="#efe5d7"/><text x="12" y="41" font-family="Inter" font-weight="800" font-size="22" fill="#17120e">TS</text></svg>`)}
    ${tech("Tailwind v4", "@theme tokens", `<svg width="64" height="54" viewBox="0 0 64 54"><path d="M4 26c8-16 18-20 30-14s16 12 26 6M4 40c8-16 18-20 30-14s16 12 26 6" stroke="#a86a3c" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`)}
    ${tech("Framer Motion", "Shared variants", `<svg width="54" height="54" viewBox="0 0 54 54"><path d="M8 4h38L27 24zM8 24h19l19 22H8z" fill="#efe5d7"/></svg>`)}
    ${tech("Lenis", "Inertial scroll", `<svg width="64" height="54" viewBox="0 0 64 54"><path d="M6 44C18 6 46 6 58 44" stroke="#a86a3c" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`)}
    ${tech("Vercel", "Edge-ready", `<svg width="54" height="54" viewBox="0 0 54 54"><path d="M27 6l24 42H3z" fill="#f8f4ec"/></svg>`)}
  </div>
  <div class="mono" style="position:absolute;left:72px;bottom:150px;font-size:16px;color:var(--taupe)">Lighthouse · accessibility 100 · SEO 100 · CLS 0</div>
</div>`);

slides.push(`<div class="frame cream grain">
  ${chrome(9)}
  <div style="position:absolute;left:72px;top:170px"><div class="eyebrow">09 · Figma → Website</div>
    <p class="serif" style="font-size:66px;line-height:1;margin-top:22px">Design,<br>becoming real.</p></div>
  <div style="position:absolute;left:72px;right:72px;top:430px;display:grid;grid-template-columns:1fr 1fr;gap:22px;height:610px">
    <div><div class="mono" style="font-size:15px;color:var(--stone);margin-bottom:14px">Before · Figma frame</div>
      <div class="shot" style="height:570px;background:var(--beige)"><img src="${IMG.figma}" style="object-fit:cover;object-position:top;height:auto"></div></div>
    <div><div class="mono" style="font-size:15px;color:var(--ink);margin-bottom:14px">After · live build</div>
      <div class="shot" style="height:570px"><img src="${IMG.s("home-mobile")}" style="height:100%;object-fit:cover;object-position:top"></div></div>
  </div>
  <div style="position:absolute;left:72px;right:72px;bottom:140px;display:flex;justify-content:space-between" class="mono">
    <span style="font-size:15px;color:var(--stone)">Section heights matched · ±0px @1440</span><span style="font-size:15px;color:var(--ink)">Diffed in headless Chrome</span>
  </div>
</div>`);

slides.push(`<div class="frame dark grain">
  <div class="photo" style="background-image:url(${IMG.cup});opacity:.42"></div>
  <div class="photo" style="background:linear-gradient(180deg, rgba(23,18,14,.7), rgba(23,18,14,.55) 45%, rgba(23,18,14,.95))"></div>
  ${chrome(10, { handle: false })}
  <div style="position:absolute;left:72px;right:72px;top:300px">
    <div class="eyebrow">10 · A closing note</div>
    <p class="serif" style="font-size:104px;line-height:.98;margin-top:34px">“Coffee is a ritual.<br><em style="color:var(--glow)">Design should be too.</em>”</p>
  </div>
  <div style="position:absolute;left:72px;right:72px;bottom:120px">
    <div class="rule" style="color:var(--beige)"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:40px">
      <div><div class="serif" style="font-size:44px">Sams Studio</div><div class="mono" style="font-size:16px;color:var(--taupe);margin-top:8px">@samsstudio.design</div></div>
      <div class="btn" style="background:var(--beige);color:var(--espresso)">Explore on GitHub ${arrow()}</div>
    </div>
    <div class="mono" style="font-size:15px;color:var(--glow);margin-top:30px">Save it · share it · tell me your favorite section ↓</div>
  </div>
</div>`);

/* ── Stories & reel cover (1080×1920) ─────────────────────────────────── */
const stories = {
  "01-launch": `<div class="frame dark grain">
    <div class="photo" style="background-image:url(${IMG.crema});background-position:48% 50%"></div>
    <div class="photo" style="background:linear-gradient(180deg, rgba(23,18,14,.55), rgba(23,18,14,.05) 35%, rgba(23,18,14,.9) 78%)"></div>
    <div class="chrome top" style="top:150px">${logo()}<div class="folio">NEW · 2026</div></div>
    <div style="position:absolute;left:72px;right:72px;bottom:360px">
      <div class="eyebrow" style="color:var(--cream)">Just launched</div>
      <h1 class="serif" style="font-size:190px;line-height:.84;margin-top:30px">NOIR<br>CAFÉ</h1>
      <p class="serif" style="font-size:50px;font-style:italic;margin-top:30px;color:var(--cream)">A cinematic coffee experience.</p>
    </div>
    <div class="glass" style="position:absolute;left:72px;right:72px;bottom:190px;height:110px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;color:var(--beige)">
      <span class="mono" style="font-size:18px">New post · swipe the carousel</span>${arrow()}</div>
  </div>`,
  "02-behind-the-scenes": `<div class="frame paper grain">
    <div class="chrome top" style="top:150px">${logo()}<div class="folio">BEHIND THE SCENES</div></div>
    <div style="position:absolute;left:72px;right:72px;top:290px">
      <div class="eyebrow">From Figma to film</div>
      <p class="serif" style="font-size:92px;line-height:.98;margin-top:28px">Every section,<br>diffed pixel by pixel.</p>
    </div>
    <div class="shot" style="position:absolute;left:72px;width:560px;top:720px;height:760px;transform:rotate(-3deg)"><img src="${IMG.figma}" style="object-fit:cover;object-position:top"></div>
    <div class="shot" style="position:absolute;right:72px;width:470px;top:880px;height:820px;transform:rotate(3deg)"><img src="${IMG.s("menu-mobile")}" style="height:100%;object-fit:cover;object-position:top"></div>
    <div class="glass-cream" style="position:absolute;left:120px;top:1560px;padding:22px 30px"><span class="mono" style="font-size:18px;color:var(--ink)">Tokens · primitives · one motion curve</span></div>
  </div>`,
  "03-github": `<div class="frame dark grain">
    <div class="photo" style="background-image:url(${IMG.pour});background-position:50% 50%;opacity:.45;filter:blur(2px)"></div>
    <div class="photo" style="background:linear-gradient(180deg, rgba(23,18,14,.8), rgba(23,18,14,.6) 40%, rgba(23,18,14,.95))"></div>
    <div class="chrome top" style="top:150px">${logo()}<div class="folio">OPEN SOURCE</div></div>
    <div style="position:absolute;left:72px;right:72px;top:560px">
      <svg width="96" height="96" viewBox="0 0 24 24" fill="#f8f4ec"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17.3 4.8 18.3 5.1 18.3 5.1c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>
      <div class="eyebrow" style="margin-top:48px">Available on GitHub</div>
      <p class="serif" style="font-size:112px;line-height:.95;margin-top:26px">Read the<br>source.</p>
      <p style="font-size:30px;line-height:1.5;color:var(--cream);margin-top:34px">Next.js · TypeScript · Tailwind v4 ·<br>Framer Motion · Lenis</p>
    </div>
    <div class="glass" style="position:absolute;left:72px;right:72px;bottom:260px;height:120px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;color:var(--beige)">
      <span class="mono" style="font-size:19px">github.com/Samudra-GITHub/noir-cafe</span>${arrow()}</div>
  </div>`,
};

const reel = `<div class="frame dark grain">
  <div class="photo" style="background-image:url(${IMG.latte});background-position:50% 50%"></div>
  <div class="photo" style="background:radial-gradient(70% 45% at 50% 50%, rgba(23,18,14,.15), rgba(23,18,14,.85))"></div>
  <!-- Instagram crops reel covers to 1080×1440 in the grid: keep type in the centre band. -->
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
    <div class="logo" style="justify-content:center"><i></i></div>
    <h1 class="serif" style="font-size:176px;line-height:.9;margin-top:40px;letter-spacing:.02em">NOIR<br>CAFÉ</h1>
    <div class="mono" style="font-size:20px;color:var(--cream);margin-top:40px">A cinematic coffee experience</div>
  </div>
  <div class="mono" style="position:absolute;bottom:130px;width:100%;text-align:center;font-size:17px;color:var(--taupe)">@SAMSSTUDIO.DESIGN</div>
</div>`;

/* ── Render ───────────────────────────────────────────────────────────── */
const jobs = [
  ...slides.map((html, i) => ({ file: `carousel/noir-cafe-${String(i + 1).padStart(2, "0")}.png`, w: 1080, h: 1350, html })),
  ...Object.entries(stories).map(([k, html]) => ({ file: `stories/noir-cafe-story-${k}.png`, w: 1080, h: 1920, html })),
  { file: "reel-cover/noir-cafe-reel-cover.png", w: 1080, h: 1920, html: reel },
];

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--allow-file-access-from-files"],
});
const tab = await browser.newPage();
for (const job of jobs) {
  const src = path.join(BUILD, path.basename(job.file, ".png") + ".html");
  fs.writeFileSync(src, page(job.w, job.h, job.html));
  await tab.setViewport({ width: job.w, height: job.h, deviceScaleFactor: 1 });
  await tab.goto("file:///" + src.split(path.sep).join("/"), { waitUntil: "networkidle0" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: path.join(ROOT, "social", job.file) });
  console.log("rendered", job.file);
}
await browser.close();

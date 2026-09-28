/**
 * Design-system pages, generated from the live tokens (src/styles/tokens.css
 * and the @theme block of src/app/globals.css) and the site's own icons.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Lucide from "lucide-react";
import { COLORS, RADII, SHADOWS, TOKENS, TYPE_SCALE, contrast, credit, logo, page, rel } from "./common.mjs";

const W = 1600;
const H = 1100;
const ICONS = ["House", "Coffee", "MapPin", "CalendarCheck", "ShoppingBag", "Heart", "Bookmark", "Navigation", "Play", "Pause", "RotateCcw", "Plus", "Minus", "X", "ArrowUpRight", "ArrowUp", "ChevronLeft", "ChevronRight", "ChevronDown", "Square"];
const icon = (name, size = 34, stroke = 1.4) => renderToStaticMarkup(createElement(Lucide[name], { size, strokeWidth: stroke, color: "currentColor" }));

const header = (n, title, lead) => `
  <div style="position:absolute;left:96px;right:96px;top:64px;display:flex;justify-content:space-between;align-items:center">${logo(22)}<span class="mono" style="font-size:12px;opacity:.7">Design system · ${String(n).padStart(2, "0")} / 09</span></div>
  <div style="position:absolute;left:96px;top:150px;width:900px">
    <div class="serif" style="font-size:64px;line-height:1">${title}</div>
    <p class="muted" style="font-size:18px;line-height:1.6;margin-top:16px">${lead}</p>
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:48px;display:flex;justify-content:space-between">${credit()}<span class="mono" style="font-size:12px;opacity:.6">Generated from src/styles/tokens.css</span></div>`;

const familyFor = (name) => (/^(display|heading|logo)/.test(name) ? "Cormorant, serif" : /^(mono|eyebrow|micro)/.test(name) ? "Plex, monospace" : "Inter, sans-serif");

export const designSystem = [
  {
    file: "01-color-palette",
    w: W,
    h: 1200,
    html: page(W, 1200, `<div class="frame paper grain">${header(1, "Color", "Warm neutrals and one accent. Every text pairing is measured — contrast ratios below are computed from the token values against paper (#F8F4EC) and espresso (#17120E).")}
      <div style="position:absolute;left:96px;right:96px;top:330px;display:grid;grid-template-columns:repeat(5,1fr);gap:18px">
        ${COLORS.map((c) => {
          const dark = contrast(c.hex, "#17120E") < contrast(c.hex, "#F8F4EC");
          return `<div style="border-radius:18px;overflow:hidden;border:1px solid var(--sand);background:var(--ivory)">
            <div style="height:130px;background:${c.hex};display:flex;align-items:flex-end;padding:14px;color:${dark ? "#F8F4EC" : "#17120E"}"><span class="serif" style="font-size:28px;text-transform:capitalize">${c.name.replace(/-/g, " ")}</span></div>
            <div style="padding:12px 14px">
              <div class="mono" style="font-size:12px;color:var(--espresso)">${c.hex}</div>
              <div class="mono" style="font-size:10px;margin-top:6px;color:var(--stone)">on paper ${contrast(c.hex, "#F8F4EC").toFixed(1)} · on espresso ${contrast(c.hex, "#17120E").toFixed(1)}</div>
              <div style="font-size:11px;line-height:1.45;margin-top:6px;color:var(--stone);min-height:32px">${c.note}</div>
            </div></div>`;
        }).join("")}
      </div></div>`),
  },
  {
    file: "02-typography-scale",
    w: W,
    h: 1900,
    html: page(W, 1900, `<div class="frame paper grain">${header(2, "Typography", "Cormorant Garamond for display, Inter for reading, IBM Plex Mono for prices, times and labels. Sizes are the live @theme scale; Japanese falls through to Noto Serif / Sans JP.")}
      <div style="position:absolute;left:96px;right:96px;top:320px">
        ${TYPE_SCALE.map((t) => `<div style="display:grid;grid-template-columns:230px 1fr;align-items:baseline;border-top:1px solid var(--sand);padding:10px 0">
          <div><div class="mono" style="font-size:12px;color:var(--ink)">${t.name}</div><div class="mono" style="font-size:10px;color:var(--stone);margin-top:4px">${t.px}px · lh ${t.lh ?? "—"}</div></div>
          <div style="font-family:${familyFor(t.name)};font-size:${Math.min(t.px, 104)}px;line-height:${t.lh ?? 1.3};white-space:nowrap;overflow:hidden;${/mono|eyebrow|micro|button|nav/.test(t.name) ? "text-transform:uppercase;letter-spacing:.12em" : ""}">${/^display/.test(t.name) ? "Where every cup" : /^heading|logo/.test(t.name) ? "Made slowly. Served simply." : /^mono/.test(t.name) ? "$6.50 · 93°C · 03:30" : /eyebrow|micro/.test(t.name) ? "Menu · Autumn 2026" : "Sourced with patience, roasted with restraint, and poured as a small act of attention."}</div>
        </div>`).join("")}
      </div></div>`),
  },
  {
    file: "03-grid",
    w: W,
    h: H,
    html: page(W, H, `<div class="frame paper grain">${header(3, "Grid & breakpoints", "A 1296px container on a 1440 frame (72px gutters); 40px on tablets, 20px on phones. The nav collapses at 960; phones get the dock below 768.")}
      ${[
        { label: "Desktop · 1440", w: 1400, frame: 1440, gutter: 72, x: 96, y: 330, h: 170 },
        { label: "Tablet · 768–1279 · gutter 40", w: 760, frame: 768, gutter: 40, x: 96, y: 560, h: 250 },
        { label: "Phone · < 768 · gutter 20", w: 380, frame: 390, gutter: 20, x: 920, y: 560, h: 420 },
      ].map((f) => {
        const s = f.w / f.frame;
        const cols = f.frame >= 1280 ? 12 : f.frame >= 768 ? 8 : 4;
        const inner = f.w - f.gutter * s * 2;
        const gap = 24 * s;
        const colW = (inner - gap * (cols - 1)) / cols;
        return `<div style="position:absolute;left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px;border-radius:14px;background:var(--ivory);border:1px solid var(--sand);overflow:hidden">
          ${Array.from({ length: cols }, (_, i) => `<div style="position:absolute;top:0;bottom:0;left:${f.gutter * s + i * (colW + gap)}px;width:${colW}px;background:rgba(168,106,60,.10)"></div>`).join("")}
          <div style="position:absolute;top:0;bottom:0;left:0;width:${f.gutter * s}px;background:rgba(23,18,14,.05)"></div>
          <div style="position:absolute;top:0;bottom:0;right:0;width:${f.gutter * s}px;background:rgba(23,18,14,.05)"></div>
          <div class="mono" style="position:absolute;left:${f.gutter * s + 8}px;top:12px;font-size:11px;color:var(--ink)">${f.label}</div>
        </div>`;
      }).join("")}
      <div style="position:absolute;left:96px;top:880px;display:flex;gap:40px">
        ${[["md", "768"], ["nav", "960"], ["xl", "1280"], ["desk", "1440"]].map(([n, v]) => `<div class="stat"><div class="n">${v}</div><div class="l">breakpoint · ${n}</div></div>`).join("")}
      </div></div>`),
  },
  {
    file: "04-spacing",
    w: W,
    h: H,
    html: page(W, H, `<div class="frame paper grain">${header(4, "Spacing & rhythm", "A 4px base. Sections breathe on a vertical rhythm that grows with the viewport: 96 → 120 → 136. The nav floats 28px from the top at 72px tall.")}
      <div style="position:absolute;left:96px;top:340px;display:flex;flex-direction:column;gap:18px">
        ${[4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 72, 96, 120, 136].map((v) => `<div style="display:flex;align-items:center;gap:22px"><span class="mono" style="width:60px;font-size:12px;color:var(--stone)">${v}</span><span style="display:block;height:18px;width:${v * 6}px;max-width:900px;background:var(--caramel);border-radius:4px;opacity:${0.45 + Math.min(v, 136) / 260}"></span>${[20, 40, 72].includes(v) ? `<span class="mono" style="font-size:11px;color:var(--ink)">gutter · ${v === 20 ? "phone" : v === 40 ? "tablet" : "desktop"}</span>` : [96, 120, 136].includes(v) ? `<span class="mono" style="font-size:11px;color:var(--ink)">section rhythm</span>` : v === 72 ? "" : ""}</div>`).join("")}
      </div></div>`),
  },
  {
    file: "05-radius",
    w: W,
    h: H,
    html: page(W, H, `<div class="frame paper grain">${header(5, "Radius", "Soft, not round: six steps from hairline chips to sheets — plus the full pill for the nav, buttons and chips.")}
      <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(7,1fr);gap:24px">
        ${[...RADII, { name: "full", value: "9999px" }].map((r) => `<div><div style="height:180px;background:var(--ivory);border:1px solid var(--sand);border-radius:${r.value};box-shadow:0 16px 48px rgba(60,36,21,.08)"></div><div class="mono" style="font-size:12px;margin-top:14px;color:var(--ink)">${r.name}</div><div class="mono" style="font-size:11px;margin-top:4px;color:var(--stone)">${r.value}</div></div>`).join("")}
      </div></div>`),
  },
  {
    file: "06-shadows",
    w: W,
    h: H,
    html: page(W, H, `<div class="frame cream grain">${header(6, "Elevation & glass", "Warm walnut shadows, never grey — and glass that is always warm frost: 8% beige over film, 78% cream over paper, 30px blur.")}
      <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(3,1fr);gap:40px">
        ${SHADOWS.map((s) => `<div><div style="height:200px;border-radius:20px;background:var(--ivory);box-shadow:${s.value}"></div><div class="mono" style="font-size:12px;margin-top:22px;color:var(--ink)">shadow-${s.name}</div><div class="mono" style="font-size:10px;margin-top:6px;color:var(--stone)">${s.value}</div></div>`).join("")}
      </div>
      <div style="position:absolute;left:96px;right:96px;top:720px;height:280px;border-radius:24px;overflow:hidden;display:grid;grid-template-columns:1fr 1fr">
        <div style="position:relative;background:url(${rel("public/videos/hero-espresso-poster.webp")}) center/cover"><div class="glass" style="position:absolute;left:40px;right:40px;top:100px;height:80px;display:flex;align-items:center;padding:0 28px;color:var(--beige)">${logo(24)}<span class="mono" style="margin-left:auto;font-size:11px">glass · 8% · blur 30</span></div></div>
        <div style="position:relative;background:var(--beige)"><div class="glass-cream" style="position:absolute;left:40px;right:40px;top:100px;height:80px;display:flex;align-items:center;padding:0 28px">${logo(24)}<span class="mono" style="margin-left:auto;font-size:11px;color:var(--stone)">glass-cream · 78%</span></div></div>
      </div></div>`),
  },
  {
    file: "07-motion-tokens",
    w: W,
    h: H,
    html: page(W, H, `<div class="frame dark grain">${header(7, "Motion tokens", "One curve everywhere, four durations and a handful of springs. Transform and opacity only; every token has a reduced-motion answer.")}
      <svg style="position:absolute;left:96px;top:340px" width="620" height="460" viewBox="0 0 620 460">
        <path d="M20 400 H600 M20 400 V20" stroke="#35302b" stroke-width="2"/>
        <path d="M20 400 C${20 + 580 * 0.22} 400 ${20 + 580 * 0.36} 20 600 20" fill="none" stroke="#a86a3c" stroke-width="4"/>
        <circle cx="${20 + 580 * 0.22}" cy="400" r="7" fill="#f8f4ec"/><circle cx="${20 + 580 * 0.36}" cy="20" r="7" fill="#f8f4ec"/>
        <text x="40" y="440" font-family="Plex" font-size="14" fill="#8f867e" letter-spacing="2">${TOKENS["ease-noir"]?.value.toUpperCase()}</text>
      </svg>
      <div style="position:absolute;left:800px;top:340px;right:96px;display:grid;grid-template-columns:1fr 1fr;gap:34px 40px">
        ${[["fast", "0.25s", "hover, press, lift −8px"], ["base", "0.7s", "reveals — y 32 → 0"], ["slow", "1.1s", "hero entrance"], ["steam", "2.4s", "atmosphere, daylight"], ["stagger", "0.12s", "list children"], ["hero delays", ".10 .18 .28 .60 .85", "eyebrow → buttons"], ["carousel", "spring 120 / 20", "±56px · 3D turn 6°"], ["tilt", "spring 150 / 18", "mass .6 · ±3° at the edge"]]
          .map(([k, v, d]) => `<div class="stat"><div class="n" style="font-size:44px">${v}</div><div class="l">${k} · ${d}</div></div>`).join("")}
      </div></div>`),
  },
  {
    file: "08-icons",
    w: W,
    h: H,
    html: page(W, H, `<div class="frame paper grain">${header(8, "Icons", "Lucide, drawn at a light 1.4px stroke to sit with Cormorant's hairlines. These are the twenty the site actually imports.")}
      <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(10,1fr);gap:22px;color:var(--walnut)">
        ${ICONS.map((n) => `<div style="height:130px;border-radius:18px;background:var(--ivory);border:1px solid var(--sand);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">${icon(n)}<span class="mono" style="font-size:9px;color:var(--stone)">${n}</span></div>`).join("")}
      </div>
      <div style="position:absolute;left:96px;top:720px;display:flex;gap:26px;align-items:center;color:var(--espresso)">
        <span class="logo" style="font-size:46px"><i></i>NOIR CAFÉ</span>
        <span class="mono" style="font-size:12px;color:var(--stone)">The mark: a single ring — a cup seen from above</span>
      </div></div>`),
  },
  {
    file: "09-components",
    w: W,
    h: 1760,
    html: page(W, 1760, `<div class="frame cream grain">${header(9, "Components", "Captured from the running build — the pieces every page is assembled from.")}
      <div style="position:absolute;left:96px;right:96px;top:300px;display:grid;grid-template-columns:1.3fr 1fr;gap:28px">
        <div style="display:flex;flex-direction:column;gap:28px">
          <div class="card" style="padding:22px"><div class="mono" style="font-size:11px;color:var(--ink);margin-bottom:12px">Glass navigation</div><img src="${rel("case-study/screens/components/nav.png")}" style="width:100%;border-radius:12px"></div>
          <div class="card" style="padding:22px"><div class="mono" style="font-size:11px;color:var(--ink);margin-bottom:12px">Drink card</div><img src="${rel("case-study/screens/components/drink-card.png")}" style="width:62%;border-radius:12px"></div>
          <div class="card" style="padding:22px"><div class="mono" style="font-size:11px;color:var(--ink);margin-bottom:12px">Menu row · roast meter · price</div><img src="${rel("case-study/screens/components/menu-row.png")}" style="width:100%"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:28px">
          <div class="card" style="padding:22px;background:var(--espresso)"><div class="mono" style="font-size:11px;color:var(--glow);margin-bottom:12px">Reservation pass (phone)</div><img src="${rel("case-study/screens/components/pass.png")}" style="width:100%;border-radius:14px"></div>
          <div class="card" style="padding:22px"><div class="mono" style="font-size:11px;color:var(--ink);margin-bottom:12px">Phone dock</div><img src="${rel("case-study/screens/components/dock.png")}" style="width:100%"></div>
          <div class="card" style="padding:22px"><div class="mono" style="font-size:11px;color:var(--ink);margin-bottom:12px">Calendar</div><img src="${rel("case-study/screens/components/calendar.png")}" style="width:100%"></div>
        </div>
      </div></div>`),
  },
];

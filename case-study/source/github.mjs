/**
 * GitHub media — an animated SVG hero (fonts embedded, so GitHub renders it
 * as designed), architecture and folder diagrams, a tech-stack card read from
 * package.json, Lighthouse badges from measured scores, and preview images.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, credit, facts, logo, page, screen } from "./common.mjs";
import { ipad, iphone, macbook } from "./devices.mjs";

const b64 = (file) => fs.readFileSync(path.join(ROOT, file)).toString("base64");
const FONT_FACES = `
@font-face { font-family: "NoirCormorant"; src: url(data:font/woff2;base64,${b64("src/fonts/cormorant-garamond-latin-wght400-500.woff2")}) format("woff2"); font-weight: 400 500; }
@font-face { font-family: "NoirInter"; src: url(data:font/woff2;base64,${b64("src/fonts/inter-latin-wght400-600.woff2")}) format("woff2"); font-weight: 400 600; }`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Animated README hero: steam rises, the ring draws, the title settles. Honors reduced motion. */
export function readmeHero() {
  const W = 1600;
  const H = 640;
  const wisps = [
    [760, 180, 11, 0],
    [800, 150, 9, 2.4],
    [780, 220, 13, 4.8],
    [820, 130, 10, 6.6],
    [740, 170, 12, 8.2],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Noir Café — a cinematic specialty coffee experience">
<style>${FONT_FACES}
  .serif { font-family: NoirCormorant, "Cormorant Garamond", Georgia, serif; }
  .sans { font-family: NoirInter, Inter, system-ui, sans-serif; }
  .wisp { transform-box: fill-box; transform-origin: center; animation: rise var(--d) cubic-bezier(.22,1,.36,1) var(--delay) infinite; opacity: 0; }
  @keyframes rise { 0% { transform: translateY(0) scale(.55); opacity: 0 } 25% { opacity: 1 } 100% { transform: translateY(-300px) scale(1.7); opacity: 0 } }
  .ring { stroke-dasharray: 190; stroke-dashoffset: 190; animation: draw 2.2s cubic-bezier(.22,1,.36,1) .3s forwards; }
  @keyframes draw { to { stroke-dashoffset: 0 } }
  .in { opacity: 0; animation: up 1.1s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes up { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
  .rule { transform-origin: left; transform: scaleX(0); animation: grow 1.6s cubic-bezier(.22,1,.36,1) 1s forwards; }
  @keyframes grow { to { transform: scaleX(1) } }
  @media (prefers-reduced-motion: reduce) { .wisp { animation: none; opacity: 0 } .ring, .in, .rule { animation: none; opacity: 1; stroke-dashoffset: 0; transform: none } }
</style>
<defs>
  <radialGradient id="light" cx="62%" cy="30%" r="60%"><stop offset="0" stop-color="#a86a3c" stop-opacity=".35"/><stop offset="1" stop-color="#17120e" stop-opacity="0"/></radialGradient>
  <radialGradient id="wisp"><stop offset="0" stop-color="#f8f4ec" stop-opacity=".22"/><stop offset=".7" stop-color="#f8f4ec" stop-opacity="0"/></radialGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .24 0 0 0 0 .14 0 0 0 0 .08 0 0 0 .5 0"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="#17120e"/>
<rect width="${W}" height="${H}" fill="url(#light)"/>
${wisps.map(([x, s, d, delay]) => `<circle class="wisp" style="--d:${d}s;--delay:${delay}s" cx="${x + 360}" cy="560" r="${s / 2}" fill="url(#wisp)"/>`).join("")}
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".35"/>
<g transform="translate(110 250)">
  <circle class="ring" cx="30" cy="30" r="28" fill="none" stroke="#f8f4ec" stroke-width="2.4"/>
  <text class="serif in" x="86" y="48" font-size="54" letter-spacing="3" fill="#f8f4ec" style="animation-delay:.2s">NOIR CAFÉ</text>
</g>
<text class="sans in" x="110" y="200" font-size="15" letter-spacing="4" fill="#b67a4b" style="animation-delay:.1s">SPECIALTY COFFEE · NEW YORK · SIGNATURE EDITION</text>
<text class="serif in" x="110" y="400" font-size="76" fill="#f8f4ec" style="animation-delay:.35s">Where every cup tells a story.</text>
<rect class="rule" x="110" y="440" width="420" height="1.5" fill="#a86a3c"/>
<text class="sans in" x="110" y="494" font-size="20" fill="#efe5d7" style="animation-delay:.6s">A cinematic café in Next.js 16 · four languages · installable · WCAG 2.2 AA</text>
<text class="sans in" x="110" y="584" font-size="13" letter-spacing="3" fill="#8f867e" style="animation-delay:.85s">DESIGNED &amp; ENGINEERED BY SAMS STUDIO</text>
</svg>`;
}

function box(x, y, w, h, title, lines, accent = false) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${accent ? "#3c2415" : "#211a15"}" stroke="${accent ? "#a86a3c" : "#35302b"}"/>
  <text x="${x + 22}" y="${y + 38}" font-family="NoirCormorant, Georgia, serif" font-size="26" fill="#f8f4ec">${esc(title)}</text>
  ${lines.map((l, i) => `<text x="${x + 22}" y="${y + 70 + i * 24}" font-family="NoirInter, system-ui, sans-serif" font-size="14" fill="#cfc6ba">${esc(l)}</text>`).join("")}`;
}
const arrow = (x1, y1, x2, y2, label = "") => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#a86a3c" stroke-width="1.6" fill="none" marker-end="url(#ah)"/>${label ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" text-anchor="middle" font-family="NoirInter, sans-serif" font-size="12" fill="#8f867e">${esc(label)}</text>` : ""}`;

export function architecture() {
  const W = 1600;
  const H = 1000;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>${FONT_FACES}</style>
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#a86a3c"/></marker></defs>
<rect width="${W}" height="${H}" fill="#17120e"/>
<text x="70" y="80" font-family="NoirInter, sans-serif" font-size="15" letter-spacing="4" fill="#b67a4b">ARCHITECTURE</text>
<text x="70" y="136" font-family="NoirCormorant, Georgia, serif" font-size="52" fill="#f8f4ec">Static by default, dynamic where it earns it.</text>
${box(70, 200, 420, 230, "Browser", ["React 19 · client islands only", "Service worker — offline menu & cafés", "LazyMotion · Lenis on first scroll", "Three.js scenes when visible", "Currency & atmosphere per device"])}
${box(590, 200, 420, 230, "Proxy (edge)", ["Language: cookie → browser → English", "/ja /fr /it, English unprefixed", "Clerk session on ordering routes", "Rewrites to prerendered pages"], true)}
${box(1110, 200, 420, 230, "Prerendered pages", [`app/[lang] × ${facts().locales} locales = ${facts().pages} pages`, "generateStaticParams · root params", "Localized metadata · hreflang", "OG images per route"])}
${box(590, 520, 420, 250, "Route handlers (/api)", ["orders · orders/confirm · favorites", "reservations · availability", "reviews · concierge (streamed)", "currency · weather · push", "stripe/webhook"], true)}
${box(70, 520, 420, 250, "Integrations", ["Supabase — Postgres, RLS", "Stripe Checkout + webhook", "Clerk accounts (optional)", "Resend email · Web Push (VAPID)", "Anthropic — the concierge"])}
${box(1110, 520, 420, 250, "Open data", ["Open-Meteo — NYC weather (15 min cache)", "Frankfurter — ECB rates (6 h cache)", "No keys · no visitor data sent", "Fallbacks: clock light, USD prices"])}
${arrow(490, 315, 590, 315, "request")}
${arrow(1010, 315, 1110, 315, "rewrite")}
${arrow(280, 430, 700, 520, "fetch")}
${arrow(590, 645, 490, 645, "server keys")}
${arrow(1010, 645, 1110, 645, "cached")}
${box(70, 830, 1460, 110, "Every integration is optional", ["Without keys each feature runs in a labelled demo mode — nothing is faked, nothing breaks. See docs/backend.md and .env.example."])}
</svg>`;
}

export function folderTree() {
  const W = 1600;
  const tree = [
    ["src/", "", 0],
    ["app/[lang]/", "every page × 4 locales · layout, metadata, OG images", 1],
    ["app/api/", "orders, reservations, reviews, concierge, currency, weather, push, stripe", 1],
    ["components/", "hero · menu · story · brewing · studio · cup · reservation · locations · shop · order · ui", 1],
    ["i18n/", "config · dictionaries · messages/tables · client & server · proxy helpers", 1],
    ["lib/", "motion · atmosphere · sound · haptics · weather · brew-model · transitions", 1],
    ["server/", "supabase · stripe · orders · reservations · push · concierge (server-only)", 1],
    ["data/", "menu · story · brewing · shop · locations — the content, typed", 1],
    ["styles/tokens.css", "design tokens — the single source of the palette and type", 1],
    ["proxy.ts", "language routing + Clerk", 1],
    ["public/", "sw.js · manifest assets · splash · films & photography", 0],
    ["supabase/migrations/", "ordering · reservations · reviews · push", 0],
    ["scripts/", "bundle report · a11y audit · i18n codemod & checks · rtl · splash", 0],
    ["docs/", "backend · accessibility · i18n · performance", 0],
    ["case-study/", "this package — Behance, mockups, motion, design system, social", 0],
  ];
  const H = 160 + tree.length * 52 + 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>${FONT_FACES}</style>
<rect width="${W}" height="${H}" fill="#f8f4ec"/>
<text x="70" y="80" font-family="NoirInter, sans-serif" font-size="15" letter-spacing="4" fill="#905b33">FOLDER STRUCTURE</text>
<text x="70" y="130" font-family="NoirCormorant, Georgia, serif" font-size="48" fill="#17120e">Where everything lives.</text>
${tree
  .map(([name, note, depth], i) => {
    const y = 200 + i * 52;
    const x = 90 + depth * 44;
    return `${depth ? `<path d="M${x - 26} ${y - 30} V${y - 6} H${x - 8}" stroke="#d8cec0" fill="none" stroke-width="1.5"/>` : ""}
    <text x="${x}" y="${y}" font-family="ui-monospace, 'IBM Plex Mono', monospace" font-size="20" fill="#17120e">${esc(name)}</text>
    <text x="${x + 330}" y="${y}" font-family="NoirInter, sans-serif" font-size="16" fill="#6d645b">${esc(note)}</text>`;
  })
  .join("")}
</svg>`;
}

export function techStack() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const v = (name) => (pkg.dependencies?.[name] ?? pkg.devDependencies?.[name] ?? "").replace(/^[\^~]/, "");
  const items = [
    ["Next.js", v("next"), "App Router · proxy · root params"],
    ["React", v("react"), "Server Components · ViewTransition"],
    ["TypeScript", v("typescript"), "strict"],
    ["Tailwind CSS", "4", "@theme tokens · logical utilities"],
    ["Framer Motion", v("framer-motion"), "LazyMotion, loaded after paint"],
    ["Three.js · R3F", `${v("three")} · ${v("@react-three/fiber")}`, "procedural cup & beans"],
    ["Lenis", v("lenis"), "on first scroll, desktop only"],
    ["Supabase", v("@supabase/supabase-js"), "Postgres · RLS"],
    ["Stripe", v("stripe"), "Checkout · webhook"],
    ["Clerk", v("@clerk/nextjs"), "optional accounts"],
    ["Anthropic SDK", v("@anthropic-ai/sdk"), "streamed concierge"],
    ["Web Push", v("web-push"), "VAPID"],
  ];
  const W = 1600;
  const H = 180 + Math.ceil(items.length / 3) * 150 + 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<style>${FONT_FACES}</style>
<rect width="${W}" height="${H}" fill="#17120e"/>
<text x="70" y="80" font-family="NoirInter, sans-serif" font-size="15" letter-spacing="4" fill="#b67a4b">TECH STACK</text>
<text x="70" y="130" font-family="NoirCormorant, Georgia, serif" font-size="48" fill="#f8f4ec">Chosen for craft, kept light.</text>
${items
  .map(([n, ver, note], i) => {
    const x = 70 + (i % 3) * 490;
    const y = 180 + Math.floor(i / 3) * 150;
    return `<rect x="${x}" y="${y}" width="460" height="124" rx="18" fill="#211a15" stroke="#35302b"/>
    <text x="${x + 24}" y="${y + 48}" font-family="NoirCormorant, Georgia, serif" font-size="30" fill="#f8f4ec">${esc(n)}</text>
    <text x="${x + 436}" y="${y + 46}" text-anchor="end" font-family="ui-monospace, monospace" font-size="15" fill="#b67a4b">${esc(ver)}</text>
    <text x="${x + 24}" y="${y + 88}" font-family="NoirInter, sans-serif" font-size="15" fill="#8f867e">${esc(note)}</text>`;
  })
  .join("")}
</svg>`;
}

/** Shields-style badge. */
export function badge(label, value, color) {
  const lw = 8 + label.length * 7;
  const vw = 12 + String(value).length * 8;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lw + vw}" height="22" role="img" aria-label="${esc(label)}: ${esc(value)}">
<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-opacity=".08"/></linearGradient>
<clipPath id="r"><rect width="${lw + vw}" height="22" rx="4"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="22" fill="#17120e"/><rect x="${lw}" width="${vw}" height="22" fill="${color}"/><rect width="${lw + vw}" height="22" fill="url(#s)"/></g>
<g fill="#f8f4ec" font-family="Verdana, DejaVu Sans, sans-serif" font-size="11"><text x="${lw / 2}" y="15" text-anchor="middle">${esc(label)}</text><text x="${lw + vw / 2}" y="15" text-anchor="middle">${esc(value)}</text></g>
</svg>`;
}

export function badges() {
  const f = facts();
  const color = (n) => (n >= 90 ? "#4c7a44" : n >= 50 ? "#a86a3c" : "#9b3b2e");
  const lh = f.lighthouse ?? {};
  const list = [
    ["lighthouse-desktop", "lighthouse desktop", lh.desktopPerformance],
    ["lighthouse-mobile", "lighthouse mobile", lh.mobilePerformance],
    ["accessibility", "accessibility", lh.accessibility],
    ["best-practices", "best practices", lh.bestPractices],
    ["seo", "seo", lh.seo],
  ].filter(([, , v]) => typeof v === "number");
  return [
    ...list.map(([file, label, v]) => ({ file, svg: badge(label, v, color(v)) })),
    { file: "wcag", svg: badge("WCAG", "2.2 AA", "#4c7a44") },
    { file: "languages", svg: badge("languages", "en · ja · fr · it", "#a86a3c") },
    { file: "pwa", svg: badge("PWA", "installable · offline", "#a86a3c") },
  ];
}

export const previews = [
  {
    file: "responsive-preview",
    w: 2400,
    h: 1350,
    html: page(2400, 1350, `
<div class="frame dark grain" style="background:linear-gradient(160deg,#241a14,#17120e 60%)">
  <div class="photo" style="background:radial-gradient(60% 50% at 40% 20%, rgba(232,168,104,.18), transparent 70%)"></div>
  <div style="position:absolute;left:170px;top:170px">${macbook(screen("desktop-home"), 1500)}</div>
  <div style="position:absolute;left:1560px;top:290px">${ipad(screen("tablet-menu"), 520)}</div>
  <div style="position:absolute;left:1990px;top:520px">${iphone(screen("phone-home"), 300)}</div>
  <div style="position:absolute;left:170px;bottom:70px;display:flex;align-items:center;gap:30px">${logo(34)}<span class="mono" style="font-size:15px;color:var(--taupe)">1440 · 820 · 393 — one design, three rooms</span></div>
  <div style="position:absolute;right:170px;bottom:78px">${credit(true)}</div>
</div>`),
  },
  {
    file: "mobile-preview",
    w: 2400,
    h: 1350,
    html: page(2400, 1350, `
<div class="frame cream grain">
  ${["phone-home", "phone-menu", "phone-reservation", "phone-locations", "phone-ja-menu"].map((s, i) => `<div style="position:absolute;left:${120 + i * 440}px;top:${i % 2 ? 190 : 120}px">${iphone(screen(s), 380)}</div>`).join("")}
  <div style="position:absolute;left:120px;bottom:60px;display:flex;align-items:center;gap:30px">${logo(30)}<span class="mono" style="font-size:14px;color:var(--stone)">Home · Menu · Reservation pass · New York live · 日本語</span></div>
  <div style="position:absolute;right:120px;bottom:66px">${credit()}</div>
</div>`),
  },
];

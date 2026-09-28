/**
 * Behance presentation — thirteen 1400px panels. Copy states what was built
 * and what was measured; the "research" chapter shows the real inputs (the
 * Figma exports, the brief's rules, the device matrix), not invented studies.
 */
import { COLORS, contrast, credit, facts, folio, logo, page, rel, screen } from "./common.mjs";
import { iphone, macbook } from "./devices.mjs";

const W = 1400;
const N = 13;
const P = (p) => rel(`case-study/${p}`);
const IMG = {
  crema: rel("public/videos/hero-espresso-poster.webp"),
  latte: rel("public/videos/latte-art-poster.webp"),
  cup: rel("public/videos/perfect-cup-poster.webp"),
  beans: rel("public/videos/coffee-beans-poster.webp"),
  pour: rel("public/videos/pour-over-poster.webp"),
  ambience: rel("public/videos/ambience-cafe-poster.webp"),
  table: rel("public/images/story/hero-long-table.jpg"),
  hands: rel("public/images/story/green-beans-hands.jpg"),
  roaster: rel("public/images/home/story-roaster.jpg"),
  cortado: rel("public/images/home/drink-noir-cortado.jpg"),
  set: rel("public/images/shop/morning-composed.jpg"),
  figma: (n) => rel(`design/${n}.png`),
};

const f = facts();
const stat = (n, l) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;

export const behance = [
  {
    file: "01-cover",
    w: W,
    h: 1000,
    html: page(W, 1000, `
<div class="frame dark grain">
  <div class="photo" style="background-image:url(${IMG.crema});background-position:55% 45%"></div>
  <div class="photo" style="background:linear-gradient(180deg,rgba(23,18,14,.45) 0%,rgba(23,18,14,.1) 35%,rgba(23,18,14,.85) 78%,#17120e 100%)"></div>
  <div style="position:absolute;left:96px;top:64px;right:96px;display:flex;justify-content:space-between;align-items:center">${logo(24)}<span class="mono" style="font-size:12px;opacity:.75">Case study · 2026</span></div>
  <div style="position:absolute;left:96px;right:96px;bottom:110px">
    <div class="eyebrow" style="color:var(--cream)">Brand, product & front-end · Sams Studio</div>
    <h1 class="serif" style="font-size:190px;line-height:.82;margin-top:26px;letter-spacing:-.01em">NOIR<br>CAFÉ</h1>
    <p class="serif italic" style="font-size:40px;margin-top:26px;color:var(--cream)">A cinematic specialty-coffee experience — in four languages, on every screen.</p>
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:48px;display:flex;justify-content:space-between">${credit(true)}<span class="mono" style="font-size:12px;opacity:.6">Next.js 16 · React 19 · WCAG 2.2 AA</span></div>
</div>`),
  },
  {
    file: "02-hero",
    w: W,
    h: 1000,
    html: page(W, 1000, `
<div class="frame dark grain" style="background:linear-gradient(170deg,#241a14,#17120e 60%)">
  ${folio(2, N, "Hero", true)}
  <div style="position:absolute;left:96px;top:150px;width:560px">
    <div class="eyebrow">The first frame is a film</div>
    <p class="serif" style="font-size:54px;line-height:1.02;margin-top:18px">Where every cup tells a story.</p>
    <p class="muted" style="font-size:18px;line-height:1.6;margin-top:18px">An espresso pours behind the headline; steam rises in CSS; the words rise out of a mask so the headline paints at once and still arrives with intent.</p>
  </div>
  <div style="position:absolute;left:340px;top:400px">${macbook(screen("desktop-home"), 960)}</div>
</div>`),
  },
  {
    file: "03-introduction",
    w: W,
    h: 1100,
    html: page(W, 1100, `
<div class="frame paper grain">
  ${folio(3, N, "Introduction")}
  <div style="position:absolute;left:96px;top:160px;width:720px">
    <div class="eyebrow">Overview</div>
    <p class="serif" style="font-size:52px;line-height:1.04;margin-top:18px">A café that moves at the pace of a pour-over — and still answers in under a second.</p>
    <p class="muted" style="font-size:18px;line-height:1.7;margin-top:22px">Noir Café is a specialty-coffee brand with three rooms in New York. The site began as seven Figma frames at 1440px and grew, phase by phase, into a mobile-first product: order ahead, real reservations with a wallet-style pass, a 3D journey, a recipe studio, an AI barista, an installable offline app — in English, Japanese, French and Italian.</p>
  </div>
  <div style="position:absolute;right:96px;top:170px;width:390px;display:grid;gap:26px">
    ${[["Role", "Brand system, product design, front-end engineering"], ["Scope", `Design system, ${f.routes} routes × ${f.locales} languages, backend-ready APIs, i18n, PWA, accessibility`], ["Stack", "Next.js 16, React 19, Tailwind 4, Framer Motion, Three.js"], ["Studio", "Sams Studio · @samsstudio.design"]].map(([k, v]) => `<div><div class="mono" style="font-size:12px;color:var(--ink)">${k}</div><div style="font-size:17px;line-height:1.5;margin-top:6px">${v}</div></div>`).join("")}
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:110px;display:grid;grid-template-columns:repeat(5,1fr);gap:24px;border-top:1px solid var(--sand);padding-top:34px">
    ${stat(f.routes ?? "—", "routes")}${stat(f.locales ?? 4, "languages")}${stat(f.pages ?? "—", "prerendered pages")}${stat(f.strings ?? "—", "translated strings")}${stat(f.commits ?? "—", "commits")}
  </div>
</div>`),
  },
  {
    file: "04-problem",
    w: W,
    h: 1000,
    html: page(W, 1000, `
<div class="frame dark grain">
  ${folio(4, N, "The problem", true)}
  <div style="position:absolute;left:96px;top:160px;width:820px">
    <div class="eyebrow">The brief</div>
    <p class="serif" style="font-size:56px;line-height:1.04;margin-top:18px">A café sells slowness. Its website usually can't afford it.</p>
    <p class="muted" style="font-size:18px;line-height:1.7;margin-top:22px">Cinematic sites tend to be heavy on phones, English-only and read-only. The brief asked for the opposite: keep the Figma desktop exactly as designed, give phones their own experience, and make every moment usable by everyone — without layout shift.</p>
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:120px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px">
    ${[["Desktop, unchanged", "Every phase is diffed against the 1440 baseline; existing pages stay within 0.021% of their pixels."], ["Phones, their own", "Below 768px: a dock, sheets, a wallet pass, a scroll-driven story and an atmosphere that follows New York."], ["Everyone, always", "Reduced motion everywhere, WCAG 2.2 AA, CLS 0 — checked on six devices after every phase."]]
      .map(([h, t]) => `<div style="border:1px solid var(--char);border-radius:20px;padding:26px"><div class="serif" style="font-size:30px">${h}</div><p class="muted" style="font-size:15px;line-height:1.6;margin-top:12px">${t}</p></div>`).join("")}
  </div>
</div>`),
  },
  {
    file: "05-research",
    w: W,
    h: 1200,
    html: page(W, 1200, `
<div class="frame cream grain">
  ${folio(5, N, "Research")}
  <div style="position:absolute;left:96px;top:160px;width:760px">
    <div class="eyebrow">Inputs, not assumptions</div>
    <p class="serif" style="font-size:48px;line-height:1.05;margin-top:16px">Figma as the source of truth; six real devices as the judge.</p>
  </div>
  <div style="position:absolute;left:96px;right:96px;top:380px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
    ${["homepage", "menu", "story", "brewing-lab", "reservation", "locations", "merchandise", "design-system"].map((n) => `<div class="card" style="height:190px;background:url(${IMG.figma(n)}) top/cover"></div>`).join("")}
  </div>
  <div class="mono" style="position:absolute;left:96px;top:800px;font-size:12px;color:var(--stone)">The eight Figma exports the build was measured against (design/)</div>
  <div style="position:absolute;left:96px;right:96px;bottom:110px;display:grid;grid-template-columns:repeat(6,1fr);gap:14px">
    ${["iPhone 13 · 390", "iPhone 15 Pro · 393", "Pixel 9 · 412", "Galaxy S24 · 360", "iPad Air · 820", "MacBook Pro · 1440"].map((d) => `<div style="background:var(--ivory);border:1px solid var(--sand);border-radius:16px;padding:18px 16px"><div class="mono" style="font-size:11px;color:var(--ink)">Device</div><div style="font-size:16px;font-weight:600;margin-top:8px">${d}</div></div>`).join("")}
  </div>
</div>`),
  },
  {
    file: "06-moodboard",
    w: W,
    h: 1360,
    html: page(W, 1360, `
<div class="frame paper grain">
  ${folio(6, N, "Moodboard")}
  <div style="position:absolute;left:96px;top:150px"><div class="eyebrow">Warmth, grain, restraint</div><p class="serif" style="font-size:48px;margin-top:14px">Espresso light, walnut shadows, paper.</p></div>
  <div style="position:absolute;left:96px;right:96px;top:300px;bottom:110px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:1fr 1fr 1fr;gap:16px">
    <div class="card" style="grid-row:span 2;background:url(${IMG.crema}) center/cover"></div>
    <div class="card" style="background:url(${IMG.latte}) center/cover"></div>
    <div class="card" style="background:url(${IMG.hands}) center/cover"></div>
    <div class="card" style="grid-row:span 2;background:url(${IMG.table}) center/cover"></div>
    <div class="card" style="background:url(${IMG.roaster}) center/cover"></div>
    <div class="card" style="background:url(${IMG.beans}) center/cover"></div>
    <div class="card" style="background:var(--espresso);display:flex;align-items:center;justify-content:center;color:var(--beige)"><span class="serif" style="font-size:88px">Aa</span></div>
    <div class="card" style="background:url(${IMG.pour}) center/cover"></div>
    <div class="card" style="display:grid;grid-template-columns:repeat(3,1fr)">${["#17120e", "#3c2415", "#a86a3c", "#efe5d7", "#f8f4ec", "#d8cec0"].map((c) => `<div style="background:${c}"></div>`).join("")}</div>
    <div class="card" style="background:url(${IMG.cortado}) center/cover"></div>
  </div>
</div>`),
  },
  {
    file: "07-typography",
    w: W,
    h: 1200,
    html: page(W, 1200, `
<div class="frame paper grain">
  ${folio(7, N, "Typography")}
  <div style="position:absolute;left:96px;right:96px;top:160px">
    <div class="eyebrow">Three voices</div>
    <div style="display:grid;grid-template-columns:1.25fr 1fr;gap:60px;margin-top:30px;align-items:end">
      <div><div class="serif" style="font-size:190px;line-height:.85">Aa</div><div class="serif" style="font-size:40px;margin-top:10px">Cormorant Garamond</div><p class="muted" style="font-size:16px;line-height:1.6;margin-top:8px">Display — headlines, drink names, the wordmark. Weights 400–500, self-hosted and trimmed.</p></div>
      <div style="display:grid;gap:30px">
        <div><div style="font-size:44px;font-weight:500">Inter</div><p class="muted" style="font-size:15px;line-height:1.6;margin-top:6px">Reading — 400 to 600, one variable file.</p></div>
        <div><div class="mono" style="font-size:30px;letter-spacing:.08em">$6.50 · 93°C · 03:30</div><p class="muted" style="font-size:15px;line-height:1.6;margin-top:6px">IBM Plex Mono — prices, times, labels.</p></div>
      </div>
    </div>
    <div style="margin-top:60px;border-top:1px solid var(--sand)">
      ${[["104", "Where every cup tells a story.", "display-2xl"], ["60", "Made slowly. Served simply.", "display-lg"], ["28", "Your table, held quietly.", "heading-sm"], ["16", "Sourced with patience, roasted with restraint, and poured as a small act of attention.", "body"]]
        .map(([px, t, n]) => `<div style="display:grid;grid-template-columns:160px 1fr;align-items:baseline;padding:14px 0;border-bottom:1px solid var(--sand)"><div class="mono" style="font-size:12px;color:var(--ink)">${n} · ${px}px</div><div class="${Number(px) >= 28 ? "serif" : ""}" style="font-size:${Math.min(Number(px), 72)}px;line-height:1.1;white-space:nowrap;overflow:hidden">${t}</div></div>`).join("")}
      <div style="display:grid;grid-template-columns:160px 1fr;align-items:baseline;padding:14px 0"><div class="mono" style="font-size:12px;color:var(--ink)">日本語 · Noto Serif JP</div><div style="font-family:'Noto Serif JP','Yu Mincho',serif;font-size:44px">ゆっくりと作り、シンプルに。</div></div>
    </div>
  </div>
</div>`),
  },
  {
    file: "08-color-system",
    w: W,
    h: 1100,
    html: page(W, 1100, `
<div class="frame cream grain">
  ${folio(8, N, "Color system")}
  <div style="position:absolute;left:96px;top:150px;width:900px"><div class="eyebrow">Warm neutrals, one accent</div><p class="serif" style="font-size:46px;line-height:1.05;margin-top:14px">Every pairing measured — small caramel text has its own darker ink.</p></div>
  <div style="position:absolute;left:96px;right:96px;top:360px;display:grid;grid-template-columns:repeat(5,1fr);gap:16px">
    ${COLORS.slice(0, 15).map((c) => `<div style="border-radius:16px;overflow:hidden;background:var(--ivory);border:1px solid var(--sand)"><div style="height:110px;background:${c.hex}"></div><div style="padding:12px"><div style="font-size:15px;font-weight:600;text-transform:capitalize">${c.name.replace(/-/g, " ")}</div><div class="mono" style="font-size:11px;color:var(--stone);margin-top:4px">${c.hex} · ${Math.max(contrast(c.hex, "#F8F4EC"), contrast(c.hex, "#17120E")).toFixed(1)}:1</div></div></div>`).join("")}
  </div>
</div>`),
  },
  {
    file: "09-components",
    w: W,
    h: 1360,
    html: page(W, 1360, `
<div class="frame paper grain">
  ${folio(9, N, "Components")}
  <div style="position:absolute;left:96px;top:150px"><div class="eyebrow">Built once, used everywhere</div><p class="serif" style="font-size:46px;margin-top:14px">Captured from the running build.</p></div>
  <div style="position:absolute;left:96px;right:96px;top:310px;display:grid;grid-template-columns:1.25fr 1fr;gap:24px">
    <div style="display:grid;gap:24px">
      <div class="card" style="padding:20px"><img src="${P("screens/components/nav.png")}" style="width:100%;border-radius:10px"></div>
      <div class="card" style="padding:20px"><img src="${P("screens/components/menu-row.png")}" style="width:100%"></div>
      <div class="card" style="padding:20px;display:flex;gap:20px;align-items:center"><img src="${P("screens/components/drink-card.png")}" style="width:52%;border-radius:12px"><p class="muted" style="font-size:15px;line-height:1.6">Drink card: image scale, roast pips that fill on hover, tasting notes that rise, a lift of −8px — all transform and opacity.</p></div>
    </div>
    <div style="display:grid;gap:24px;align-content:start">
      <div class="card" style="padding:20px;background:var(--espresso)"><img src="${P("screens/components/pass.png")}" style="width:100%;border-radius:14px"></div>
      <div class="card" style="padding:20px"><img src="${P("screens/components/dock.png")}" style="width:100%"></div>
      <div class="card" style="padding:20px"><img src="${P("screens/components/calendar.png")}" style="width:100%;height:280px;object-fit:cover;object-position:top"></div>
    </div>
  </div>
</div>`),
  },
  {
    file: "10-motion",
    w: W,
    h: 1360,
    html: page(W, 1360, `
<div class="frame dark grain">
  ${folio(10, N, "Motion", true)}
  <div style="position:absolute;left:96px;top:150px;width:900px"><div class="eyebrow">One curve, every movement</div><p class="serif" style="font-size:48px;line-height:1.05;margin-top:14px">cubic-bezier(0.22, 1, 0.36, 1) — transform and opacity only, with a reduced-motion answer for everything.</p></div>
  <div style="position:absolute;left:96px;right:96px;top:380px;display:grid;grid-template-columns:1fr 1fr;gap:20px">
    ${["01-hero-animation", "07-page-transitions", "03-carousel", "05-steam-engine"].map((d) => `<div style="border-radius:16px;overflow:hidden;border:1px solid var(--char)"><img src="${P(`motion-breakdown/${d}.png`)}" style="display:block;width:100%"></div>`).join("")}
  </div>
</div>`),
  },
  {
    file: "11-mobile-experience",
    w: W,
    h: 1400,
    html: page(W, 1400, `
<div class="frame cream grain">
  ${folio(11, N, "Mobile experience")}
  <div style="position:absolute;left:96px;top:150px;width:900px"><div class="eyebrow">Below 768px, a different product</div><p class="serif" style="font-size:48px;line-height:1.05;margin-top:14px">A dock, sheets, a wallet pass — and a café that works offline.</p></div>
  <div style="position:absolute;left:96px;top:390px;display:flex;gap:26px">
    ${["phone-home", "phone-reservation", "phone-locations", "phone-ja-home"].map((s, i) => `<div style="margin-top:${i % 2 ? 50 : 0}px">${iphone(screen(s), 272, { shadow: true })}</div>`).join("")}
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:100px;display:grid;grid-template-columns:repeat(4,1fr);gap:20px">
    ${[["Atmosphere", "Light follows New York's clock; rain follows its weather."], ["Wallet pass", "Book a table, get a QR pass and a calendar invite."], ["Offline", "Menu and cafés open with no connection; install from the second visit."], ["日本語 · FR · IT", "Every page in four languages, prices in four currencies."]].map(([h, t]) => `<div><div class="serif" style="font-size:26px">${h}</div><p class="muted" style="font-size:14px;line-height:1.6;margin-top:6px">${t}</p></div>`).join("")}
  </div>
</div>`),
  },
  {
    file: "12-final-mockups",
    w: W,
    h: 1700,
    html: page(W, 1700, `
<div class="frame paper grain">
  ${folio(12, N, "Final mockups")}
  <div style="position:absolute;left:96px;top:150px"><div class="eyebrow">On screens, in print, on objects</div><p class="serif" style="font-size:46px;margin-top:14px">The identity, carried everywhere.</p></div>
  <div style="position:absolute;left:96px;right:96px;top:300px;bottom:110px;display:grid;grid-template-columns:1fr 1fr;gap:18px">
    ${["macbook-pro", "iphone-16-pro", "coffee-table-magazine", "store-poster", "coffee-cup", "menu-board"].map((m) => `<div style="border-radius:14px;overflow:hidden"><img src="${P(`mockups/${m}.png`)}" style="display:block;width:100%"></div>`).join("")}
  </div>
</div>`),
  },
  {
    file: "13-reflection",
    w: W,
    h: 1200,
    html: page(W, 1200, `
<div class="frame dark grain">
  ${folio(13, N, "Reflection", true)}
  <div style="position:absolute;left:96px;top:150px;width:880px"><div class="eyebrow">What held, what's next</div><p class="serif" style="font-size:50px;line-height:1.04;margin-top:16px">Discipline made the cinema affordable: measure every phase, and never let the desktop drift.</p></div>
  <div style="position:absolute;left:96px;right:96px;top:470px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;border-top:1px solid var(--char);padding-top:30px">
    ${stat(f.axe ?? "0", "axe violations · 4 languages")}${stat(f.qaChecks ?? "227", "checks per phase · 6 devices")}${stat(f.desktopDiff ?? "≤0.021%", "desktop pixel drift")}${stat(f.lighthouse?.desktopPerformance ?? "—", "Lighthouse desktop")}
  </div>
  <div style="position:absolute;left:96px;right:96px;top:680px;display:grid;grid-template-columns:1fr 1fr;gap:60px">
    <div><div class="serif" style="font-size:30px">Learned</div><p class="muted" style="font-size:16px;line-height:1.7;margin-top:10px">Atmosphere is the most expensive feature to get right: two innocent-looking choices — inheriting animated custom properties from the root, and reading layout in a frame loop — cost seconds of main-thread time on phones until measurement found them.</p></div>
    <div><div class="serif" style="font-size:30px">Next</div><p class="muted" style="font-size:16px;line-height:1.7;margin-top:10px">Native-speaker review of the Japanese, French and Italian copy; production keys for ordering, reservations and the concierge; and a desktop language switcher, once designed in Figma.</p></div>
  </div>
  <div style="position:absolute;left:96px;right:96px;bottom:110px;display:flex;justify-content:space-between;align-items:flex-end">
    <div>${logo(30)}<div class="mono" style="font-size:12px;color:var(--taupe);margin-top:14px">Thank you for reading.</div></div>
    <div class="mono" style="font-size:12px;color:var(--taupe)">Design & engineering — Sams Studio</div>
  </div>
</div>`),
  },
];

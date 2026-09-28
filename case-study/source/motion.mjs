/**
 * Motion breakdown — seven SVG diagrams. Every duration, delay, distance and
 * spring constant is the one the code uses (src/lib/motion.ts, globals.css,
 * the components named on each diagram).
 */
const W = 1600;
const H = 900;
const C = { bg: "#17120e", paper: "#f8f4ec", cream: "#efe5d7", caramel: "#a86a3c", glow: "#b67a4b", char: "#35302b", taupe: "#8f867e", olive: "#5c6e52", walnut: "#3c2415" };
const F = { serif: "Cormorant, 'Cormorant Garamond', Georgia, serif", sans: "Inter, system-ui, sans-serif", mono: "Plex, 'IBM Plex Mono', ui-monospace, monospace" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const text = (x, y, s, { size = 16, fill = C.cream, family = F.sans, anchor = "start", weight = 400, spacing = 0, upper = false } = {}) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" letter-spacing="${spacing}">${esc(upper ? String(s).toUpperCase() : s)}</text>`;
const mono = (x, y, s, o = {}) => text(x, y, s, { family: F.mono, size: 13, fill: C.taupe, spacing: 1.6, upper: true, ...o });

function frame(n, title, subtitle, source, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <radialGradient id="warm" cx="20%" cy="0%" r="70%"><stop offset="0" stop-color="${C.caramel}" stop-opacity=".16"/><stop offset="1" stop-color="${C.caramel}" stop-opacity="0"/></radialGradient>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  ${mono(80, 72, `Motion breakdown · ${String(n).padStart(2, "0")} / 07`, { fill: C.glow })}
  ${text(80, 130, title, { family: F.serif, size: 56, fill: C.paper })}
  ${text(80, 168, subtitle, { size: 17, fill: C.taupe })}
  ${body}
  ${mono(80, H - 44, `Source · ${source}`)}
  ${mono(W - 80, H - 44, "Noir Café · Sams Studio", { anchor: "end" })}
</svg>`;
}

/** A timeline: seconds → x. */
function timeline({ x0 = 300, x1 = 1500, y = 230, t0 = 0, t1 = 2, step = 0.25, rows, rowH = 64, label = "s" }) {
  const X = (t) => x0 + ((t - t0) / (t1 - t0)) * (x1 - x0);
  const ticks = [];
  for (let t = t0; t <= t1 + 1e-9; t += step) {
    const x = X(t);
    ticks.push(`<line x1="${x}" x2="${x}" y1="${y}" y2="${y + rows.length * rowH + 12}" stroke="${C.char}" stroke-width="1"/>${mono(x, y + rows.length * rowH + 34, `${+t.toFixed(2)}${label}`, { anchor: "middle", size: 11 })}`);
  }
  const bars = rows
    .map((r, i) => {
      const ry = y + 18 + i * rowH;
      const bx = X(r.start);
      const bw = Math.max(4, X(r.start + r.dur) - bx);
      const curve = r.curve !== false ? `<path d="M${bx} ${ry + 30} C${bx + bw * 0.22} ${ry + 30} ${bx + bw * 0.36} ${ry + 4} ${bx + bw} ${ry + 4}" fill="none" stroke="${C.paper}" stroke-opacity=".55" stroke-width="1.5"/>` : "";
      return `${text(80, ry + 22, r.label, { size: 17, fill: C.paper })}${r.note ? mono(80, ry + 44, r.note, { size: 11 }) : ""}
        <rect x="${bx}" y="${ry}" width="${bw}" height="34" rx="8" fill="${r.color ?? C.caramel}" fill-opacity="${r.opacity ?? 0.9}"/>${curve}
        ${r.tag ? mono(bx + bw + 12, ry + 22, r.tag, { size: 11, fill: C.cream }) : ""}`;
    })
    .join("");
  return ticks.join("") + bars;
}

const curveBox = (x, y, w, h, label) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="none" stroke="${C.char}"/>
  <path d="M${x + 20} ${y + h - 20} C${x + 20 + (w - 40) * 0.22} ${y + h - 20} ${x + 20 + (w - 40) * 0.36} ${y + 20} ${x + w - 20} ${y + 20}" fill="none" stroke="${C.caramel}" stroke-width="3"/>
  ${mono(x + 20, y + h + 26, label, { size: 11 })}`;

export const diagrams = [
  {
    file: "01-hero-animation",
    svg: frame(1, "Hero — a film that becomes a page", "Entrance plays in CSS before hydration, so the headline paints (and counts as LCP) at once. Scroll then scrubs the film.", "lib/motion.ts HERO_DELAYS · globals.css .hero-in / .hero-line · components/hero/HomeHero.tsx", `
      ${mono(80, 214, "Entrance · 1.1s each · cubic-bezier(0.22, 1, 0.36, 1)", { fill: C.glow })}
      ${timeline({ t1: 2, step: 0.25, y: 236, rowH: 58, rows: [
        { label: "Eyebrow", note: "fade + rise 18px", start: 0.1, dur: 1.1, tag: "delay .10" },
        { label: "Headline · line 1", note: "masked rise 105% → 0", start: 0.18, dur: 1.1, tag: "delay .18" },
        { label: "Headline · line 2", note: "masked rise 105% → 0", start: 0.28, dur: 1.1, tag: "delay .28" },
        { label: "Supporting copy", note: "fade + rise", start: 0.6, dur: 1.1, tag: "delay .60" },
        { label: "Buttons", note: "after the headline lands", start: 0.85, dur: 1.1, tag: "delay .85" },
      ] })}
      ${mono(80, 614, "Scroll-linked · progress = scrollY / hero height", { fill: C.glow })}
      ${timeline({ x0: 560, t1: 1, step: 0.1, y: 628, label: "", rowH: 40, rows: [
        { label: "Film  y 0 → −64 px · scale 1.04 → 1.10", start: 0, dur: 1, curve: false, opacity: 0.5 },
        { label: "Copy  y 0 → −72 · opacity 1 → 0", start: 0, dur: 0.6, curve: false, opacity: 0.7 },
        { label: "Steam y 0 → −180 · fades by 70%", start: 0, dur: 0.7, curve: false, opacity: 0.5, color: C.cream },
        { label: "Espresso veil 0 → .6", start: 0, dur: 1, curve: false, opacity: 0.35, color: C.walnut },
      ] }).replace(/(<text[^>]*font-size="11"[^>]*>)([\d.]+)(<\/text>)/g, (m, a, t, b) => `${a}${Math.round(t * 100)}%${b}`)}
    `),
  },
  {
    file: "02-scroll-story",
    svg: frame(2, "Scroll story — five chapters, one film at a time", "The home hero continues as a pinned story: each chapter is 90svh of scroll; films crossfade and only the one on screen plays.", "components/hero/PreparationStory.tsx · components/story/MobileStoryJourney.tsx", `
      ${["Origin", "Brew", "Extract", "Pour", "The cup"].map((c, i) => {
        const x = 80 + i * 292;
        return `<rect x="${x}" y="230" width="272" height="300" rx="18" fill="${i === 2 ? C.walnut : "#211a15"}" stroke="${i === 2 ? C.caramel : C.char}"/>
          ${mono(x + 24, 268, `Chapter 0${i + 1}`, { fill: i === 2 ? C.glow : C.taupe })}
          ${text(x + 24, 318, c, { family: F.serif, size: 38, fill: C.paper })}
          ${mono(x + 24, 360, i === 2 ? "Film playing" : "Paused on poster", { size: 11, fill: i === 2 ? C.cream : C.taupe })}
          <rect x="${x + 24}" y="390" width="224" height="110" rx="10" fill="${i === 2 ? C.caramel : C.char}" fill-opacity="${i === 2 ? 0.55 : 0.6}"/>
          ${mono(x + 24, 560, `${i * 90}–${(i + 1) * 90} svh`, { size: 11 })}`;
      }).join("")}
      <line x1="80" x2="1520" y1="610" y2="610" stroke="${C.char}" stroke-width="2"/>
      <line x1="80" x2="${80 + 1440 * 0.5}" y1="610" y2="610" stroke="${C.caramel}" stroke-width="2"/>
      <circle cx="${80 + 1440 * 0.5}" cy="610" r="8" fill="${C.caramel}"/>
      ${mono(80, 650, "Timeline rule scales with progress · chapter = floor(progress × 5)")}
      ${curveBox(80, 690, 300, 120, "Crossfade 900ms · ease-noir")}
      ${curveBox(420, 690, 300, 120, "Copy: blur 6 → 0 · y 28 → 0 · 0.7s")}
      ${text(780, 730, "Phones (M19)", { size: 20, fill: C.paper, weight: 600 })}
      ${text(780, 762, "Chapters pin a full-screen photograph or film while the words", { size: 16, fill: C.taupe })}
      ${text(780, 788, "scroll over it; a CSS view-timeline drifts the media and a warm", { size: 16, fill: C.taupe })}
      ${text(780, 814, "veil dissolves one chapter into the next — no JavaScript per frame.", { size: 16, fill: C.taupe })}
    `),
  },
  {
    file: "03-carousel",
    svg: frame(3, "Most-loved carousel — springs, not tweens", "Slides enter from ±56px with a slight 3D turn, can be flicked with inertia, and tilt toward the pointer. Autoplay is a CSS progress fill.", "lib/motion.ts carouselSlide / carouselSpring / CAROUSEL_TILT · components/sections/home/MostLoved.tsx", `
      <g transform="translate(120 250)">
        <rect x="-56" y="0" width="420" height="300" rx="20" fill="#211a15" stroke="${C.char}" transform="skewY(2)" opacity=".5"/>
        <rect x="0" y="0" width="420" height="300" rx="20" fill="${C.walnut}" stroke="${C.caramel}"/>
        ${mono(24, 36, "exit  x −56 · rotateY 6° · scale 1.02 · opacity 0", { size: 11, fill: C.cream })}
        ${mono(24, 272, "center  x 0 · rotateY 0 · scale 1", { size: 11, fill: C.cream })}
        <rect x="476" y="0" width="420" height="300" rx="20" fill="#211a15" stroke="${C.char}" opacity=".6"/>
        ${mono(500, 36, "enter  x +56 · rotateY −6°", { size: 11 })}
      </g>
      ${(() => {
        // Spring response: stiffness 120, damping 20, mass 1.
        const k = 120, c = 20, m = 1, pts = [];
        let x = 1, v = 0;
        for (let t = 0; t <= 1.2; t += 0.01) { pts.push([t, x]); const a = (-k * x - c * v) / m; v += a * 0.01; x += v * 0.01; }
        const X = (t) => 1080 + (t / 1.2) * 420, Y = (x) => 520 - (1 - x) * 240;
        return `<rect x="1060" y="250" width="460" height="300" rx="18" fill="none" stroke="${C.char}"/>
          <path d="${pts.map(([t, xx], i) => `${i ? "L" : "M"}${X(t).toFixed(1)} ${Y(xx).toFixed(1)}`).join(" ")}" fill="none" stroke="${C.caramel}" stroke-width="3"/>
          <line x1="1080" x2="1500" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.char}" stroke-dasharray="4 5"/>
          ${mono(1080, 580, "spring · stiffness 120 · damping 20", { size: 11 })}`;
      })()}
      ${[["Drag", "elastic .16 · bounce 220 / 26"], ["Tilt", "±3° at the edge · spring 150 / 18 · mass .6"], ["Autoplay", "6000 ms · CSS progress-fill · pauses on hover & focus"], ["Reduced motion", "no drag, tilt or slide — instant swap"]]
        .map(([h, d], i) => `${text(120 + i * 350, 660, h, { size: 20, fill: C.paper, weight: 600 })}${d.split(" · ").map((line, j) => mono(120 + i * 350, 690 + j * 22, line, { size: 11 })).join("")}`).join("")}
      <rect x="120" y="780" width="1380" height="3" fill="${C.char}"/><rect x="120" y="780" width="${1380 * 0.62}" height="3" fill="${C.caramel}"/>
      ${mono(120, 812, "04 / 04 · progress 62%")}
    `),
  },
  {
    file: "04-glass-navigation",
    svg: frame(4, "Glass navigation — frost over film, cream over paper", "A 72px pill, 28px from the top. It reads the section beneath it and changes glass; the active page is a caramel rule that slides.", "components/navigation/SiteNav.tsx · hooks/useNavTheme.ts · styles/tokens.css (glass)", `
      <rect x="80" y="220" width="1440" height="250" rx="22" fill="#241a14"/>
      <rect x="80" y="220" width="1440" height="250" rx="22" fill="url(#warm)"/>
      <rect x="150" y="262" width="1300" height="72" rx="36" fill="${C.paper}" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".15"/>
      ${text(200, 306, "◯  NOIR CAFÉ", { family: F.serif, size: 26, fill: C.paper })}
      ${["Home", "Menu", "Story", "Lab", "Locations", "Shop"].map((l, i) => text(560 + i * 92, 304, l, { size: 14, fill: C.paper, anchor: "middle" })).join("")}
      <rect x="642" y="316" width="19" height="1.5" fill="${C.caramel}"/>
      <rect x="1290" y="274" width="140" height="48" rx="24" fill="${C.paper}"/>${text(1360, 304, "RESERVE", { size: 12, fill: C.bg, anchor: "middle", weight: 600, spacing: 1 })}
      ${mono(150, 380, "Over dark sections · rgba(248,244,236,.08) · blur 30px · hairline white/15", { fill: C.cream })}
      ${mono(150, 410, "Reading progress · caramel hairline · spring 140 / 30", { size: 11 })}
      <rect x="80" y="500" width="1440" height="190" rx="22" fill="${C.paper}"/>
      <rect x="150" y="540" width="1300" height="72" rx="36" fill="${C.paper}" fill-opacity=".78" stroke="#fffcf7" stroke-opacity=".6"/>
      <rect x="150" y="540" width="1300" height="72" rx="36" fill="none" stroke="${C.walnut}" stroke-opacity=".08"/>
      ${text(200, 584, "◯  NOIR CAFÉ", { family: F.serif, size: 26, fill: C.bg })}
      ${["Home", "Menu", "Story", "Lab", "Locations", "Shop"].map((l, i) => text(560 + i * 92, 582, l, { size: 14, fill: C.bg, anchor: "middle" })).join("")}
      <rect x="734" y="594" width="19" height="1.5" fill="${C.caramel}"/>
      ${mono(150, 660, "Over paper · cream glass .78 · shadow-nav · transition 700ms ease-noir", { fill: C.walnut })}
      ${[["Active rule", "layoutId · slides 0.5s"], ["Hover", "rule grows from centre · 300ms"], ["Below 960 px", "collapses to the blurred menu sheet"], ["Below 768 px", "the phone dock takes over"]]
        .map(([h, d], i) => `${text(80 + i * 360, 752, h, { size: 19, fill: C.paper, weight: 600 })}${mono(80 + i * 360, 782, d, { size: 11 })}`).join("")}
    `),
  },
  {
    file: "05-steam-engine",
    svg: frame(5, "Steam engine — atmosphere that never gets in the way", "Desktop: five CSS wisps over the film. Phones: a canvas plume that answers scroll speed. Every layer stays under 8% opacity.", "components/hero/HeroAtmosphere.tsx · components/atmosphere/AtmosphereCanvas.tsx · globals.css @keyframes steam-rise", `
      ${[{ x: "44%", size: 220, dur: 11, delay: 0, drift: 18 }, { x: "50%", size: 180, dur: 9, delay: 2.4, drift: -14 }, { x: "47%", size: 260, dur: 13, delay: 4.8, drift: 26 }, { x: "53%", size: 160, dur: 10, delay: 6.6, drift: -22 }, { x: "41%", size: 200, dur: 12, delay: 8.2, drift: 10 }]
        .map((w, i) => {
          const y = 240 + i * 62;
          const X = (t) => 300 + (t / 22) * 560;
          return `${text(80, y + 22, `Wisp ${i + 1} · ${w.size}px`, { size: 16, fill: C.paper })}${mono(80, y + 42, `left ${w.x} · drift ${w.drift > 0 ? "+" : ""}${w.drift}px`, { size: 10 })}
            <rect x="${X(w.delay)}" y="${y}" width="${X(w.delay + w.dur) - X(w.delay)}" height="30" rx="8" fill="${C.cream}" fill-opacity=".22"/>
            <rect x="${X(w.delay)}" y="${y}" width="${(X(w.delay + w.dur) - X(w.delay)) * 0.25}" height="30" rx="8" fill="${C.cream}" fill-opacity=".45"/>
            ${mono(X(w.delay + w.dur) + 10, y + 20, `${w.dur}s loop`, { size: 10, fill: C.cream })}`;
        }).join("")}
      ${mono(300, 222, "0s", { size: 10 })}${mono(860, 222, "22s", { size: 10, anchor: "end" })}
      ${mono(80, 590, "steam-rise · scale .55 → 1.7 · rise −42vh · peak opacity at 25% · layer 8%", { fill: C.glow })}
      <rect x="940" y="220" width="580" height="400" rx="20" fill="#211a15" stroke="${C.char}"/>
      ${text(970, 262, "Phones · canvas plume", { size: 20, fill: C.paper, weight: 600 })}
      ${[["emit / frame", ".18 + speed × .08"], ["speed", "|scroll velocity| ≤ 40, smoothed .85"], ["puffs", "≤ 90 · life 140–220 frames"], ["rise", "vy −(.5 … .9) − speed × .04"], ["thins", "as the hero is covered (1 − y / .8h)"], ["runs", "only while visible · after load + idle"], ["reads", "scroll from events — never layout per frame"]]
        .map(([k, v], i) => `${mono(970, 306 + i * 42, k, { size: 11 })}${text(1150, 306 + i * 42, v, { size: 15, fill: C.cream })}`).join("")}
      ${mono(80, 680, "Rain mode (M20) shares the canvas: 80 slanted streaks that lean with scroll; follows New York's weather.", { size: 11 })}
      ${mono(80, 710, "Reduced motion: wisps, dust and particles are not drawn at all.", { size: 11 })}
    `),
  },
  {
    file: "06-loader",
    svg: frame(6, "Loader — once per visit, never in the way", "“Preparing your coffee…” shows on a first desktop visit only. It stays at least 800ms, never more than 2.2s, then the hero entrance begins.", "components/layout/Loader.tsx (LOADER_BOOT) · components/layout/LoaderController.tsx", `
      ${timeline({ t1: 3, step: 0.25, y: 250, rows: [
        { label: "Boot script (in <head>)", note: "decides before first paint", start: 0, dur: 0.05, curve: false, tag: "sessionStorage · phone · reduced motion → skip" },
        { label: "Loader visible", note: "percent follows real progress", start: 0, dur: 1.6, tag: "min 800ms · max 2200ms" },
        { label: "Finish condition", note: "progress ≥ 85% and ≥ 800ms", start: 0.8, dur: 1.4, opacity: 0.35, curve: false, tag: "whichever comes first" },
        { label: "Hero entrance", note: "noir-intro-late shifts the delays", start: 1.6, dur: 1.1, tag: "then HERO_DELAYS" },
      ] })}
      ${text(80, 650, "Skipped entirely", { size: 20, fill: C.paper, weight: 600 })}
      ${mono(80, 684, "repeat visits in the session · phones below 768px · prefers-reduced-motion", { size: 12, fill: C.cream })}
      ${text(80, 740, "Why it's cheap", { size: 20, fill: C.paper, weight: 600 })}
      ${mono(80, 774, "the boot runs before React; the headline is already in the HTML behind the veil", { size: 12, fill: C.cream })}
    `),
  },
  {
    file: "07-page-transitions",
    svg: frame(7, "Page transitions 2.0 — one grammar, five voices", "The View Transitions API with a CSS fallback. The nav and dock persist; the page changes with a transition chosen by destination, from the point you clicked.", "src/lib/transitions.ts · components/layout/TransitionDirector.tsx · globals.css ::view-transition", `
      ${timeline({ t1: 1, step: 0.1, y: 240, rowH: 70, rows: [
        { label: "Dissolve (default)", note: "out 320ms · blur 10 · scale .992", start: 0, dur: 0.32, tag: "in 560ms after 90ms · blur 12 · scale 1.008" },
        { label: "Liquid → Menu", note: "wave mask pours in", start: 0, dur: 0.9, tag: "900ms" },
        { label: "Steam → Lab, Cup", note: "blur-rise out, condense in", start: 0, dur: 0.85, tag: "850ms" },
        { label: "Stain → Reservation", note: "ring spreads from the click", start: 0, dur: 0.8, tag: "800ms" },
        { label: "Push → Home, Story", note: "camera push", start: 0, dur: 0.48, tag: "out 480ms · in 820ms after 80ms" },
      ] })}
      ${mono(80, 700, "Persistent: site-nav · mobile-dock · page-title morph", { fill: C.glow })}
      ${mono(80, 730, "Old snapshot: normal blend over the canvas background — no ghosting", { size: 11 })}
      ${mono(80, 760, "Unsupported browsers: instant navigation; reduced motion: no animation at all", { size: 11 })}
    `),
  },
];

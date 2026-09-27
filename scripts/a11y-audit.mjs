// Accessibility audit — npm run build && npm start, then: node scripts/a11y-audit.mjs [--routes a,b] [--out file]
// Per route × {phone 390, desktop 1440}: axe (all impacts, WCAG 2.2 AA + best practice, after
// scrolling so lazy content is in), structure (lang, one h1, one main, heading order, skip link),
// keyboard (focus visibility on every tabbable), reduced motion (no infinite/running animations,
// no autoplaying film), touch target size on phones (≥ 24px WCAG 2.5.8; flags < 44).
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const BASE = process.env.BASE ?? "http://localhost:3100";
const ROUTES = opt("--routes", "/,/menu,/story,/brewing-lab,/brewing-lab/studio,/cup,/reservation,/locations,/shop,/concierge,/order,/offline").split(",");
const OUT = opt("--out", "a11y.json");
const VIEWS = { phone: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } };
const WEBGL = new Set(["/cup", "/brewing-lab/studio"]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// For text axe can't decide (over photos/gradients/translucent layers): screenshot the text's
// box with the text made transparent, and take the worst-case (closest luminance) backdrop pixel.
import { PNG } from "pngjs";
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
async function pixelContrast(p, dpr) {
  const nodes = await p.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const els = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim() && n.parentElement) els.add(n.parentElement);
    let i = 0;
    for (const el of els) {
      const c = getComputedStyle(el);
      if (c.visibility === "hidden" || +c.opacity === 0 || el.closest("[aria-hidden=true],.sr-only,svg")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight * 6) continue;
      // Only text whose backdrop isn't a plain opaque colour on the element chain.
      let plain = false;
      for (let a = el; a; a = a.parentElement) {
        const ac = getComputedStyle(a);
        if (ac.backgroundImage !== "none" || ac.backdropFilter !== "none") break;
        const m = ac.backgroundColor.match(/[\d.]+/g);
        if (m && (m[3] === undefined || +m[3] === 1)) { plain = true; break; }
        if (m && +m[3] > 0) break;
      }
      if (plain) continue;
      const cv = (window.__cv ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true })); cv.clearRect(0, 0, 1, 1); cv.fillStyle = c.color; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; const rgb = [d[0], d[1], d[2], d[3] / 255];
      const size = parseFloat(c.fontSize), weight = +c.fontWeight;
      el.dataset.a11yPc = String(i++);
      out.push({ i: i - 1, rgb, alpha: rgb[3] ?? 1, large: size >= 24 || (size >= 18.66 && weight >= 700), text: el.textContent.trim().slice(0, 40) });
    }
    return out.slice(0, 60);
  });
  const fails = [];
  for (const n of nodes) {
    const box = await p.evaluate((i) => {
      const el = document.querySelector(`[data-a11y-pc="${i}"]`);
      el.scrollIntoView({ block: "center" });
      let r = el.getBoundingClientRect();
      // Rounded painted container (pill/card): sample only its safe inner rectangle, not
      // the photo showing through its square corners.
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const ac = getComputedStyle(a);
        const rad = parseFloat(ac.borderTopLeftRadius);
        if (rad > 0 && ac.backgroundColor !== "rgba(0, 0, 0, 0)") {
          const ar = a.getBoundingClientRect();
          const inset = Math.min(rad, ar.height / 2) * 0.3;
          const x = Math.max(r.x, ar.x + inset), y = Math.max(r.y, ar.y + inset);
          const x2 = Math.min(r.right, ar.right - inset), y2 = Math.min(r.bottom, ar.bottom - inset);
          r = { x, y, width: x2 - x, height: y2 - y };
          break;
        }
      }
      // Stacked duplicates (the header's tone-crossfade copies) would read as backdrop.
      const header = el.closest("header");
      if (header) for (const t of header.querySelectorAll("*")) if (!t.contains(el) && !el.contains(t) && [...t.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) { t.dataset.a11yHid = t.style.cssText; t.style.setProperty("visibility", "hidden", "important"); }
      for (const d of [el, ...el.querySelectorAll("*")]) { d.dataset.a11yColor = d.style.cssText; d.style.setProperty("color", "transparent", "important"); d.style.setProperty("text-shadow", "none", "important"); d.style.setProperty("-webkit-text-fill-color", "transparent", "important"); if (d instanceof SVGElement || d.tagName === "IMG") d.style.setProperty("visibility", "hidden", "important"); }
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }, n.i);
    await new Promise((r) => setTimeout(r, 60));
    if (box.width < 2 || box.height < 2) continue;
    const buf = await p.screenshot({ captureBeyondViewport: false });
    await p.evaluate((i) => { const el = document.querySelector(`[data-a11y-pc="${i}"]`); for (const d of [el, ...el.querySelectorAll("*")]) d.style.cssText = d.dataset.a11yColor ?? ""; for (const t of document.querySelectorAll("[data-a11y-hid]")) { t.style.cssText = t.dataset.a11yHid; delete t.dataset.a11yHid; } }, n.i);
    const png = PNG.sync.read(buf);
    let worst = Infinity;
    const x0 = Math.max(0, Math.floor(box.x * dpr)), y0 = Math.max(0, Math.floor(box.y * dpr)), x1 = Math.min(png.width, Math.ceil((box.x + box.width) * dpr)), y1 = Math.min(png.height, Math.ceil((box.y + box.height) * dpr));
    const fg = n.rgb.slice(0, 3);
    for (let yy = y0; yy < y1; yy += 2) for (let xx = x0; xx < x1; xx += 2) {
      const k = (yy * png.width + xx) * 4;
      const bg = [png.data[k], png.data[k + 1], png.data[k + 2]];
      // Blend translucent text over this pixel.
      const col = fg.map((c, j) => c * n.alpha + bg[j] * (1 - n.alpha));
      worst = Math.min(worst, ratio(col, bg));
    }
    const need = n.large ? 3 : 4.5;
    if (worst < need) fails.push(`"${n.text}" ${worst.toFixed(2)} < ${need}`);
  }
  await p.evaluate(() => scrollTo(0, 0));
  return { checked: nodes.length, fails };
}

const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--disable-gpu"] });
const report = {};
for (const route of ROUTES) {
  for (const [view, vp] of Object.entries(VIEWS)) {
    const ctx = await b.createBrowserContext();
    const p = await ctx.newPage();
    await p.setViewport(vp);
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await p.goto(BASE + route, { waitUntil: WEBGL.has(route) ? "load" : "networkidle2", timeout: 60000 });
    await wait(WEBGL.has(route) ? 3000 : 800);
    // Walk the page so lazy sections mount, then back to top.
    await p.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, 0);
    });
    await wait(600);
    const r = { route, view };

    // Reduced motion — before anything is focused/hovered.
    r.motion = await p.evaluate(() => {
      const running = document.getAnimations().filter((a) => a.playState === "running" && (a.effect?.getTiming().iterations === Infinity || Number(a.effect?.getTiming().duration) > 1000));
      const films = [...document.querySelectorAll("video")].filter((v) => !v.paused).length;
      return { running: running.map((a) => `${a.animationName || a.constructor.name}@${a.effect?.target?.className?.toString().slice(0, 50)}`).slice(0, 8), films };
    });

    await p.addStyleTag({ content: "*,*::before,*::after{transition:none!important}" });
    await p.addScriptTag({ content: AXE });
    const axe = await p.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"], resultTypes: ["violations", "incomplete"] });
      const map = (v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ").slice(0, 240) });
      return { violations: res.violations.map(map), incomplete: res.incomplete.filter((v) => v.id === "color-contrast").map(map) };
    });
    r.axe = axe;

    r.structure = await p.evaluate(() => {
      const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => h.getClientRects().length && getComputedStyle(h).visibility !== "hidden");
      const jumps = [];
      for (let i = 1; i < hs.length; i++) {
        const a = +hs[i - 1].tagName[1], c = +hs[i].tagName[1];
        if (c > a + 1) jumps.push(`${hs[i - 1].tagName}→${hs[i].tagName} "${hs[i].textContent.trim().slice(0, 30)}"`);
      }
      const imgs = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
      return { lang: document.documentElement.lang, title: document.title, h1: hs.filter((h) => h.tagName === "H1").length, mains: document.querySelectorAll("main").length, jumps, imgsNoAlt: imgs };
    });

    // Keyboard: first tab = skip link; skip link moves focus into main.
    await p.evaluate(() => document.activeElement?.blur());
    await p.keyboard.press("Tab");
    r.skip = await p.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute("href"), visible: document.activeElement?.getBoundingClientRect().width > 0 && getComputedStyle(document.activeElement).opacity !== "0" }));
    if (/skip/i.test(r.skip.text ?? "")) {
      await p.keyboard.press("Enter");
      await wait(300);
      r.skip.lands = await p.evaluate(() => { const a = document.activeElement; return !!a && (a.tagName === "MAIN" || !!a.closest("main") || !!a.querySelector?.("main")); });
    }

    // Focus visibility: tab through (cap 150); an indicator is any paint change on the
    // element or its 3 nearest ancestors (outline, shadow, border, colour, background).
    await p.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    const invisible = [];
    let tabbables = 0;
    for (let i = 0; i < 150; i++) {
      await p.keyboard.press("Tab");
      const f = await p.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        if (el.dataset.a11ySeen) return { again: true };
        el.dataset.a11ySeen = "1";
        const chain = [el, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement].filter(Boolean);
        const sig = () => chain.map((n) => { const c = getComputedStyle(n); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.color, c.backgroundColor, c.textDecorationLine].join("/"); }).join("|");
        const pseudo = () => chain.map((n) => { const c = getComputedStyle(n, "::after"); return c.boxShadow + c.outlineStyle + c.opacity + c.borderColor; }).join("|");
        const focused = sig() + pseudo();
        const r = el.getBoundingClientRect();
        const label = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("name") || el.tagName).trim().slice(0, 40);
        return { focused, zero: r.width === 0 || r.height === 0, label, tag: el.tagName };
      });
      if (!f) continue;
      if (f.again) break;
      tabbables++;
      // Compare with the blurred paint of the same element.
      const blurred = await p.evaluate(() => {
        const el = document.querySelector("[data-a11y-seen]:focus") ?? document.activeElement;
        const chain = [el, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement].filter(Boolean);
        el.blur();
        const sig = chain.map((n) => { const c = getComputedStyle(n); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.borderColor, c.color, c.backgroundColor, c.textDecorationLine].join("/"); }).join("|");
        const pseudo = chain.map((n) => { const c = getComputedStyle(n, "::after"); return c.boxShadow + c.outlineStyle + c.opacity + c.borderColor; }).join("|");
        window.__refocus = el;
        return sig + pseudo;
      });
      await p.evaluate(() => window.__refocus?.focus({ focusVisible: true }));
      if (blurred === f.focused || f.zero) invisible.push(`${f.tag} "${f.label}"${f.zero ? " (zero-size)" : ""}`);
    }
    r.keyboard = { tabbables, noVisibleFocus: invisible };
    await p.evaluate(() => document.activeElement?.blur());
    r.pixelContrast = await pixelContrast(p, view === "phone" ? 2 : 1);

    if (view === "phone") {
      r.targets = await p.evaluate(() => {
        const small = [];
        for (const el of document.querySelectorAll("a[href],button,input,select,textarea,[role=button],[role=switch],[role=tab]")) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height || getComputedStyle(el).visibility === "hidden") continue;
          if (el.closest("p,li") && el.tagName === "A" && el.closest("p")) continue; // inline text links are exempt
          if (r.width < 24 || r.height < 24) small.push(`${el.tagName} "${(el.getAttribute("aria-label") || el.textContent).trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
        }
        return small.slice(0, 12);
      });
    }
    report[`${view} ${route}`] = r;
    const v = axe.violations;
    console.log(`${view.padEnd(7)} ${route.padEnd(20)} axe:${v.length ? v.map((x) => `${x.id}(${x.impact})×${x.n}`).join(",") : "0"} px:${r.pixelContrast.checked}/${r.pixelContrast.fails.length}✗ h1:${r.structure.h1} jumps:${r.structure.jumps.length} skip:${r.skip.text?.slice(0, 20)}${r.skip.lands === false ? "✗" : ""} tab:${r.keyboard.tabbables} noFocus:${invisible.length} anim:${r.motion.running.length} films:${r.motion.films}${r.targets?.length ? " small:" + r.targets.length : ""}`);
    await ctx.close();
  }
}
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
await b.close();

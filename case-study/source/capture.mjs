/**
 * Screens for the case study — captured from a running production build
 * (npm run build && npm start -- -p 3100), so every image is the real site.
 *
 *   node case-study/source/capture.mjs [--base http://localhost:3100]
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { SCREENS } from "./common.mjs";

const args = process.argv.slice(2);
const BASE = args.includes("--base") ? args[args.indexOf("--base") + 1] : "http://localhost:3100";
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
fs.mkdirSync(path.join(SCREENS, "components"), { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 };
const PHONE = { width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const TABLET = { width: 820, height: 1180, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true };
const WEBGL = new Set(["/cup", "/brewing-lab/studio"]);

const shots = [
  ...[["home", "/"], ["menu", "/menu"], ["story", "/story"], ["lab", "/brewing-lab"], ["studio", "/brewing-lab/studio"], ["cup", "/cup"], ["reservation", "/reservation"], ["locations", "/locations"], ["shop", "/shop"], ["concierge", "/concierge"], ["order", "/order"]].map(([n, r]) => ({ name: `desktop-${n}`, route: r, vp: DESKTOP })),
  { name: "desktop-home-full", route: "/", vp: DESKTOP, full: 5200 },
  { name: "desktop-menu-full", route: "/menu", vp: DESKTOP, full: 3200 },
  ...[["home", "/"], ["menu", "/menu"], ["story", "/story"], ["lab", "/brewing-lab"], ["studio", "/brewing-lab/studio"], ["cup", "/cup"], ["reservation", "/reservation"], ["locations", "/locations"], ["shop", "/shop"], ["order", "/order"], ["concierge", "/concierge"]].map(([n, r]) => ({ name: `phone-${n}`, route: r, vp: PHONE })),
  { name: "phone-ja-home", route: "/ja", vp: PHONE },
  { name: "phone-ja-menu", route: "/ja/menu", vp: PHONE },
  { name: "phone-fr-menu", route: "/fr/menu", vp: PHONE },
  { name: "phone-it-story", route: "/it/story", vp: PHONE },
  { name: "desktop-ja-menu", route: "/ja/menu", vp: DESKTOP },
  { name: "tablet-home", route: "/", vp: TABLET },
  { name: "tablet-shop", route: "/shop", vp: TABLET },
  { name: "tablet-menu", route: "/menu", vp: TABLET },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--disable-gpu", "--hide-scrollbars"] });

async function open(vp, route) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport(vp);
  // A returning visitor: no first-visit loader, no install offer.
  await p.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("noir:loaded", "1");
      localStorage.setItem("noir:install-dismissed", "1");
    } catch {}
  });
  await p.setExtraHTTPHeaders({ "accept-language": "en-US,en;q=0.9" });
  await p.goto(BASE + route, { waitUntil: WEBGL.has(route) ? "load" : "networkidle2", timeout: 90000 });
  await wait(WEBGL.has(route) ? 4500 : 2600);
  // Reveal everything that animates in on scroll, then settle.
  await p.evaluate(() => document.querySelectorAll(".fade-up").forEach((el) => el.classList.add("is-in")));
  return { ctx, p };
}

const pick = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
for (const s of args.includes("--components-only") ? [] : shots.filter((x) => !pick || pick.includes(x.name))) {
  const { ctx, p } = await open(s.vp, s.route);
  if (s.full) {
    await p.evaluate(async (h) => {
      for (let y = 0; y < h; y += 500) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, 0);
    }, s.full);
    await wait(800);
    await p.screenshot({ path: path.join(SCREENS, `${s.name}.jpg`), type: "jpeg", quality: 84, clip: { x: 0, y: 0, width: s.vp.width, height: s.full }, captureBeyondViewport: true });
  } else {
    await p.screenshot({ path: path.join(SCREENS, `${s.name}.jpg`), type: "jpeg", quality: 84 });
  }
  console.log("screen", s.name);
  await ctx.close();
}

// Components, cropped from the live pages.
if (pick) { await browser.close(); process.exit(0); }
async function element(vp, route, selector, name, prepare) {
  const { ctx, p } = await open(vp, route);
  if (prepare) await prepare(p);
  const el = await p.evaluateHandle((sel) => [...document.querySelectorAll(sel)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 20 && getComputedStyle(e).visibility !== "hidden"; }) ?? null, selector);
  if (!(await el.evaluate((e) => !!e))) {
    console.warn("missing", name, selector);
    await ctx.close();
    return;
  }
  await el.evaluate((e) => e.scrollIntoView({ block: "center" }));
  await wait(900);
  await el.screenshot({ path: path.join(SCREENS, "components", `${name}.png`) });
  console.log("component", name);
  await ctx.close();
}
await element(DESKTOP, "/menu", "header nav", "nav");
await element(DESKTOP, "/", "#featured-title ~ * article, section[aria-labelledby='featured-title'] article", "drink-card");
await element(DESKTOP, "/menu", "main li:has(> div [aria-label='Tasting notes']), main ul li", "menu-row");
await element(PHONE, "/reservation", "section[aria-live='polite']", "pass");
await element(PHONE, "/menu", ".mobile-dock", "dock");
await element(PHONE, "/reservation", "[role='grid']", "calendar", async (p) => p.evaluate(() => document.querySelector("[role='grid']")?.closest(".rounded-xl")?.setAttribute("data-capture", "")));

await browser.close();

#!/usr/bin/env node
/**
 * iOS launch screens (apple-touch-startup-image) for the installed app.
 * Renders the brand splash — espresso ground, the Noir mark, the wordmark and
 * the site's own tagline — at every current iPhone/iPad size, and prints the
 * media queries used in app/layout.tsx.
 *
 *   node scripts/generate-splash.mjs   (needs Chrome; CHROME_PATH to override)
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

// [css width, css height, device pixel ratio]
export const SPLASH_SIZES = [
  [430, 932, 3], [393, 852, 3], [428, 926, 3], [390, 844, 3], [375, 812, 3],
  [414, 896, 2], [414, 896, 3], [375, 667, 2],
  [820, 1180, 2], [834, 1194, 2], [1024, 1366, 2],
];

const root = process.cwd();
const out = path.join(root, "public/splash");
fs.mkdirSync(out, { recursive: true });
const font = pathToFileURL(path.join(root, "src/fonts/cormorant-garamond-latin-wght400-500.woff2")).href;

const html = (w, h) => `<!doctype html><html><head><style>
@font-face { font-family: Cormorant; src: url("${font}") format("woff2"); font-weight: 400 500; }
html, body { margin: 0; width: ${w}px; height: ${h}px; background: #17120e; }
body { display: grid; place-items: center; }
.mark { display: flex; flex-direction: column; align-items: center; gap: ${Math.round(w * 0.045)}px; color: #f8f4ec; }
.logo { display: flex; align-items: center; gap: ${Math.round(w * 0.035)}px; font: 500 ${Math.round(w * 0.085)}px/1 Cormorant, Georgia, serif; letter-spacing: 0.02em; }
.ring { width: ${Math.round(w * 0.09)}px; height: ${Math.round(w * 0.09)}px; border: ${Math.max(1.5, w * 0.004)}px solid currentColor; border-radius: 50%; }
.tag { font: 400 ${Math.max(10, Math.round(w * 0.028))}px/1 ui-monospace, Menlo, monospace; letter-spacing: 0.16em; text-transform: uppercase; color: #b67a4b; }
</style></head><body><div class="mark"><div class="logo"><span class="ring"></span>NOIR CAFÉ</div><div class="tag">Specialty coffee · New York</div></div></body></html>`;

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new" });
const page = await browser.newPage();
const media = [];
for (const [w, h, dpr] of SPLASH_SIZES) {
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.setContent(html(w, h), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const file = `splash-${w * dpr}x${h * dpr}.png`;
  await page.screenshot({ path: path.join(out, file) });
  media.push({ url: `/splash/${file}`, media: `(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)` });
}
await browser.close();
fs.writeFileSync(path.join(root, "src/constants/splash.json"), JSON.stringify(media, null, 2) + "\n");
console.log(`wrote ${media.length} launch screens → public/splash, src/constants/splash.json`);

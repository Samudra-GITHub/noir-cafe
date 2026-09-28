#!/usr/bin/env node
/**
 * Sams Studio case-study generator.
 *
 *   node case-study/source/capture.mjs     # screens from a running build (:3100)
 *   node case-study/source/render.mjs      # everything below, from those screens
 *   node case-study/source/render.mjs --only behance,social
 *
 * Output (case-study/): motion-breakdown/ (SVG + PNG), mockups/, design-system/,
 * timeline/, github/ (SVG + PNG), behance/, social/, press-kit/.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { BUILD, CSS, HERE, OUT, ROOT } from "./common.mjs";

const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const want = (g) => !only || only.includes(g);
fs.mkdirSync(BUILD, { recursive: true });

// ── Facts: everything the copy quotes, measured from the repository ───────
function writeFacts() {
  const pages = fs.readdirSync(path.join(ROOT, "src/app/[lang]"), { recursive: true }).filter((p) => String(p).endsWith("page.tsx"));
  const publicRoutes = pages.filter((p) => !/offline|confirmed/.test(String(p))).length;
  const i18n = execSync("node scripts/i18n-check.mjs", { cwd: ROOT, encoding: "utf8" }).split("\n")[0];
  const strings = Number(/(\d+) source strings/.exec(i18n)?.[1] ?? 0);
  const commits = Number(execSync("git rev-list --count HEAD", { cwd: ROOT, encoding: "utf8" }).trim());
  const audit = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/accessibility/audit.json"), "utf8"));
  const axe = Object.values(audit).reduce((n, r) => n + (r.axe?.violations?.length ?? 0), 0);
  const measured = JSON.parse(fs.readFileSync(path.join(HERE, "measurements.json"), "utf8"));
  const facts = { routes: publicRoutes, locales: 4, pages: publicRoutes * 4, strings, commits, axe, ...measured };
  fs.writeFileSync(path.join(HERE, "facts.json"), JSON.stringify(facts, null, 2) + "\n");
  return facts;
}
console.log("facts", JSON.stringify(writeFacts()));

// Modules read facts.json at import time, so import after writing it.
const { diagrams } = await import("./motion.mjs");
const { mockups } = await import("./mockups.mjs");
const { designSystem } = await import("./design-system.mjs");
const { timelineSvg } = await import("./timeline.mjs");
const github = await import("./github.mjs");
const { behance } = await import("./behance.mjs");
const { social } = await import("./social.mjs");
const { logos } = await import("./press-kit.mjs");

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--disable-gpu", "--allow-file-access-from-files", "--hide-scrollbars"],
});
const tab = await browser.newPage();

async function png(file, w, h, html, { scale = 1, still = false } = {}) {
  const src = path.join(BUILD, `${file.replace(/[\\/]/g, "__")}.html`);
  fs.writeFileSync(src, html);
  await tab.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  // Animated SVGs are captured in their reduced-motion state: the settled final frame.
  await tab.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: still ? "reduce" : "no-preference" }]);
  await tab.goto(pathToFileURL(src).href, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => (i.onload = i.onerror = r))))));
  // Content that runs into the bottom credit line (or off the canvas) is a layout bug.
  const low = await tab.evaluate((h) => Math.max(0, ...[...document.querySelectorAll(".card, img, p, h1, h2")].map((e) => e.getBoundingClientRect().bottom)) - (h - 80), h);
  if (low > 0 && !/^(mockups|github|social)\//.test(file)) console.warn(`warn ${file}: content ends ${Math.round(low)}px into the footer zone`);
  const buf = await tab.screenshot({ type: "png", clip: { x: 0, y: 0, width: w, height: h } });
  const out = path.join(OUT, `${file}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(buf).png({ compressionLevel: 9, palette: true, quality: 92, effort: 8 }).toFile(out);
  console.log("png", file);
}
const svgPage = (svg, w, h, bg = "transparent") =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}html,body{width:${w}px;height:${h}px;margin:0;overflow:hidden;background:${bg}}</style></head><body>${svg}</body></html>`;
const dims = (svg) => [Number(/width="(\d+)"/.exec(svg)[1]), Number(/height="(\d+)"/.exec(svg)[1])];
function writeSvg(file, svg) {
  const out = path.join(OUT, `${file}.svg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg);
}
async function svgAndPng(file, svg, opts = {}) {
  writeSvg(file, svg);
  const [w, h] = dims(svg);
  await png(file, w, h, svgPage(svg, w, h, opts.bg), opts);
}

if (want("motion")) for (const d of diagrams) await svgAndPng(`motion-breakdown/${d.file}`, d.svg);
if (want("timeline")) await svgAndPng("timeline/development-timeline", timelineSvg());
if (want("mockups")) for (const m of mockups) await png(`mockups/${m.file}`, m.w, m.h, m.html);
if (want("design-system")) for (const d of designSystem) await png(`design-system/${d.file}`, d.w, d.h, d.html);
if (want("github")) {
  for (const [file, svg] of [["readme-hero", github.readmeHero()], ["architecture", github.architecture()], ["folder-structure", github.folderTree()], ["tech-stack", github.techStack()]]) await svgAndPng(`github/${file}`, svg, { still: true });
  for (const b of github.badges()) writeSvg(`github/badges/${b.file}`, b.svg);
  for (const p of github.previews) await png(`github/${p.file}`, p.w, p.h, p.html);
}
if (want("behance")) for (const b of behance) await png(`behance/${b.file}`, b.w, b.h, b.html);
if (want("social")) for (const s of social) await png(`social/${s.file}`, s.w, s.h, s.html);
if (want("press-kit")) for (const l of logos) await svgAndPng(`press-kit/logos/${l.file}`, l.svg, { bg: l.bg, scale: 2 });

await browser.close();

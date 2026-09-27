#!/usr/bin/env node
/**
 * Bundle report — first-load weight per route, read from the prerendered HTML
 * in .next after `next build`. Counts what a first visit downloads before any
 * interaction: scripts, stylesheets and preloaded fonts (gzip sizes).
 *
 *   node scripts/bundle-report.mjs            → prints a table
 *   node scripts/bundle-report.mjs --json out → also writes JSON (for diffing)
 *   node scripts/bundle-report.mjs --diff a.json b.json
 *   node scripts/bundle-report.mjs --modules [n]  → client JS by package
 *     (needs `npx next experimental-analyze --output` first; all routes)
 *   node scripts/bundle-report.mjs --modules [n]  → client JS by package
 *     (needs `npx next experimental-analyze --output` first; all routes)
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = process.cwd();
const APP = path.join(ROOT, ".next/server/app");
const ROUTES = ["index", "menu", "story", "brewing-lab", "reservation", "locations", "shop"];

const gz = (file) => zlib.gzipSync(fs.readFileSync(file)).length;
const kb = (n) => (n / 1024).toFixed(1);

function report() {
  const rows = {};
  for (const route of ROUTES) {
    const htmlFile = path.join(APP, `${route}.html`);
    if (!fs.existsSync(htmlFile)) continue;
    const html = fs.readFileSync(htmlFile, "utf8");
    const pick = (re) => [...new Set([...html.matchAll(re)].map((m) => m[1]))];
    const size = (urls) =>
      urls.reduce((sum, u) => {
        const file = path.join(ROOT, ".next", u.replace(/^\/_next\//, ""));
        return fs.existsSync(file) ? sum + gz(file) : sum;
      }, 0);
    // noModule scripts (legacy polyfills) are never fetched by modern browsers.
    const js = pick(/<script(?![^>]*noModule)[^>]+src="(\/_next\/static\/[^"]+\.js)"/g);
    const css = pick(/<link[^>]+href="(\/_next\/static\/[^"]+\.css)"/g);
    const fonts = pick(/<link[^>]+href="(\/_next\/static\/media\/[^"]+\.woff2)"[^>]*as="font"/g);
    rows[route === "index" ? "/" : `/${route}`] = {
      js: size(js),
      jsFiles: js.length,
      css: size(css),
      fonts: fonts.reduce((s, u) => s + fs.statSync(path.join(ROOT, ".next", u.replace(/^\/_next\//, ""))).size, 0),
      fontFiles: fonts.length,
      html: zlib.gzipSync(html).length,
    };
  }
  return rows;
}

function print(rows) {
  console.log("route            JS gz (files)   CSS gz   fonts (preloaded)   HTML gz");
  for (const [r, v] of Object.entries(rows)) {
    console.log(
      `${r.padEnd(16)} ${kb(v.js).padStart(7)}k (${String(v.jsFiles).padStart(2)})  ${kb(v.css).padStart(6)}k  ${kb(v.fonts).padStart(8)}k (${v.fontFiles})  ${kb(v.html).padStart(8)}k`,
    );
  }
}

/**
 * Client JS by package, from `next experimental-analyze --output`
 * (.next/diagnostics/analyze/data/analyze.data: u32 length + JSON header).
 */
function modules() {
  const file = path.join(ROOT, ".next/diagnostics/analyze/data/analyze.data");
  if (!fs.existsSync(file)) throw new Error("Run `npx next experimental-analyze --output` first.");
  const buf = fs.readFileSync(file);
  const data = JSON.parse(buf.subarray(4, 4 + buf.readUInt32BE(0)).toString("utf8"));
  const memo = new Map();
  const full = (i) => {
    if (!memo.has(i)) {
      const s = data.sources[i];
      memo.set(i, s.parent_source_index == null ? s.path : `${full(s.parent_source_index)}/${s.path}`);
    }
    return memo.get(i);
  };
  const totals = {};
  for (const part of data.chunk_parts) {
    const out = data.output_files[part.output_file_index].filename;
    if (!/static\/chunks\/.*\.js$/.test(out)) continue;
    const p = full(part.source_index).replace(/\/+/g, "/");
    const pkg = p.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    const key = pkg ? pkg[1] : p.includes("/src/") ? `src/${p.split("/src/")[1].split("/").slice(0, 2).join("/")}` : "(runtime)";
    totals[key] = (totals[key] ?? 0) + part.compressed_size;
  }
  return Object.fromEntries(Object.entries(totals).sort((a, b) => b[1] - a[1]));
}

const args = process.argv.slice(2);
if (args[0] === "--modules") {
  for (const [k, v] of Object.entries(modules()).slice(0, Number(args[1] ?? 25))) console.log(`${kb(v).padStart(7)}k  ${k}`);
} else if (args[0] === "--diff") {
  const [a, b] = args.slice(1).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
  console.log("route            JS Δ        CSS Δ     fonts Δ");
  for (const r of Object.keys(b)) {
    const d = (k) => {
      const delta = b[r][k] - (a[r]?.[k] ?? 0);
      return `${delta > 0 ? "+" : ""}${kb(delta)}k`.padStart(9);
    };
    console.log(`${r.padEnd(16)} ${d("js")}  ${d("css")}  ${d("fonts")}`);
  }
} else {
  const rows = report();
  print(rows);
  const out = args[args.indexOf("--json") + 1];
  if (args.includes("--json") && out) fs.writeFileSync(out, JSON.stringify(rows, null, 2));
}

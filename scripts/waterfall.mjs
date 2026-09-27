#!/usr/bin/env node
/**
 * Network waterfall — renders a Lighthouse JSON report's request log as an SVG.
 *
 *   node scripts/waterfall.mjs report.json out.svg ["Title"]
 *
 * One row per request (first 40 by start time), bars coloured by resource
 * type, with the observed FCP / LCP marked. Times are the unthrottled trace;
 * Lighthouse's simulated (Lantern) metrics are printed in the header.
 */
import fs from "node:fs";

const [input, output, title = "Network waterfall"] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/waterfall.mjs report.json out.svg [title]");
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(input, "utf8"));
const metrics = report.audits.metrics.details.items[0];
const requests = report.audits["network-requests"].details.items
  .filter((r) => !r.url.startsWith("data:"))
  .sort((a, b) => a.networkRequestTime - b.networkRequestTime)
  .slice(0, 40);

const COLORS = {
  Document: "#17120e", Stylesheet: "#6d645b", Script: "#a86a3c", Font: "#3c2415",
  Image: "#b67a4b", Media: "#905b33", Fetch: "#8f867e", Other: "#c9bfb3",
};
const W = 1200, LEFT = 360, ROW = 18, TOP = 96;
const end = Math.max(metrics.observedLargestContentfulPaint + 200, ...requests.map((r) => r.networkEndTime));
const x = (t) => LEFT + ((W - LEFT - 20) * t) / end;
const H = TOP + requests.length * ROW + 40;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const kb = (n) => (n / 1024).toFixed(1) + " KB";

const rows = requests.map((r, i) => {
  const y = TOP + i * ROW;
  const name = r.url.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*$/, "").slice(-48) || "/";
  const w = Math.max(2, x(r.networkEndTime) - x(r.networkRequestTime));
  return `<text x="12" y="${y + 12}" class="t">${esc(name)}</text>
<text x="${LEFT - 8}" y="${y + 12}" class="t r">${kb(r.transferSize)}</text>
<rect x="${x(r.networkRequestTime).toFixed(1)}" y="${y + 3}" width="${w.toFixed(1)}" height="${ROW - 6}" rx="2" fill="${COLORS[r.resourceType] ?? COLORS.Other}"/>`;
});
const marker = (t, label, color, dy = 0) =>
  `<line x1="${x(t)}" x2="${x(t)}" y1="${TOP - 8}" y2="${H - 30}" stroke="${color}" stroke-dasharray="4 3"/><text x="${x(t) + 4}" y="${TOP - 12 - dy}" class="t" fill="${color}">${label} ${Math.round(t)}ms</text>`;
const legend = Object.entries(COLORS).map(([k, c], i) => `<rect x="${12 + i * 118}" y="${H - 20}" width="10" height="10" fill="${c}"/><text x="${26 + i * 118}" y="${H - 11}" class="t">${k}</text>`);
const perf = Math.round(report.categories.performance.score * 100);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="ui-monospace, Menlo, monospace">
<style>.t{font-size:11px;fill:#3c2415}.r{text-anchor:end}.h{font:600 15px Georgia,serif;fill:#17120e}</style>
<rect width="100%" height="100%" fill="#f8f4ec"/>
<text x="12" y="26" class="h">${esc(title)}</text>
<text x="12" y="46" class="t">Performance ${perf} · FCP ${report.audits["first-contentful-paint"].displayValue} · LCP ${report.audits["largest-contentful-paint"].displayValue} · TBT ${report.audits["total-blocking-time"].displayValue} (simulated, Moto G Power / slow 4G) · ${requests.length} requests shown</text>
${marker(metrics.observedFirstContentfulPaint, "FCP", "#2f6f4f")}
${marker(metrics.observedLargestContentfulPaint, "LCP", "#a8322d", 14)}
${rows.join("\n")}
${legend.join("\n")}
</svg>`;
fs.writeFileSync(output, svg);
console.log(`wrote ${output} (${requests.length} requests)`);

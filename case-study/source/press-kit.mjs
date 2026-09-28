/**
 * Logo lockups for the press kit — the ring (a cup seen from above) and the
 * NOIR CAFÉ wordmark in Cormorant Garamond, embedded so every SVG renders
 * the same everywhere.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./common.mjs";

const font = fs.readFileSync(path.join(ROOT, "src/fonts/cormorant-garamond-latin-wght400-500.woff2")).toString("base64");
const STYLE = `<style>@font-face{font-family:"NoirCormorant";src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:400 500}text{font-family:NoirCormorant,"Cormorant Garamond",Georgia,serif;font-weight:500}</style>`;
const INK = { light: "#17120e", dark: "#f8f4ec" };

const mark = (x, y, r, color) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${color}" stroke-width="${(r * 0.11).toFixed(2)}"/>`;

const horizontal = (tone) => {
  const c = INK[tone];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="160" viewBox="0 0 720 160">${STYLE}
${mark(80, 80, 44, c)}<text x="152" y="104" font-size="72" letter-spacing="3" fill="${c}">NOIR CAFÉ</text></svg>`;
};
const stacked = (tone) => {
  const c = INK[tone];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="420" viewBox="0 0 480 420">${STYLE}
${mark(240, 130, 78, c)}<text x="240" y="300" text-anchor="middle" font-size="68" letter-spacing="4" fill="${c}">NOIR CAFÉ</text>
<text x="240" y="352" text-anchor="middle" font-size="22" letter-spacing="7" fill="${tone === "light" ? "#905b33" : "#b67a4b"}">SPECIALTY COFFEE · NEW YORK</text></svg>`;
};
const markOnly = (tone) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">${mark(128, 128, 96, INK[tone])}</svg>`;

export const logos = [
  { file: "noir-horizontal-espresso", svg: horizontal("light"), bg: "#f8f4ec" },
  { file: "noir-horizontal-beige", svg: horizontal("dark"), bg: "#17120e" },
  { file: "noir-stacked-espresso", svg: stacked("light"), bg: "#f8f4ec" },
  { file: "noir-stacked-beige", svg: stacked("dark"), bg: "#17120e" },
  { file: "noir-mark-espresso", svg: markOnly("light"), bg: "#f8f4ec" },
  { file: "noir-mark-beige", svg: markOnly("dark"), bg: "#17120e" },
];

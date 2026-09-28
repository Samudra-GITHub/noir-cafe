#!/usr/bin/env node
/**
 * Builds src/app/favicon.ico (16, 32 and 48 px) from src/app/icon.svg, for
 * browsers and tools that still ask for /favicon.ico. Modern browsers use the
 * SVG; iOS uses apple-icon.png.
 *
 *   node scripts/generate-favicon.mjs
 *
 * ICO entries are stored as PNG (supported by every browser since IE Vista).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const svg = fs.readFileSync(path.join(ROOT, "src/app/icon.svg"));
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 72 * (s / 32) * 4 }).resize(s, s).png().toBuffer()));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);

let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); // width
  e.writeUInt8(s, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(pngs[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});

const out = path.join(ROOT, "src/app/favicon.ico");
fs.writeFileSync(out, Buffer.concat([header, ...entries, ...pngs]));
console.log(`favicon.ico · ${sizes.join(", ")} px · ${fs.statSync(out).size} bytes`);

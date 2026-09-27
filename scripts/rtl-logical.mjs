#!/usr/bin/env node
/**
 * RTL-safe utilities — rewrites physical Tailwind classes to logical ones in
 * the given files (or reports them with --check).
 *
 *   ml/mr → ms/me · pl/pr → ps/pe · text-left/right → text-start/end
 *   rounded-l/r/tl/tr/bl/br → rounded-s/e/ss/se/es/ee · border-l/r → border-s/e
 *   left-N / right-N → inset-s-N / inset-e-N   (skipped when the class list uses
 *                                     translate-x, which has no logical form)
 *
 * In a left-to-right document every logical utility resolves exactly as its
 * physical twin, so this never changes the current layout; in a right-to-left
 * one it mirrors it.
 *
 *   node scripts/rtl-logical.mjs src            rewrite
 *   node scripts/rtl-logical.mjs src --check    list what remains (exit 1 if any)
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const check = args.includes("--check");
const roots = args.filter((a) => !a.startsWith("--"));

const walk = (p) =>
  fs.statSync(p).isDirectory()
    ? fs.readdirSync(p).flatMap((d) => walk(path.join(p, d)))
    : /\.tsx?$/.test(p) && !p.includes(`${path.sep}i18n${path.sep}`)
      ? [p]
      : [];

const B = `(^|[\\s"'\`:!(])`; // start of a class token (after a variant colon too)
const RULES = [
  [new RegExp(`${B}(-?)(scroll-)?m([lr])-`, "g"), (_, pre, neg, scroll, side) => `${pre}${neg}${scroll ?? ""}m${side === "l" ? "s" : "e"}-`],
  [new RegExp(`${B}(scroll-)?p([lr])-`, "g"), (_, pre, scroll, side) => `${pre}${scroll ?? ""}p${side === "l" ? "s" : "e"}-`],
  [new RegExp(`${B}text-(left|right)(?=[\\s"'\`]|$)`, "g"), (_, pre, side) => `${pre}text-${side === "left" ? "start" : "end"}`],
  [new RegExp(`${B}rounded-(tl|tr|bl|br)(?=-|[\\s"'\`]|$)`, "g"), (_, pre, c) => `${pre}rounded-${{ tl: "ss", tr: "se", bl: "es", br: "ee" }[c]}`],
  [new RegExp(`${B}rounded-(l|r)(?=-|[\\s"'\`]|$)`, "g"), (_, pre, side) => `${pre}rounded-${side === "l" ? "s" : "e"}`],
  [new RegExp(`${B}border-(l|r)(?=-|[\\s"'\`]|$)`, "g"), (_, pre, side) => `${pre}border-${side === "l" ? "s" : "e"}`],
];
const INSET = new RegExp(`${B}(-?)(left|right)-(?=[\\w[\\d./])`, "g");

let total = 0;
const report = [];
for (const file of roots.flatMap(walk)) {
  const src = fs.readFileSync(file, "utf8");
  // Work string literal by string literal so the translate-x guard is per class list.
  const out = src.replace(/(["'`])((?:(?!\1)[^\\\n]|\\.)*)\1/g, (lit, q, body) => {
    let next = body;
    for (const [re, fn] of RULES) next = next.replace(re, fn);
    if (!/(^|[\s:])-?translate-x/.test(next)) next = next.replace(INSET, (_, pre, neg, side) => `${pre}${neg}inset-${side === "left" ? "s" : "e"}-`);
    return q + next + q;
  });
  if (out !== src) {
    const changes = out.split("\n").filter((l, i) => l !== src.split("\n")[i]).length;
    total += changes;
    report.push(`${path.relative(process.cwd(), file)}: ${changes} line(s)`);
    if (!check) fs.writeFileSync(file, out);
  }
}
console.log(report.join("\n") || "no physical utilities");
console.log(`${check ? "would change" : "changed"} ${total} line(s)`);
if (check && total) process.exit(1);

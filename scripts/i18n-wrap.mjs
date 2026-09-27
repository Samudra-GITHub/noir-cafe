#!/usr/bin/env node
/**
 * i18n codemod — wraps a component's English copy in `tr()`.
 *
 *   node scripts/i18n-wrap.mjs client src/components/x.tsx [...]
 *   node scripts/i18n-wrap.mjs server src/components/y.tsx [...]
 *
 * JSX text (with JSX's own whitespace rules, so English renders identically)
 * and string values of copy-bearing props become `{tr("…")}`. Each component
 * that now calls `tr` gets `const { tr } = useI18n();` (client) or
 * `const tr = await getTranslator();` (server — the component becomes async).
 * Prints the extracted strings as JSON for the translation tables.
 */
import fs from "node:fs";
import ts from "typescript";

const [mode, ...files] = process.argv.slice(2);
if (!["client", "server"].includes(mode) || !files.length) {
  console.error("usage: i18n-wrap.mjs client|server <files…>");
  process.exit(1);
}

const PROPS = new Set(["eyebrow", "title", "lead", "alt", "aria-label", "label", "description", "placeholder", "caption", "subtitle", "detail", "note", "hint", "aria-description", "aria-roledescription"]);
const hasWords = (s) => /[A-Za-z]{2,}/.test(s);

/** JSX whitespace semantics (as Babel's cleanJSXElementLiteralChild). */
function cleanJsxText(raw) {
  const lines = raw.split(/\r\n|\n|\r/);
  let lastNonEmpty = 0;
  lines.forEach((l, i) => { if (/[^ \t]/.test(l)) lastNonEmpty = i; });
  let out = "";
  lines.forEach((line, i) => {
    const isFirst = i === 0, isLast = i === lines.length - 1, isLastNonEmpty = i === lastNonEmpty;
    let t = line.replace(/\t/g, " ");
    if (!isFirst) t = t.replace(/^[ ]+/, "");
    if (!isLast) t = t.replace(/[ ]+$/, "");
    if (t) {
      if (!isLastNonEmpty) t += " ";
      out += t;
    }
  });
  return out;
}

/** JSX text may contain HTML entities; a JS string does not decode them. */
const ENTITIES = { "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…", "&amp;": "&", "&nbsp;": " ", "&apos;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" };
const decode = (s) => s.replace(/&[a-z]+;/g, (e) => ENTITIES[e] ?? e).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const q = (s) => JSON.stringify(s);
const extracted = new Set();

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = []; // { start, end, text }
  const components = new Map(); // node -> true

  const componentOf = (node) => {
    for (let n = node.parent; n; n = n.parent) {
      if (ts.isFunctionDeclaration(n) && n.name && /^[A-Z]/.test(n.name.text)) return n;
      if ((ts.isArrowFunction(n) || ts.isFunctionExpression(n)) && ts.isVariableDeclaration(n.parent) && /^[A-Z]/.test(n.parent.name.getText())) return n;
    }
    return null;
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const cleaned = decode(cleanJsxText(node.getFullText()));
      if (cleaned && hasWords(cleaned)) {
        const core = cleaned.trim();
        const lead = cleaned.slice(0, cleaned.length - cleaned.trimStart().length);
        const trail = cleaned.slice(cleaned.trimEnd().length);
        const comp = componentOf(node);
        if (comp) {
          components.set(comp, true);
          extracted.add(core);
          edits.push({ start: node.getFullStart(), end: node.getEnd(), text: `${lead ? `{${q(lead)}}` : ""}{tr(${q(core)})}${trail ? `{${q(trail)}}` : ""}` });
        }
      }
    } else if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const name = node.name.getText();
      const value = decode(node.initializer.text);
      if (PROPS.has(name) && hasWords(value)) {
        const comp = componentOf(node);
        if (comp) {
          components.set(comp, true);
          extracted.add(value);
          edits.push({ start: node.initializer.getStart(), end: node.initializer.getEnd(), text: `{tr(${q(value)})}` });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length) {
    console.error(`(nothing to wrap) ${file}`);
    continue;
  }

  // Accessor at the top of each component body.
  for (const comp of components.keys()) {
    const body = comp.body;
    if (!body || !ts.isBlock(body)) {
      console.error(`! ${file}: component with expression body — add tr manually`);
      continue;
    }
    if (body.getText().includes("const { tr }") || body.getText().includes("const tr =")) continue;
    const at = body.getStart() + 1;
    edits.push({ start: at, end: at, text: mode === "client" ? "\n  const { tr } = useI18n();" : "\n  const tr = await getTranslator();" });
    if (mode === "server") {
      const mods = ts.getModifiers?.(comp) ?? comp.modifiers ?? [];
      if (!mods.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        const kw = ts.isFunctionDeclaration(comp) ? comp.getChildren().find((c) => c.kind === ts.SyntaxKind.FunctionKeyword) : null;
        const pos = kw ? kw.getStart() : comp.getStart();
        edits.push({ start: pos, end: pos, text: "async " });
      }
    }
  }

  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = src;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);

  const importLine = mode === "client" ? 'import { useI18n } from "@/i18n/client";' : 'import { getTranslator } from "@/i18n/server";';
  if (!out.includes(importLine)) {
    const imports = [...out.matchAll(/^import [^;]+;$/gm)];
    const last = imports.at(-1);
    const pos = last ? last.index + last[0].length : 0;
    out = out.slice(0, pos) + `\n${importLine}` + out.slice(pos);
  }
  fs.writeFileSync(file, out);
  console.error(`wrapped ${file}`);
}
console.log(JSON.stringify([...extracted], null, 2));

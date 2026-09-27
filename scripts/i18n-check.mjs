#!/usr/bin/env node
/**
 * i18n coverage — every English source string must have a Japanese, French and
 * Italian translation.
 *
 * Sources: `tr("…")` literals across src/, and the copy fields of src/data
 * (titles, descriptions, notes, alt text…), which components pass through
 * `tr()` as they render. Tables: src/i18n/messages/tables/*.ts.
 *
 *   node scripts/i18n-check.mjs            report gaps (exit 1 if any)
 *   node scripts/i18n-check.mjs --json     missing strings as JSON
 *   node scripts/i18n-check.mjs --unused   also list table entries nothing uses
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.(tsx?|mts)$/.test(d.name) ? [p] : [];
  });
const parse = (file) => ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

const sources = new Map(); // english -> first location
const add = (text, where) => {
  if (!/[A-Za-z]{2,}/.test(text)) return;
  if (/^[\d.,\s]+(ml|g|µm|°C|bar)$/.test(text)) return; // measurements read the same everywhere
  if (!sources.has(text)) sources.set(text, where);
};

// 1. tr("…") literals.
for (const file of walk(path.join(ROOT, "src"))) {
  if (file.includes(`${path.sep}i18n${path.sep}messages`)) continue;
  const sf = parse(file);
  // The literal(s) a tr() argument can be: "x", or either branch of cond ? "a" : "b".
  const literals = (e) =>
    ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)
      ? [e.text]
      : ts.isConditionalExpression(e)
        ? [...literals(e.whenTrue), ...literals(e.whenFalse)]
        : ts.isParenthesizedExpression(e)
          ? literals(e.expression)
          : [];
  const visit = (n) => {
    if (ts.isCallExpression(n) && n.expression.getText() === "tr" && n.arguments[0]) {
      const ctx = n.arguments[2] && ts.isStringLiteral(n.arguments[2]) ? `${n.arguments[2].text}|` : "";
      for (const text of literals(n.arguments[0])) add(ctx + text, path.relative(ROOT, file));
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// 2. Copy fields in src/data.
const COPY = /^(title|text|description|label|detail|note|notes|caption|eyebrow|lead|meta|step|imageAlt|alt|origin|flavor|body|quote|summary|hint|subtitle|heading|tagline|roast|details|spec|method|tip|tips|short|cue|name|neighborhood|hours|kind|status|question|answer|code|roastNote|water|options|STORY_QUOTE|STORY_COLUMNS)$/;
const SKIP_NAME_IN = /data[\\/](menu|drinks|locations)\.ts$/; // drink and café names stay as they are
for (const file of walk(path.join(ROOT, "src", "data"))) {
  const sf = parse(file);
  const rel = path.relative(ROOT, file);
  const visit = (n, key) => {
    if (ts.isPropertyAssignment(n)) {
      const k = n.name.getText().replace(/["']/g, "");
      visit(n.initializer, k);
      return;
    }
    if (ts.isVariableDeclaration(n) && n.initializer) {
      visit(n.initializer, n.name.getText());
      return;
    }
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && key && COPY.test(key)) {
      if (!(key === "name" && SKIP_NAME_IN.test(file))) add(n.text, rel);
      return;
    }
    ts.forEachChild(n, (c) => visit(c, ts.isArrayLiteralExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression?.(n) || ts.isParenthesizedExpression(n) ? key : ts.isObjectLiteralExpression(n) ? undefined : key));
  };
  visit(sf, undefined);
}

// 3. Tables.
const tableDir = path.join(ROOT, "src", "i18n", "messages", "tables");
const tables = new Map(); // english -> {ja,fr,it}
for (const file of fs.existsSync(tableDir) ? walk(tableDir) : []) {
  const sf = parse(file);
  const visit = (n) => {
    if (ts.isPropertyAssignment(n) && ts.isObjectLiteralExpression(n.initializer)) {
      const props = Object.fromEntries(
        n.initializer.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(), ts.isStringLiteral(p.initializer) || ts.isNoSubstitutionTemplateLiteral(p.initializer) ? p.initializer.text : ""]),
      );
      if ("ja" in props && "fr" in props && "it" in props) {
        const key = ts.isStringLiteral(n.name) ? n.name.text : n.name.getText();
        if (tables.has(key)) console.error(`duplicate entry: ${JSON.stringify(key)} (${path.relative(ROOT, file)})`);
        tables.set(key, props);
        return;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

const missing = [...sources.keys()].filter((s) => !tables.has(s) || ["ja", "fr", "it"].some((l) => !tables.get(s)[l]));
if (args.includes("--json")) {
  console.log(JSON.stringify(missing.map((s) => ({ en: s, from: sources.get(s) })), null, 2));
  process.exit(0);
}
console.log(`${sources.size} source strings · ${tables.size} translated · ${missing.length} missing`);
for (const s of missing.slice(0, 400)) console.log(`  - ${JSON.stringify(s)}  (${sources.get(s)})`);
if (args.includes("--unused")) {
  const unused = [...tables.keys()].filter((k) => !sources.has(k));
  console.log(`\n${unused.length} unused table entries`);
  for (const u of unused) console.log(`  ~ ${JSON.stringify(u)}`);
}
process.exit(missing.length ? 1 : 0);

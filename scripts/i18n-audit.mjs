#!/usr/bin/env node
/**
 * i18n audit — lists copy that still bypasses `tr()` in the given files:
 *  - string / template literals with words, outside tr(), imports, class names,
 *    ids, hrefs and other technical props;
 *  - data fields rendered straight into JSX ({item.description}).
 *
 *   node scripts/i18n-audit.mjs src/components/**\/*.tsx
 */
import fs from "node:fs";
import ts from "typescript";

const TECH_ATTRS = new Set(["className", "id", "href", "src", "type", "role", "key", "name", "rel", "target", "sizes", "variant", "size", "tone", "as", "mode", "fill", "stroke", "d", "viewBox", "strokeLinecap", "strokeLinejoin", "layoutId", "autoComplete", "inputMode", "method", "enterKeyHint", "data-cursor", "data-nav-theme", "data-cursor-scope", "lang", "dir", "gap", "align", "videoClassName", "titleClassName", "eyebrowTone", "accept", "preload", "loading", "decoding", "encType", "pattern"]);
const TECH_CALLS = new Set(["cn", "fetch", "querySelector", "querySelectorAll", "getItem", "setItem", "removeItem", "addEventListener", "removeEventListener", "matchMedia", "feedback", "play", "require", "tr", "setProperty", "getPropertyValue", "startsWith", "endsWith", "includes", "padStart", "split", "join", "replace", "toLocaleString", "Error", "useScroll", "useTransform", "useMotionValueEvent", "console", "postMessage", "createElement", "setAttribute", "getAttribute", "closest", "matches", "JSON"]);
const WORDY = /[A-Za-z]{3,}[^]*\s[^]*[A-Za-z]|^[A-Z][a-z]{2,}/;

const report = [];
for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const hits = [];
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;

  const insideTr = (n) => {
    for (let p = n.parent; p; p = p.parent) {
      if (ts.isCallExpression(p)) {
        const callee = p.expression.getText();
        const last = callee.split(".").pop();
        if (TECH_CALLS.has(last) || TECH_CALLS.has(callee)) return true;
      }
      if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p)) return true;
      if (ts.isJsxAttribute(p) && TECH_ATTRS.has(p.name.getText())) return true;
      if (ts.isTypeNode(p)) return true;
      if (ts.isPropertyAssignment(p) && p.name && ["className", "id", "href", "key", "ease", "type", "icon", "image", "src", "video", "tone", "variant"].includes(p.name.getText()) && p.initializer === n) return true;
      if (ts.isCaseClause(p) || ts.isBinaryExpression(p) && ["===", "!=="].includes(p.operatorToken.getText())) return true;
      if (ts.isElementAccessExpression(p)) return true;
    }
    return false;
  };

  const visit = (n) => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && WORDY.test(n.text) && !insideTr(n)) {
      if (!/^(use client|use server)$/.test(n.text) && !/^[a-z-]+(\s[a-z-:[\]/.()%0-9]+)+$/.test(n.text)) hits.push(`${line(n)}: "${n.text.slice(0, 90)}"`);
    } else if (ts.isTemplateExpression(n) && !insideTr(n) && WORDY.test(n.getText())) {
      hits.push(`${line(n)}: \`${n.getText().slice(1, 90)}\``);
    } else if (ts.isJsxExpression(n) && n.expression && ts.isPropertyAccessExpression(n.expression)) {
      const name = n.expression.name.text;
      if (/^(title|text|description|label|detail|name|note|notes|caption|eyebrow|lead|meta|spec|step|imageAlt|alt|origin|flavor|body|quote|summary|hint|subtitle|heading|message|tagline)$/.test(name)) {
        hits.push(`${line(n)}: {${n.expression.getText()}}`);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (hits.length) report.push(`\n# ${file}\n${hits.join("\n")}`);
}
console.log(report.join("\n") || "clean");

/**
 * Development timeline — read from the git history: every phase commit,
 * from the Figma build to this release.
 */
import { execSync } from "node:child_process";
import { ROOT } from "./common.mjs";

const log = execSync('git log --reverse --format="%h|%ad|%s" --date=format:"%b %d"', { cwd: ROOT, encoding: "utf8" })
  .trim()
  .split("\n")
  .map((l) => {
    const [hash, date, ...rest] = l.split("|");
    return { hash, date, subject: rest.join("|") };
  });

const tag = (s) => {
  const m = /\((m\d+(?:,m\d+)?)\)/i.exec(s) || /(M\d+–M\d+)/.exec(s);
  return m ? m[1].toUpperCase().replace(",", " + ") : null;
};
const title = (s) =>
  s
    .replace(/^[a-z]+(\([^)]*\))?:\s*/i, "")
    .replace(/^☕\s*/, "")
    .replace(/\s+—\s+/g, " — ")
    .replace(/^./, (c) => c.toUpperCase());

/** Phases: the Figma build first, then each tagged milestone, then this release. */
export function phases() {
  const foundation = log.filter((c) => !tag(c.subject) && !/i18n|signature/i.test(c.subject));
  const list = [{ tag: "Phase 1", date: foundation[0]?.date ?? "", title: "Figma to Next.js — seven pages, desktop", hash: foundation.at(-1)?.hash }];
  for (const c of log) {
    const t = tag(c.subject) ?? (/i18n/.test(c.subject) && !/signature/i.test(c.subject) ? "M23" : null);
    if (t) list.push({ tag: t, date: c.date, title: title(c.subject).replace(/^M1–M8\s*/, ""), hash: c.hash });
  }
  list.push({ tag: "M24", date: "", title: "Sams Studio case study & social package", hash: "", upcoming: true });
  list.push({ tag: "V25", date: "", title: "Signature release — v1.0.0", hash: "", upcoming: true });
  return list;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function timelineSvg() {
  const ph = phases();
  const W = 2400;
  const rowH = 96;
  const H = 260 + Math.ceil(ph.length / 2) * rowH + 120;
  const colX = [120, 1260];
  const items = ph
    .map((p, i) => {
      const col = i < Math.ceil(ph.length / 2) ? 0 : 1;
      const row = col === 0 ? i : i - Math.ceil(ph.length / 2);
      const x = colX[col];
      const y = 260 + row * rowH;
      return `<g>
        <circle cx="${x}" cy="${y}" r="${p.upcoming ? 10 : 12}" fill="${p.upcoming ? "none" : "#a86a3c"}" stroke="#a86a3c" stroke-width="3"/>
        <text x="${x + 36}" y="${y - 6}" font-family="Plex, 'IBM Plex Mono', monospace" font-size="20" letter-spacing="3" fill="#b67a4b">${esc(p.tag)}${p.date ? ` · ${esc(p.date.toUpperCase())}` : " · THIS RELEASE"}</text>
        <text x="${x + 36}" y="${y + 30}" font-family="Cormorant, 'Cormorant Garamond', Georgia, serif" font-size="38" fill="#f8f4ec">${esc(p.title.length > 58 ? p.title.slice(0, 57) + "…" : p.title)}</text>
        ${p.hash ? `<text x="${x + 1000}" y="${y - 6}" text-anchor="end" font-family="Plex, monospace" font-size="16" fill="#8f867e">${esc(p.hash)}</text>` : ""}
      </g>`;
    })
    .join("");
  const rows = Math.ceil(ph.length / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#17120e"/>
  <radialGradient id="warm" cx="15%" cy="0%" r="70%"><stop offset="0" stop-color="#a86a3c" stop-opacity=".18"/><stop offset="1" stop-color="#a86a3c" stop-opacity="0"/></radialGradient>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  <text x="120" y="100" font-family="Plex, monospace" font-size="20" letter-spacing="4" fill="#b67a4b">NOIR CAFÉ · DEVELOPMENT TIMELINE</text>
  <text x="120" y="170" font-family="Cormorant, Georgia, serif" font-size="72" fill="#f8f4ec">From one Figma file to an installable, four-language café.</text>
  <line x1="${colX[0]}" x2="${colX[0]}" y1="260" y2="${260 + (rows - 1) * rowH}" stroke="#35302b" stroke-width="3"/>
  <line x1="${colX[1]}" x2="${colX[1]}" y1="260" y2="${260 + (ph.length - rows - 1) * rowH}" stroke="#35302b" stroke-width="3"/>
  ${items}
  <text x="120" y="${H - 50}" font-family="Plex, monospace" font-size="16" letter-spacing="3" fill="#8f867e">SOURCE · GIT HISTORY OF THE REPOSITORY · ${log.length} COMMITS</text>
  <text x="${W - 120}" y="${H - 50}" text-anchor="end" font-family="Plex, monospace" font-size="16" letter-spacing="3" fill="#8f867e">SAMS STUDIO · @SAMSSTUDIO.DESIGN</text>
</svg>`;
}

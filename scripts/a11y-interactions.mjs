// Accessibility interactions (focus management, reflow, text spacing, form errors, reduced motion)
// — against a running production server: node scripts/a11y-interactions.mjs
const BASE = process.env.BASE ?? "http://localhost:3100";
const ROUTES = ["/", "/menu", "/story", "/brewing-lab", "/brewing-lab/studio", "/cup", "/reservation", "/locations", "/shop", "/concierge", "/order", "/offline"];
const results = [];
const check = (n, ok, x = "") => results.push(`${ok ? "PASS" : "FAIL"}  ${n}${x ? "  — " + x : ""}`);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const PHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--disable-gpu"] });
async function page(vp, reduce = false) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport(vp);
  if (reduce) await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  return p;
}

// 1. Phone menu sheet — keyboard open, trap, Escape, focus return.
{
  const p = await page(PHONE);
  await p.goto(BASE + "/", { waitUntil: "networkidle2" });
  await p.focus("[aria-controls=site-menu]");
  await p.keyboard.press("Enter");
  await wait(700);
  const st = await p.evaluate(() => ({ expanded: document.querySelector("[aria-controls=site-menu]").getAttribute("aria-expanded"), inside: !!document.activeElement.closest("#site-menu") }));
  check("menu sheet: opens from keyboard, aria-expanded, focus moves in", st.expanded === "true" && st.inside, JSON.stringify(st));
  let escaped = 0;
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Tab");
    if (!(await p.evaluate(() => !!document.activeElement.closest("#site-menu") || document.activeElement.matches("[aria-controls=site-menu]")))) escaped++;
  }
  await p.keyboard.down("Shift");
  for (let i = 0; i < 10; i++) {
    await p.keyboard.press("Tab");
    if (!(await p.evaluate(() => !!document.activeElement.closest("#site-menu") || document.activeElement.matches("[aria-controls=site-menu]")))) escaped++;
  }
  await p.keyboard.up("Shift");
  check("menu sheet: Tab / Shift+Tab stay inside (50 presses)", escaped === 0, `${escaped} escapes`);
  await p.keyboard.press("Escape");
  await wait(600);
  const after = await p.evaluate(() => ({ expanded: document.querySelector("[aria-controls=site-menu]").getAttribute("aria-expanded"), onToggle: document.activeElement.matches("[aria-controls=site-menu]") }));
  check("menu sheet: Escape closes, focus returns to the toggle", after.expanded === "false" && after.onToggle, JSON.stringify(after));
  await p.browserContext().close();
}

// 2. Modal dialogs (order customise, menu drink sheet, shop) — find a trigger, verify the contract.
for (const [route, vp] of [["/order", { width: 1440, height: 900 }], ["/menu", PHONE], ["/shop", { width: 1440, height: 900 }], ["/order", PHONE]]) {
  const p = await page(vp);
  await p.goto(BASE + route, { waitUntil: "networkidle2" });
  if (route === "/menu") { await p.evaluate(() => document.querySelector("main button[aria-expanded=false][aria-controls]")?.click()); await wait(700); }
  const n = await p.evaluate(() => { const bs = [...document.querySelectorAll("main [aria-haspopup=dialog]"), ...document.querySelectorAll("main button:not([aria-haspopup])")].filter((x) => x.getClientRects().length); bs.forEach((x, i) => (x.dataset.cand = i)); return bs.length; });
  let found = null;
  for (let i = 0; i < Math.min(n, 40) && found === null; i++) {
    const ok = await p.evaluate((i) => { const x = document.querySelector(`[data-cand="${i}"]`); if (!x || !x.getClientRects().length) return false; x.scrollIntoView({ block: "center" }); x.focus(); return document.activeElement === x; }, i);
    if (!ok) continue;
    await p.keyboard.press("Enter");
    await wait(700);
    const st = await p.evaluate((i) => ({ dlg: !!document.querySelector("[role=dialog][aria-modal=true]"), cand: document.querySelector(`[data-cand="${i}"]`)?.textContent.trim().slice(0, 20), active: (document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent || "").trim().slice(0, 20) }), i);
    if (st.dlg) found = i;
  }
  if (found === null) { check(`${route} ${vp.width}: modal dialog present`, false, "no trigger opened a dialog"); await p.browserContext().close(); continue; }
  const trigger = await p.evaluate((i) => document.querySelector(`[data-cand="${i}"]`).textContent.trim().slice(0, 30) || document.querySelector(`[data-cand="${i}"]`).getAttribute("aria-label"), found);
  const d = await p.evaluate(() => { const dl = document.querySelector("[role=dialog][aria-modal=true]"); const lb = dl.getAttribute("aria-labelledby"); return { named: !!(dl.getAttribute("aria-label") || (lb && document.getElementById(lb)?.textContent.trim())), inside: dl.contains(document.activeElement) }; });
  check(`${route} ${vp.width}: dialog "${trigger}" is named and takes focus`, d.named && d.inside, JSON.stringify(d));
  let out = 0;
  for (let i = 0; i < 40; i++) { await p.keyboard.press(i % 5 === 4 ? "Shift+Tab" : "Tab").catch(() => {}); if (!(await p.evaluate(() => !!document.activeElement.closest("[role=dialog]")))) out++; }
  check(`${route} ${vp.width}: focus trapped in dialog (40 presses)`, out === 0, `${out} escapes`);
  await p.keyboard.press("Escape");
  await wait(700);
  const back = await p.evaluate((i) => ({ closed: !document.querySelector("[role=dialog][aria-modal=true]"), returned: document.activeElement === document.querySelector(`[data-cand="${i}"]`) }), found);
  check(`${route} ${vp.width}: Escape closes, focus returns to trigger`, back.closed && back.returned, JSON.stringify(back));
  await p.browserContext().close();
}

// 3. Reflow (1.4.10) at 320 CSS px and text spacing (1.4.12) — no horizontal scrolling, nothing clipped off-screen.
{
  const p = await page({ width: 320, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const bad = [], spacing = [];
  for (const r of ROUTES) {
    await p.goto(BASE + r, { waitUntil: r === "/cup" || r === "/brewing-lab/studio" ? "load" : "networkidle2" });
    await wait(400);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > 320) bad.push(`${r}:${w}`);
    await p.addStyleTag({ content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }" });
    await wait(300);
    const w2 = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w2 > 320) spacing.push(`${r}:${w2}`);
  }
  check("reflow: every page fits 320 CSS px without horizontal scroll", bad.length === 0, bad.join(" "));
  check("text spacing (1.4.12): still no horizontal scroll at 320px", spacing.length === 0, spacing.join(" "));
  await p.browserContext().close();
}

// 4. Forms announce errors: newsletter invalid email.
{
  const p = await page({ width: 1440, height: 900 });
  await p.goto(BASE + "/menu", { waitUntil: "networkidle2" });
  await p.evaluate(() => document.querySelector("footer, main").scrollIntoView());
  const input = await p.$("input[type=email][name=email]");
  await input.scrollIntoView();
  await input.type("not-an-email");
  await p.evaluate(() => { const f = document.querySelector("input[type=email][name=email]").form; f.noValidate = true; f.requestSubmit(); });
  await wait(1200);
  const e = await p.evaluate(() => { const i = document.querySelector("input[type=email][name=email]"); const msg = document.getElementById(i.getAttribute("aria-describedby")); return { invalid: i.getAttribute("aria-invalid"), msg: msg?.textContent.trim(), live: !!msg?.closest("[aria-live],[role=alert],[role=status]") || msg?.getAttribute("aria-live") }; });
  check("newsletter: invalid email → aria-invalid + described, announced message", e.invalid === "true" && !!e.msg && !!e.live, JSON.stringify(e));
  await p.browserContext().close();
}

// 5. Reduced motion: no view-transition choreography, no atmosphere particles.
{
  const p = await page({ width: 1440, height: 900 }, true);
  await p.goto(BASE + "/", { waitUntil: "networkidle2" });
  await wait(1500);
  const a = await p.evaluate(() => ({ particles: document.querySelector("[data-particles]")?.getAttribute("data-particles") ?? "none", canvasVisible: [...document.querySelectorAll("canvas")].filter((c) => c.getClientRects().length && getComputedStyle(c).display !== "none" && +getComputedStyle(c).opacity > 0).length }));
  check("reduced motion: atmosphere particles off", a.particles === "none" || a.particles === "off" || a.particles === "0" || a.canvasVisible === 0, JSON.stringify(a));
  // Navigate by link click and sample running animations mid-transition.
  const menuLink = await p.$("header nav a[href='/menu']");
  await menuLink.click();
  await wait(120);
  const vt = await p.evaluate(() => ({ dataVt: document.documentElement.dataset.vt ?? null, anims: document.getAnimations().filter((x) => String(x.effect?.pseudoElement ?? "").startsWith("::view-transition") && x.playState === "running" && Number(x.effect.getComputedTiming().duration) > 0).length }));
  check("reduced motion: page change without transition choreography", vt.anims === 0, JSON.stringify(vt));
  await p.browserContext().close();
}

await b.close();
console.log(results.join("\n"));
process.exitCode = results.some((r) => r.startsWith("FAIL")) ? 1 : 0;

/**
 * Mockups — the live build on devices, and the identity in print and on
 * objects. Every word and price comes from the site's own data.
 */
import { MENU } from "../../src/data/menu.ts";
import { STORY_COLUMNS, STORY_HERO } from "../../src/data/story.ts";
import { CAFES } from "../../src/data/locations.ts";
import { credit, logo, page, rel, screen } from "./common.mjs";
import { ipad, iphone, macbook } from "./devices.mjs";

const W = 2000;
const H = 1400;
const IMG = {
  crema: rel("public/videos/hero-espresso-poster.webp"),
  latte: rel("public/videos/latte-art-poster.webp"),
  table: rel("public/images/story/hero-long-table.jpg"),
  hands: rel("public/images/story/green-beans-hands.jpg"),
  roaster: rel("public/images/story/first-roaster.jpg"),
  cortado: rel("public/images/home/drink-noir-cortado.jpg"),
  today: rel("public/images/menu/today-at-the-bar.jpg"),
};
const price = (n) => `$${n.toFixed(2)}`;
const caption = (title, sub, dark) => `
  <div style="position:absolute;left:96px;bottom:72px;z-index:30">
    <div class="eyebrow">${sub}</div>
    <div class="serif" style="font-size:44px;margin-top:10px;color:${dark ? "var(--beige)" : "var(--espresso)"}">${title}</div>
  </div>
  <div style="position:absolute;right:96px;bottom:78px;z-index:30">${credit(dark)}</div>`;

const warmLight = `radial-gradient(70% 60% at 30% 20%, rgba(232,168,104,.18), transparent 60%)`;

export const mockups = [
  {
    file: "macbook-pro",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame dark grain" style="background:linear-gradient(160deg,#241a14 0%,#17120e 55%,#0f0c0a 100%)">
  <div class="photo" style="background:${warmLight}"></div>
  <div style="position:absolute;left:50%;top:150px;transform:translateX(-50%)">${macbook(screen("desktop-home"), 1500)}</div>
  ${caption("MacBook Pro · 1440 × 900", "Desktop — the Figma frame, built", true)}
</div>`),
  },
  {
    file: "iphone-16-pro",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame cream grain">
  <div class="photo" style="background:radial-gradient(60% 70% at 50% 40%, rgba(255,252,247,.9), transparent 70%)"></div>
  <div style="position:absolute;left:330px;top:170px">${iphone(screen("phone-menu"), 380, { tilt: -6 })}</div>
  <div style="position:absolute;left:810px;top:110px;z-index:2">${iphone(screen("phone-home"), 400)}</div>
  <div style="position:absolute;left:1300px;top:170px">${iphone(screen("phone-reservation"), 380, { tilt: 6 })}</div>
  ${caption("iPhone 16 Pro · below 768 px", "Mobile — dock, sheets, wallet pass")}
</div>`),
  },
  {
    file: "ipad",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame paper grain">
  <div style="position:absolute;left:380px;top:110px">${ipad(screen("tablet-shop"), 700, { tilt: -3 })}</div>
  <div style="position:absolute;left:1180px;top:300px">${iphone(screen("phone-story"), 360, { tilt: 4 })}</div>
  ${caption("iPad Air · 820 × 1180", "Tablet — the menu sheet takes over below 960 px")}
</div>`),
  },
  {
    file: "coffee-table-magazine",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame grain" style="background:linear-gradient(150deg,#6b4a33 0%,#4a3223 45%,#2c1e15 100%)">
  <div class="photo" style="background:repeating-linear-gradient(95deg, rgba(255,255,255,.035) 0 3px, transparent 3px 22px), radial-gradient(60% 50% at 40% 30%, rgba(255,214,170,.22), transparent 70%)"></div>
  <div style="position:absolute;left:50%;top:48%;transform:translate(-50%,-50%) perspective(2600px) rotateX(38deg) rotateZ(-9deg);width:1500px;height:980px;display:flex;box-shadow:0 60px 110px rgba(0,0,0,.55)">
    <div style="width:750px;height:980px;background:url(${IMG.table}) center/cover;position:relative">
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent 88%,rgba(0,0,0,.28))"></div>
      <div class="serif" style="position:absolute;left:54px;bottom:54px;color:var(--beige);font-size:26px;letter-spacing:.08em">NOIR CAFÉ · NEW YORK</div>
    </div>
    <div style="width:750px;height:980px;background:#faf6ee;padding:80px 70px;position:relative">
      <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.14),transparent 12%)"></div>
      <div class="eyebrow" style="font-size:14px">${STORY_HERO.eyebrow}</div>
      <div class="serif" style="font-size:64px;line-height:.98;margin-top:24px">${STORY_HERO.title.join(" ")}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;margin-top:44px;font-size:15px;line-height:1.7;color:var(--walnut)">
        <div>${STORY_COLUMNS[0].map((p) => `<p style="margin-bottom:16px">${p}</p>`).join("")}</div>
        <div>${STORY_COLUMNS[1].map((p) => `<p style="margin-bottom:16px">${p}</p>`).join("")}</div>
      </div>
      <div class="mono" style="position:absolute;right:70px;bottom:48px;font-size:12px;color:var(--stone)">47</div>
    </div>
  </div>
  ${caption("Coffee-table magazine spread", "Editorial — the story, in print", true)}
</div>`),
  },
  {
    file: "store-poster",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame grain" style="background:linear-gradient(180deg,#e9e1d4 0%,#ddd2c2 100%)">
  <div style="position:absolute;left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg,#8c6a4f,#6d5140)"></div>
  <div style="position:absolute;left:50%;top:90px;transform:translateX(-50%) rotate(-1.2deg);width:760px;height:1040px;background:#15110d;padding:22px;box-shadow:0 50px 90px rgba(23,18,14,.45)">
    <div style="position:relative;width:100%;height:100%;background:var(--espresso);color:var(--beige);overflow:hidden">
      <div class="photo" style="background-image:url(${IMG.crema});background-position:50% 40%;height:640px;bottom:auto"></div>
      <div class="photo" style="height:640px;bottom:auto;background:linear-gradient(180deg,rgba(23,18,14,.2),rgba(23,18,14,.95))"></div>
      <div style="position:absolute;left:52px;top:44px">${logo(26)}</div>
      <div style="position:absolute;left:52px;right:52px;top:470px">
        <div class="eyebrow" style="font-size:14px;color:var(--glow)">Menu · Autumn 2026</div>
        <div class="serif" style="font-size:96px;line-height:.92;margin-top:18px">Made slowly.<br>Served simply.</div>
        <div style="height:1px;background:var(--char);margin:44px 0 28px"></div>
        ${CAFES.map((c) => `<div style="display:flex;justify-content:space-between;font-family:Plex,monospace;font-size:14px;letter-spacing:.14em;text-transform:uppercase;padding:9px 0;color:var(--cream)"><span>${c.cardName}</span><span style="color:var(--taupe)">${c.opens}–${c.closes}</span></div>`).join("")}
      </div>
    </div>
  </div>
  ${caption("Store poster · 70 × 100 cm", "Print — window of Mercer Street")}
</div>`),
  },
  {
    file: "tote-bag",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame cream grain">
  <svg style="position:absolute;left:50%;top:80px;transform:translateX(-50%)" width="900" height="1150" viewBox="0 0 900 1150">
    <defs>
      <linearGradient id="canvas" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#efe6d6"/><stop offset="1" stop-color="#ddd0bb"/></linearGradient>
      <filter id="weave"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" result="n"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .12"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="40" stdDeviation="40" flood-color="#3c2415" flood-opacity=".28"/></filter>
    </defs>
    <path d="M285 330 C285 120 615 120 615 330" fill="none" stroke="#d3c4ad" stroke-width="40" stroke-linecap="round"/>
    <path d="M285 330 C285 120 615 120 615 330" fill="none" stroke="#e7dcc9" stroke-width="28" stroke-linecap="round"/>
    <g filter="url(#soft)"><path d="M110 330 H790 L820 1080 Q820 1100 800 1100 H100 Q80 1100 80 1080 Z" fill="url(#canvas)"/></g>
    <path d="M110 330 H790 L820 1080 Q820 1100 800 1100 H100 Q80 1100 80 1080 Z" fill="#fff" filter="url(#weave)" opacity=".8"/>
    <path d="M110 330 H790" stroke="#cbbca4" stroke-width="3" stroke-dasharray="9 7"/>
    <circle cx="450" cy="620" r="92" fill="none" stroke="#17120e" stroke-width="7"/>
    <text x="450" y="810" text-anchor="middle" font-family="Cormorant" font-size="84" letter-spacing="4" fill="#17120e">NOIR CAFÉ</text>
    <text x="450" y="872" text-anchor="middle" font-family="Plex" font-size="20" letter-spacing="6" fill="#905b33">SPECIALTY COFFEE · NEW YORK</text>
  </svg>
  ${caption("Canvas tote · screen-printed", "Objects — the wordmark and the ring")}
</div>`),
  },
  {
    file: "coffee-cup",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame grain" style="background:linear-gradient(180deg,#f3ece1 0%,#e6dccd 70%,#d9ccb9 100%)">
  <div style="position:absolute;left:0;right:0;top:980px;height:2px;background:rgba(60,36,21,.12)"></div>
  <svg style="position:absolute;left:420px;top:150px" width="640" height="900" viewBox="0 0 640 900">
    <defs>
      <linearGradient id="cup" x1="0" x2="1"><stop offset="0" stop-color="#e9e2d6"/><stop offset=".45" stop-color="#fbf8f2"/><stop offset="1" stop-color="#d7cdbd"/></linearGradient>
      <linearGradient id="sleeve" x1="0" x2="1"><stop offset="0" stop-color="#8a5f3e"/><stop offset=".45" stop-color="#b17e54"/><stop offset="1" stop-color="#7b5436"/></linearGradient>
      <linearGradient id="lid" x1="0" x2="1"><stop offset="0" stop-color="#1c1714"/><stop offset=".5" stop-color="#3a322c"/><stop offset="1" stop-color="#15110e"/></linearGradient>
    </defs>
    <ellipse cx="320" cy="860" rx="210" ry="26" fill="rgba(60,36,21,.22)"/>
    <path d="M110 150 L150 850 Q152 868 172 868 H468 Q488 868 490 850 L530 150 Z" fill="url(#cup)"/>
    <path d="M128 380 L512 380 L494 640 L146 640 Z" fill="url(#sleeve)"/>
    <circle cx="320" cy="480" r="46" fill="none" stroke="#17120e" stroke-width="5"/>
    <text x="320" y="582" text-anchor="middle" font-family="Cormorant" font-size="44" letter-spacing="3" fill="#17120e">NOIR CAFÉ</text>
    <path d="M90 118 Q90 96 112 96 H528 Q550 96 550 118 L556 158 H84 Z" fill="url(#lid)"/>
    <path d="M150 96 Q160 50 200 44 H440 Q480 50 490 96 Z" fill="url(#lid)"/>
    <ellipse cx="400" cy="66" rx="34" ry="8" fill="#0d0b09"/>
  </svg>
  <svg style="position:absolute;left:1120px;top:560px" width="460" height="440" viewBox="0 0 460 440">
    <defs><linearGradient id="ceramic" x1="0" x2="1"><stop offset="0" stop-color="#161210"/><stop offset=".5" stop-color="#3a322d"/><stop offset="1" stop-color="#110e0c"/></linearGradient></defs>
    <ellipse cx="220" cy="400" rx="210" ry="32" fill="rgba(60,36,21,.25)"/>
    <ellipse cx="220" cy="382" rx="200" ry="36" fill="#1e1916"/>
    <path d="M60 140 Q60 360 220 370 Q380 360 380 140 Z" fill="url(#ceramic)"/>
    <path d="M378 190 Q450 200 440 260 Q430 318 368 300" fill="none" stroke="#2a2420" stroke-width="22" stroke-linecap="round"/>
    <ellipse cx="220" cy="140" rx="160" ry="34" fill="#2a1d14"/>
    <ellipse cx="220" cy="142" rx="146" ry="28" fill="#6f4a2d"/>
    <path d="M220 124 C196 124 186 142 200 152 C186 160 200 174 220 170 C240 174 254 160 240 152 C254 142 244 124 220 124 Z" fill="#e8d6bb" opacity=".95"/>
  </svg>
  ${caption("Takeaway cup & house ceramic", "Objects — kraft sleeve, espresso glaze")}
</div>`),
  },
  {
    file: "menu-board",
    w: W,
    h: H,
    html: page(W, H, `
<div class="frame grain" style="background:linear-gradient(180deg,#d9cdbb 0%,#cbbda8 100%)">
  <div style="position:absolute;left:200px;right:200px;top:70px;height:18px;background:linear-gradient(180deg,#c9a46b,#8f6d3b);border-radius:9px;box-shadow:0 10px 20px rgba(0,0,0,.25)"></div>
  <div class="dark" style="position:absolute;left:230px;right:230px;top:110px;border-radius:18px;padding:80px 90px 90px;box-shadow:0 60px 100px rgba(23,18,14,.45)">
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      ${logo(40)}
      <div class="mono" style="font-size:15px;color:var(--glow)">Menu · Autumn 2026</div>
    </div>
    <div style="height:1px;background:var(--char);margin:36px 0 40px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:54px 80px">
      ${MENU.map((c) => `<div>
        <div class="serif" style="font-size:52px;color:var(--beige)">${c.title}</div>
        ${c.items.map((i) => `<div style="margin-top:26px">
          <div style="display:flex;justify-content:space-between;gap:16px;font-size:26px;font-weight:600;color:var(--beige)"><span>${i.name}</span><span class="mono" style="font-weight:400;font-size:22px;color:var(--glow)">${price(i.price)}</span></div>
          <div style="font-size:19px;color:var(--taupe);margin-top:6px">${i.description}</div>
        </div>`).join("")}
      </div>`).join("")}
    </div>
  </div>
  ${caption("Menu board · the bar at Mercer Street", "Signage — prices from the live menu data")}
</div>`),
  },
];

/**
 * Device frames drawn in CSS around real screenshots of the live build:
 * MacBook Pro (16:10 panel), iPhone 16 Pro (Dynamic Island), iPad.
 */

/** MacBook Pro — `width` is the outer lid width in px. */
export const macbook = (src, width = 1100, { top = "top" } = {}) => {
  const bezel = width * 0.018;
  const screenW = width - bezel * 2;
  const screenH = screenW * (900 / 1440);
  return `
<div style="width:${width}px;position:relative">
  <div style="background:#0d0b0a;border-radius:${width * 0.024}px ${width * 0.024}px ${width * 0.01}px ${width * 0.01}px;padding:${bezel}px ${bezel}px ${bezel * 1.35}px;box-shadow:0 0 0 1.5px #3b3733, 0 40px 90px rgba(23,18,14,.38)">
    <div style="position:absolute;left:50%;top:${bezel * 0.25}px;transform:translateX(-50%);width:${width * 0.11}px;height:${bezel * 0.72}px;background:#0d0b0a;border-radius:0 0 ${bezel * 0.5}px ${bezel * 0.5}px;z-index:2"></div>
    <div style="width:${screenW}px;height:${screenH}px;overflow:hidden;border-radius:${width * 0.006}px;background:#17120e">
      <img src="${src}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:${top}">
    </div>
  </div>
  <div style="position:relative;left:-${width * 0.06}px;width:${width * 1.12}px;height:${width * 0.022}px;background:linear-gradient(180deg,#c9c3bb 0%,#a8a198 55%,#7d766e 100%);border-radius:0 0 ${width * 0.03}px ${width * 0.03}px;box-shadow:0 18px 30px rgba(23,18,14,.25)">
    <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:${width * 0.14}px;height:${width * 0.008}px;background:#8a837b;border-radius:0 0 ${width * 0.01}px ${width * 0.01}px"></div>
  </div>
</div>`;
};

/** iPhone 16 Pro — `width` is the outer frame width in px (screen 393 × 852). */
export const iphone = (src, width = 330, { tilt = 0, shadow = true } = {}) => {
  const r = width * 0.165;
  const frame = width * 0.035;
  const inner = width - frame * 2;
  const screenH = inner * (852 / 393);
  return `
<div style="width:${width}px;transform:rotate(${tilt}deg);position:relative">
  <div style="border-radius:${r}px;padding:${frame}px;background:linear-gradient(145deg,#5b5751,#2e2b28 40%,#4a4641);box-shadow:inset 0 0 0 1.5px #77726b${shadow ? ", 0 40px 80px rgba(23,18,14,.42)" : ""}">
    <div style="position:relative;border-radius:${r - frame}px;overflow:hidden;height:${screenH}px;background:#000">
      <img src="${src}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top">
      <div style="position:absolute;left:50%;top:${inner * 0.028}px;transform:translateX(-50%);width:${inner * 0.31}px;height:${inner * 0.09}px;border-radius:999px;background:#000"></div>
    </div>
  </div>
  <div style="position:absolute;right:-${width * 0.012}px;top:${width * 0.62}px;width:${width * 0.014}px;height:${width * 0.26}px;background:#3c3935;border-radius:2px"></div>
  <div style="position:absolute;left:-${width * 0.012}px;top:${width * 0.5}px;width:${width * 0.014}px;height:${width * 0.16}px;background:#3c3935;border-radius:2px"></div>
  <div style="position:absolute;left:-${width * 0.012}px;top:${width * 0.72}px;width:${width * 0.014}px;height:${width * 0.16}px;background:#3c3935;border-radius:2px"></div>
</div>`;
};

/** iPad (portrait, 820 × 1180 screen). */
export const ipad = (src, width = 560, { tilt = 0 } = {}) => {
  const bezel = width * 0.045;
  const inner = width - bezel * 2;
  const screenH = inner * (1180 / 820);
  return `
<div style="width:${width}px;transform:rotate(${tilt}deg)">
  <div style="border-radius:${width * 0.075}px;padding:${bezel}px;background:#1c1a18;box-shadow:inset 0 0 0 2px #4b4742, 0 40px 90px rgba(23,18,14,.38)">
    <div style="border-radius:${width * 0.035}px;overflow:hidden;height:${screenH}px;background:#000">
      <img src="${src}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:top">
    </div>
  </div>
</div>`;
};

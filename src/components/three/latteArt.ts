import * as THREE from "three";
import type { LatteArt } from "./art";

export type { LatteArt };

const MILK = "#f3e7d6";

/**
 * Paints a cup's surface — crema and poured milk — onto a canvas texture.
 * `crema` is the coffee colour (it follows the roast and extraction in the
 * studio). Deterministic: the same inputs draw the same cup.
 */
export function paintLatte(art: LatteArt, crema: THREE.Color, size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const c = canvas.getContext("2d")!;
  const r = size / 2;

  // Crema: lighter centre, deeper rim.
  const base = `#${crema.getHexString()}`;
  const rim = `#${crema.clone().multiplyScalar(0.55).getHexString()}`;
  const g = c.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, `#${crema.clone().lerp(new THREE.Color("#c89060"), 0.35).getHexString()}`);
  g.addColorStop(0.75, base);
  g.addColorStop(1, rim);
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);

  // Fine speckle, seeded.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  c.fillStyle = "rgba(40,22,12,0.18)";
  for (let i = 0; i < 900; i++) c.fillRect(rand() * size, rand() * size, 1.4, 1.4);

  c.filter = "blur(1.2px)";
  c.fillStyle = MILK;
  c.strokeStyle = MILK;
  c.lineCap = "round";
  const s = size / 512;

  const heart = (cx: number, cy: number, w: number) => {
    c.beginPath();
    c.moveTo(cx, cy + w * 0.62);
    c.bezierCurveTo(cx - w * 1.15, cy - w * 0.05, cx - w * 0.55, cy - w * 0.95, cx, cy - w * 0.38);
    c.bezierCurveTo(cx + w * 0.55, cy - w * 0.95, cx + w * 1.15, cy - w * 0.05, cx, cy + w * 0.62);
    c.fill();
  };
  const pullThrough = (fromY: number, toY: number) => {
    c.lineWidth = 7 * s;
    c.beginPath();
    c.moveTo(r, fromY);
    c.lineTo(r, toY);
    c.stroke();
  };

  if (art === "heart") {
    heart(r, r + 10 * s, 150 * s);
    pullThrough(r - 150 * s, r + 120 * s);
  } else if (art === "tulip") {
    [0, 1, 2].forEach((i) => {
      c.save();
      c.globalAlpha = 1;
      heart(r, r + 90 * s - i * 72 * s, (120 - i * 26) * s);
      c.restore();
      if (i < 2) {
        // A thin line of crema separates the stacked layers.
        c.save();
        c.strokeStyle = base;
        c.lineWidth = 5 * s;
        c.beginPath();
        c.arc(r, r + 70 * s - i * 72 * s, (104 - i * 24) * s, Math.PI * 1.1, Math.PI * 1.9);
        c.stroke();
        c.restore();
      }
    });
    pullThrough(r - 160 * s, r + 150 * s);
  } else {
    // Rosetta: crescent leaves, widest at the base, thinning and tightening
    // toward the top, finished with a small heart and pulled through.
    const leaves = 10;
    for (let i = 0; i < leaves; i++) {
      const t = i / (leaves - 1);
      const y = r + 170 * s - t * 300 * s;
      const w = (158 - t * 110) * s;
      const sag = (30 - t * 16) * s;
      c.lineWidth = (17 - t * 8) * s;
      c.beginPath();
      c.moveTo(r - w, y - sag * 0.4);
      c.quadraticCurveTo(r, y + sag, r + w, y - sag * 0.4);
      c.stroke();
    }
    heart(r, r - 150 * s, 40 * s);
    pullThrough(r - 160 * s, r + 190 * s);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

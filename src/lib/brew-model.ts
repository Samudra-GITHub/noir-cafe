import type { BrewMethod } from "@/data/brewing";
import type { RoastLevel } from "@/components/ui/RoastMeter";

/**
 * A small, illustrative brewing model for the Recipe Studio.
 *
 * Each method's published recipe (data/brewing) is treated as balanced —
 * ~20% extraction yield, the middle of the SCA "gold cup" band (18–22%). The
 * studio's sliders move away from that reference, and each change pushes
 * extraction the way it does at the bar: finer grind, hotter water, longer
 * contact, a darker roast and a longer ratio all extract more. The
 * coefficients are rounded rules of thumb, chosen for intuition, not a lab
 * instrument — the UI says so.
 */

export type Recipe = {
  methodId: string;
  dose: number; // g of coffee
  ratio: number; // g of water per g of coffee (espresso: beverage out)
  grind: number; // microns
  temperature: number; // °C
  roast: number; // 0 light … 1 dark
};

export type Band = "under" | "balanced" | "over";

export const ROAST_BY_LEVEL: Record<RoastLevel, number> = { Light: 0.2, Medium: 0.5, Dark: 0.82 };

export function roastLevel(roast: number): RoastLevel {
  return roast < 0.36 ? "Light" : roast < 0.68 ? "Medium" : "Dark";
}

const num = (s: string) => parseFloat(s);

/** The method's own recipe, expressed as studio values. */
export function referenceRecipe(method: BrewMethod): Recipe {
  const dose = num(method.dose);
  return {
    methodId: method.id,
    dose,
    ratio: Math.round((num(method.water) / dose) * 10) / 10,
    grind: method.grindMicrons,
    temperature: method.temperatureC,
    roast: ROAST_BY_LEVEL[method.roast],
  };
}

/** Contact time scales gently with the water poured (bigger brews run longer). */
export function brewSeconds(method: BrewMethod, recipe: Recipe) {
  const ref = referenceRecipe(method);
  const volume = (recipe.dose * recipe.ratio) / (ref.dose * ref.ratio);
  const grind = Math.pow(ref.grind / recipe.grind, -0.35); // finer grinds drain slower (percolation)
  const factor = method.id === "espresso" || method.id === "french-press" || method.id === "aeropress" ? volume ** 0.3 : volume ** 0.6 / grind;
  return Math.round(method.totalSeconds * factor);
}

export function extractionYield(method: BrewMethod, recipe: Recipe) {
  const ref = referenceRecipe(method);
  const seconds = brewSeconds(method, recipe);
  let ey = 20;
  ey += ((ref.grind - recipe.grind) / 100) * (method.id === "espresso" ? 3 : 1.1); // espresso is far more grind-sensitive
  ey += (recipe.temperature - ref.temperature) * 0.35;
  ey += Math.log2(seconds / method.totalSeconds) * 2;
  ey += (recipe.roast - ref.roast) * 2.4; // darker roasts are more soluble
  ey += (recipe.ratio - ref.ratio) * (method.id === "espresso" ? 1.4 : 0.3);
  return Math.min(27, Math.max(12, Math.round(ey * 10) / 10));
}

/** Beverage strength (% total dissolved solids). Filter grounds hold ~2 g water per g. */
export function tds(method: BrewMethod, recipe: Recipe, ey = extractionYield(method, recipe)) {
  const water = recipe.dose * recipe.ratio;
  const beverage = method.id === "espresso" ? water : water - recipe.dose * 2;
  return Math.round(((recipe.dose * ey) / beverage) * 100) / 100;
}

export function band(ey: number): Band {
  return ey < 18 ? "under" : ey > 22 ? "over" : "balanced";
}

export const BAND_COPY: Record<Band, { label: string; taste: string; fix: string }> = {
  under: { label: "Under-extracted", taste: "Sour, thin, a salty finish", fix: "Grind finer, brew hotter or longer" },
  balanced: { label: "Balanced", taste: "Sweet, clear, a lasting finish", fix: "In the gold-cup band — enjoy it" },
  over: { label: "Over-extracted", taste: "Bitter, hollow, drying", fix: "Grind coarser, brew cooler or shorter" },
};

/** Where a grind size sits on the familiar scale. */
export function grindName(microns: number) {
  if (microns < 320) return "Fine · espresso";
  if (microns < 520) return "Medium-fine · AeroPress";
  if (microns < 700) return "Medium · pour-over";
  if (microns < 880) return "Medium-coarse · Chemex";
  return "Coarse · French press";
}

/**
 * Roast profile for the simulator: bean temperature over a ~12-minute roast
 * with the usual landmarks. The chosen roast sets the drop temperature.
 */
export const ROAST_LANDMARKS = [
  { label: "Drying", at: 4.2, temp: 150 },
  { label: "First crack", at: 8.6, temp: 196 },
  { label: "Second crack", at: 11.2, temp: 224 },
] as const;

/** Bean temperature (°C) by minute: charge, turning point, then the landmarks. */
export const ROAST_CURVE: readonly [number, number][] = [
  [0, 200], [1, 92], [4.2, 150], [8.6, 196], [11.2, 224], [13, 234],
];

export function beanTemperature(minutes: number) {
  const pts = ROAST_CURVE;
  if (minutes <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, v1] = pts[i];
    const [t0, v0] = pts[i - 1];
    if (minutes <= t1) return v0 + ((v1 - v0) * (minutes - t0)) / (t1 - t0);
  }
  return pts[pts.length - 1][1];
}

export function roastProfile(roast: number) {
  const drop = Math.round(202 + roast * 26); // °C: light ≈ 205, dark ≈ 223
  let minutes = 1;
  while (beanTemperature(minutes) < drop && minutes < 13) minutes += 0.05;
  const firstCrack = ROAST_LANDMARKS[1].at;
  // Development time ratio: share of the roast after first crack.
  const development = Math.max(0, Math.round(((minutes - firstCrack) / minutes) * 100));
  return { drop, minutes: Math.round(minutes * 10) / 10, development };
}

/** Flavour emphasis (0…1) per wheel category for a roast and extraction. */
export function flavourEmphasis(roast: number, ey: number): Record<string, number> {
  const light = 1 - roast;
  const under = Math.max(0, 18 - ey) / 4;
  const over = Math.max(0, ey - 22) / 4;
  const clamp = (v: number) => Math.min(1, Math.max(0.08, v));
  return {
    fruity: clamp(light * 0.95 + under * 0.3 - over * 0.3),
    floral: clamp(light * 0.85 - over * 0.4),
    sweet: clamp(1 - Math.abs(roast - 0.5) * 1.2 - (under + over) * 0.5),
    nutty: clamp(0.3 + roast * 0.6 - under * 0.2),
    spice: clamp(roast * 0.7),
    roasted: clamp(roast * roast * 1.1 + over * 0.6),
    green: clamp(under * 0.9 + light * 0.2),
    savoury: clamp(under * 0.8 + over * 0.2),
  };
}

// ── Colour ────────────────────────────────────────────────────────────────

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  const k = Math.min(1, Math.max(0, t));
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`;
};

/**
 * Crema colour for a recipe: the roast sets the base (light → dark);
 * under-extraction pales it toward thin tan, over-extraction darkens it
 * toward bitter brown. Shared by the 2D extraction view and the 3D cup.
 */
export function cremaHex(roast: number, ey: number) {
  const base = mix("#b27c48", "#5c3620", roast);
  const under = Math.max(0, 18 - ey) / 5;
  const over = Math.max(0, ey - 22) / 5;
  return mix(mix(base, "#cfa878", under), "#35200f", over);
}

/** Bean colour for a roast (light 0 → dark 1). */
export function beanHex(roast: number) {
  return roast < 0.5 ? mix("#a0703f", "#5e3920", roast * 2) : mix("#5e3920", "#2a1911", (roast - 0.5) * 2);
}

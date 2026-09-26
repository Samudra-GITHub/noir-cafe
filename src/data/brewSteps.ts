import type { BrewStep } from "./types";

/** Five deliberate transformations — shared by the homepage preview and the Brewing Lab. */
export const BREW_STEPS: BrewStep[] = [
  { index: 1, title: "Origin", spec: "Ethiopia · Sidama", description: "Traceable lots, selected in season." },
  { index: 2, title: "Roast", spec: "08:42 · 206°C", description: "Profiled to preserve sweetness." },
  { index: 3, title: "Grind", spec: "620 µm", description: "Dialed fresh for each method." },
  { index: 4, title: "Brew", spec: "93°C · 1:16", description: "Water, temperature, and time." },
  { index: 5, title: "Pour", spec: "240 ml", description: "A quiet final gesture." },
];

import type { RoastLevel } from "@/components/ui/RoastMeter";

/** A pour or phase inside a brew, anchored to seconds from the start. */
export type BrewStage = { at: number; label: string; detail: string };

export type BrewMethod = {
  id: string;
  method: string;
  code: string; // "Filter 01"
  coffee: string[]; // title lines on the recipe card
  dose: string;
  water: string;
  temperatureC: number;
  totalSeconds: number;
  grindMicrons: number;
  roast: RoastLevel;
  roastNote: string;
  stages: BrewStage[];
};

export const BREW_METHODS: BrewMethod[] = [
  {
    id: "v60",
    method: "Pour-over · V60",
    code: "Filter 01",
    coffee: ["Sidama", "Daylight"],
    dose: "15.0 g",
    water: "240 ml",
    temperatureC: 93,
    totalSeconds: 190,
    grindMicrons: 620,
    roast: "Light",
    roastNote: "Light roasts keep the florals and stone fruit of washed Ethiopian lots.",
    stages: [
      { at: 0, label: "Bloom", detail: "45 ml, swirl gently" },
      { at: 45, label: "First pour", detail: "Spiral to 140 ml" },
      { at: 80, label: "Second pour", detail: "Centre pour to 240 ml" },
      { at: 130, label: "Drawdown", detail: "Let the bed settle flat" },
      { at: 190, label: "Serve", detail: "Swirl, then pour" },
    ],
  },
  {
    id: "chemex",
    method: "Chemex",
    code: "Filter 02",
    coffee: ["Huila", "Reserve"],
    dose: "30.0 g",
    water: "480 ml",
    temperatureC: 94,
    totalSeconds: 270,
    grindMicrons: 780,
    roast: "Light",
    roastNote: "The thick filter favours light-to-medium roasts with bright acidity.",
    stages: [
      { at: 0, label: "Bloom", detail: "80 ml, 45 seconds" },
      { at: 45, label: "Pour", detail: "Slow circles to 300 ml" },
      { at: 105, label: "Top up", detail: "To 480 ml" },
      { at: 180, label: "Drawdown", detail: "Lift the filter at 4:30" },
      { at: 270, label: "Serve", detail: "Pour from the spout" },
    ],
  },
  {
    id: "aeropress",
    method: "AeroPress",
    code: "Immersion 03",
    coffee: ["Cajamarca", "Night"],
    dose: "15.0 g",
    water: "220 ml",
    temperatureC: 88,
    totalSeconds: 120,
    grindMicrons: 450,
    roast: "Medium",
    roastNote: "Medium roasts give body and cedar sweetness at lower temperatures.",
    stages: [
      { at: 0, label: "Pour", detail: "All 220 ml, inverted" },
      { at: 10, label: "Stir", detail: "Three slow turns" },
      { at: 60, label: "Steep", detail: "Cap and wait" },
      { at: 90, label: "Press", detail: "30 seconds, steady" },
      { at: 120, label: "Serve", detail: "Stop at the hiss" },
    ],
  },
  {
    id: "french-press",
    method: "French press",
    code: "Immersion 04",
    coffee: ["Noir", "House"],
    dose: "30.0 g",
    water: "500 ml",
    temperatureC: 95,
    totalSeconds: 240,
    grindMicrons: 1000,
    roast: "Dark",
    roastNote: "A darker house roast stands up to long immersion and a heavier cup.",
    stages: [
      { at: 0, label: "Pour", detail: "500 ml over the grounds" },
      { at: 30, label: "Rest", detail: "Leave the crust to form" },
      { at: 180, label: "Break", detail: "Stir the crust, skim" },
      { at: 210, label: "Plunge", detail: "Slowly, just below the surface" },
      { at: 240, label: "Serve", detail: "Decant at once" },
    ],
  },
  {
    id: "espresso",
    method: "Espresso",
    code: "Pressure 05",
    coffee: ["Noir", "Cortado"],
    dose: "18.0 g",
    water: "36 g out",
    temperatureC: 93,
    totalSeconds: 28,
    grindMicrons: 250,
    roast: "Medium",
    roastNote: "Medium development keeps cacao and fig without bitterness under pressure.",
    stages: [
      { at: 0, label: "Pre-infuse", detail: "Low pressure, 5 seconds" },
      { at: 5, label: "Ramp", detail: "Up to 9 bar" },
      { at: 10, label: "Extract", detail: "Honey-thick stream" },
      { at: 24, label: "Blond", detail: "Watch the colour pale" },
      { at: 28, label: "Stop", detail: "36 g in the cup" },
    ],
  },
];

/** Grind scale shown on the indicator (µm). */
export const GRIND_RANGE = { min: 200, max: 1100 } as const;
/** Temperature scale shown on the indicator (°C). */
export const TEMP_RANGE = { min: 85, max: 96 } as const;

export const formatClock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Brewing Lab step cards — spec lines from design/brewing-lab.png. */
export const LAB_STEPS = [
  { title: "Origin", spec: "Ethiopia · Sidama", text: "Ripe fruit, hand-sorted at 1,950m." },
  { title: "Roast", spec: "08:42 · 206°C", text: "Light development preserves florals." },
  { title: "Grind", spec: "620 µm", text: "A clean, even field of particles." },
  { title: "Brew", spec: "93°C · 1:16", text: "Three pours over three minutes." },
  { title: "Pour", spec: "240 ml", text: "Aromatic, clear, quietly sweet." },
] as const;

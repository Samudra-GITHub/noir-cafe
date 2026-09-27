/**
 * From seed to cup — the five chapters told by the home page's preparation
 * story (with film) and by the 3D journey at /cup.
 */
export type JourneyChapter = { id: "origin" | "brew" | "extract" | "pour" | "cup"; step: string; title: string; text: string };

export const JOURNEY: readonly JourneyChapter[] = [
  { id: "origin", step: "Origin", title: "It begins as a seed.", text: "Smallholder lots, picked ripe and dried slowly at altitude." },
  { id: "brew", step: "Brew", title: "Water, measured.", text: "Ninety-three degrees, three pours, and patience between them." },
  { id: "extract", step: "Extract", title: "Pressure, then honey.", text: "Eighteen grams in, thirty-six out, in twenty-eight seconds." },
  { id: "pour", step: "Pour", title: "A steady hand.", text: "Microfoam folded into crema until the rosetta settles." },
  { id: "cup", step: "The cup", title: "Served simply.", text: "Everything before it, held quietly in a single cup." },
];

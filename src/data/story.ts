/** Our Story — content from design/story.png, plus the founding timeline. */

export const STORY_HERO = {
  eyebrow: "Our story · Since 2018",
  title: ["A café born from a long", "conversation."],
  meta: "Mercer Roastery · 08:14 AM",
  image: "/images/story/hero-long-table.jpg",
  imageAlt: "Guests gathered along a long wooden counter in a warmly lit café",
} as const;

export const STORY_QUOTE = "“Could a coffee shop feel like a well-loved book?”";

export const STORY_COLUMNS: string[][] = [
  [
    "That was the question passed across a kitchen table in late 2017. We imagined a place of texture and quiet: coffee with provenance, objects with purpose, and enough room to notice both.",
    "A year later, Noir opened behind a secondhand bookshop on Mercer Street. We roasted after closing, served from six stools, and wrote each coffee’s origin by hand.",
  ],
  [
    "We have grown, carefully. The stools became long tables; the roaster found its own room. But the measure remains intimate: know the producer, taste the harvest, make the cup worthy of both.",
    "Noir is less a style than a promise—to remove distraction and leave what matters.",
  ],
];

export const STORY_IMAGES = {
  primary: {
    src: "/images/story/green-beans-hands.jpg",
    alt: "Cupped hands holding freshly roasted coffee beans",
  },
  secondary: {
    src: "/images/story/first-roaster.jpg",
    alt: "A roaster tending a vintage drum roaster by the window",
    caption: "First roast · Mercer St.",
    year: "2018",
  },
} as const;

export const STORY_TIMELINE = [
  { year: "2017", title: "The question", text: "A kitchen table, two cups, and one idea about quiet." },
  { year: "2018", title: "Six stools", text: "Noir opens behind a bookshop on Mercer Street." },
  { year: "2020", title: "The long table", text: "Stools give way to shared oak tables." },
  { year: "2022", title: "A room to roast", text: "The roaster moves into its own space." },
  { year: "2026", title: "Three rooms", text: "SoHo, Brooklyn and the West Village." },
] as const;

export const STORY_VALUES = [
  { title: "Provenance", text: "Every lot is traceable to its people and place." },
  { title: "Restraint", text: "We roast to reveal, never to impose." },
  { title: "Hospitality", text: "Precision means little unless it feels generous." },
] as const;

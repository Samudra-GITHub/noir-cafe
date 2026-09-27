import type { RoastLevel } from "@/components/ui/RoastMeter";

export type ProductCategory = "beans" | "drinkware" | "brewing-kits" | "apparel" | "sets";

export type VariantGroup = { name: string; options: string[] };

/** A place on the origin map (decimal degrees). */
export type OriginPoint = { name: string; lat: number; lon: number };

export type ShopProduct = {
  slug: string;
  name: string;
  price: number;
  spec: string;
  category: ProductCategory;
  image: string;
  imageAlt: string;
  description: string;
  details: string[];
  /** Beans only — roasts offered as chips. */
  roasts?: RoastLevel[];
  variants: VariantGroup[];
  /** Where it comes from — growing regions for coffee, workshops for objects. */
  origin: { title: string; points: OriginPoint[] };
};

const NEW_YORK: OriginPoint = { name: "Roasted in New York", lat: 40.7, lon: -74 };
const HUILA: OriginPoint = { name: "Huila, Colombia", lat: 2.5, lon: -75.5 };
const SIDAMA: OriginPoint = { name: "Sidama, Ethiopia", lat: 6.7, lon: 38.4 };
const CAJAMARCA: OriginPoint = { name: "Cajamarca, Peru", lat: -7.2, lon: -78.5 };

export const SHOP_FILTERS: { id: "all" | ProductCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "beans", label: "Beans" },
  { id: "drinkware", label: "Drinkware" },
  { id: "brewing-kits", label: "Brewing kits" },
];

/** Products — names, prices and specs from design/merchandise.png. */
export const PRODUCTS: ShopProduct[] = [
  {
    slug: "house-blend-01",
    name: "House Blend 01",
    price: 22,
    spec: "Beans · 250 g",
    category: "beans",
    image: "/images/shop/house-blend-01.jpg",
    imageAlt: "A kraft bag of coffee beans on a warm, softly lit surface",
    description: "Our everyday blend: Huila and Sidama lots roasted for cacao, fig and a long, sweet finish.",
    details: ["Roasted weekly at Mercer Street", "Best 7–30 days from roast", "Compostable valve bag"],
    roasts: ["Light", "Medium", "Dark"],
    origin: { title: "Grown in the coffee belt", points: [HUILA, SIDAMA, NEW_YORK] },
    variants: [{ name: "Grind", options: ["Whole bean", "Filter", "Espresso"] }],
  },
  {
    slug: "studio-mug",
    name: "Studio Mug",
    price: 34,
    spec: "Stoneware · 280 ml",
    category: "drinkware",
    image: "/images/shop/studio-mug.jpg",
    imageAlt: "A dark stoneware mug on a wooden table by a pale wall",
    description: "Thrown in small runs, with a matte glaze that holds heat and sits well in the hand.",
    details: ["280 ml", "Dishwasher safe", "Each glaze varies slightly"],
    origin: { title: "Thrown in the Hudson Valley", points: [{ name: "Hudson Valley, New York", lat: 41.9, lon: -74 }] },
    variants: [{ name: "Glaze", options: ["Charcoal", "Oat", "Walnut"] }],
  },
  {
    slug: "travel-tumbler",
    name: "Travel Tumbler",
    price: 42,
    spec: "Steel · 355 ml",
    category: "drinkware",
    image: "/images/shop/travel-tumbler.jpg",
    imageAlt: "A matte black insulated bottle standing on a weathered stone outdoors",
    description: "Double-walled steel that keeps a pour-over warm through the morning commute.",
    details: ["355 ml", "Keeps warm for 6 hours", "Leak-proof lid"],
    origin: { title: "Designed in New York", points: [NEW_YORK] },
    variants: [{ name: "Finish", options: ["Espresso", "Stone"] }],
  },
  {
    slug: "pour-over-kit",
    name: "Pour-over Kit",
    price: 86,
    spec: "Ceramic · No. 02",
    category: "brewing-kits",
    image: "/images/shop/pour-over-kit.jpg",
    imageAlt: "A black gooseneck kettle on a wooden counter",
    description: "Everything for the V60 ritual: ceramic dripper, glass server, gooseneck kettle and filters.",
    details: ["Ceramic dripper No. 02", "600 ml glass server", "100 paper filters"],
    origin: { title: "Assembled at Mercer Street", points: [NEW_YORK] },
    variants: [{ name: "Set", options: ["Kit", "Kit + House Blend"] }],
  },
  {
    slug: "origin-trio",
    name: "Origin Trio",
    price: 48,
    spec: "Beans · 3 × 150 g",
    category: "beans",
    image: "/images/shop/origin-trio.jpg",
    imageAlt: "Three kraft coffee bags lined up on a white shelf",
    description: "Three single origins side by side — taste how place shapes the cup.",
    details: ["Ethiopia · Colombia · Peru", "3 × 150 g", "Tasting card included"],
    roasts: ["Light", "Medium"],
    origin: { title: "Three origins, one table", points: [HUILA, SIDAMA, CAJAMARCA, NEW_YORK] },
    variants: [{ name: "Grind", options: ["Whole bean", "Filter"] }],
  },
  {
    slug: "linen-apron",
    name: "Linen Apron",
    price: 58,
    spec: "Washed linen · One size",
    category: "apparel",
    image: "/images/shop/linen-apron.jpg",
    imageAlt: "A barista wearing a brown linen apron",
    description: "The apron our baristas wear: heavy washed linen with leather straps that soften with use.",
    details: ["One size, adjustable", "Two front pockets", "Machine wash cold"],
    origin: { title: "Sewn in Brooklyn", points: [{ name: "Brooklyn, New York", lat: 40.7, lon: -73.9 }] },
    variants: [{ name: "Colour", options: ["Walnut", "Espresso"] }],
  },
];

export const HOME_RITUAL_SET: ShopProduct = {
  slug: "home-ritual-set-01",
  name: "Morning, composed.",
  price: 148,
  spec: "The home ritual · Set 01",
  category: "sets",
  image: "/images/shop/morning-composed.jpg",
  imageAlt: "A pour-over brewer, kettle and cup of coffee on a wooden table in warm light",
  description: "Everything needed for a precise, peaceful pour-over.",
  details: ["Pour-over Kit No. 02", "Studio Mug", "House Blend 01 · 250 g"],
  roasts: ["Light", "Medium", "Dark"],
  origin: { title: "From the coffee belt to your kitchen", points: [HUILA, SIDAMA, NEW_YORK] },
    variants: [{ name: "Mug glaze", options: ["Charcoal", "Oat", "Walnut"] }],
};

import type { MenuCategory } from "./types";

/** Autumn 2026 menu — content from design/menu.png. */
export const MENU: MenuCategory[] = [
  {
    id: "espresso",
    title: "Espresso",
    items: [
      {
        name: "Espresso",
        description: "Single-origin · 36g",
        price: 4,
        house: true,
        notes: ["Dark cacao", "Fig", "Molasses"],
        roast: "Medium",
      },
      {
        name: "Americano",
        description: "Espresso · filtered water",
        price: 4.5,
        notes: ["Cocoa", "Toasted almond"],
        roast: "Medium",
      },
    ],
  },
  {
    id: "latte",
    title: "Latte",
    items: [
      {
        name: "Classic Latte",
        description: "Espresso · textured milk",
        price: 6,
        house: true,
        notes: ["Milk chocolate", "Caramel"],
        roast: "Medium",
      },
      {
        name: "Black Sesame",
        description: "Sesame praline · oat milk",
        price: 7.5,
        notes: ["Toasted sesame", "Brown sugar"],
        roast: "Dark",
      },
    ],
  },
  {
    id: "cappuccino",
    title: "Cappuccino",
    items: [
      {
        name: "Noir Cappuccino",
        description: "Double espresso · microfoam",
        price: 5.75,
        house: true,
        notes: ["Cacao", "Hazelnut"],
        roast: "Dark",
      },
      {
        name: "Cacao Cap",
        description: "Cacao nib · demerara",
        price: 6.25,
        notes: ["Cacao nib", "Demerara"],
        roast: "Medium",
      },
    ],
  },
  {
    id: "matcha",
    title: "Matcha",
    items: [
      {
        name: "Ceremonial Matcha",
        description: "Uji matcha · water",
        price: 6,
        house: true,
        notes: ["Umami", "Sweet grass"],
      },
      {
        name: "Matcha Cloud",
        description: "Uji matcha · oat milk",
        price: 7,
        notes: ["Vanilla", "Green tea"],
      },
    ],
  },
  {
    id: "tea",
    title: "Tea",
    items: [
      {
        name: "Jasmine Silver Needle",
        description: "Fujian · floral",
        price: 5.5,
        house: true,
        notes: ["Jasmine", "Honeydew"],
      },
      {
        name: "Smoked Earl Grey",
        description: "Bergamot · lapsang",
        price: 5.5,
        notes: ["Bergamot", "Pine smoke"],
      },
    ],
  },
  {
    id: "bakery",
    title: "Bakery",
    items: [
      {
        name: "Cardamom Bun",
        description: "Brown butter · pearl sugar",
        price: 5.5,
        house: true,
        notes: ["Cardamom", "Brown butter"],
      },
      {
        name: "Chocolate Rye Cookie",
        description: "70% cacao · sea salt",
        price: 4.75,
        notes: ["Rye", "Sea salt"],
      },
    ],
  },
];

export const TODAY_AT_THE_BAR = {
  eyebrow: "Today at the bar",
  name: ["La Esperanza", "Pink Bourbon"],
  notes: "White peach · cacao nib · orange blossom",
  image: "/images/menu/today-at-the-bar.jpg",
  imageAlt: "Espresso and croissants laid out on a dark table with a hand grinder, seen from above",
} as const;

export const MENU_EXTRAS = "Oat +$0.75 · Extra shot +$1.25 · Decaf available";
export const MENU_ALLERGY_NOTE = "Please tell us about allergies. We prepare everything in a shared kitchen.";

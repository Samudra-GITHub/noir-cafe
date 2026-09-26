/** Content shapes shared by page data files (populated per screen from Phase 2). */

export type Drink = {
  slug: string;
  name: string;
  price: number;
  origin: string; // "Huila · Colombia"
  roast: "Light" | "Medium" | "Dark";
  flavor: string;
  brewTime: string; // "03:30"
  image: string;
  imageAlt: string;
};

export type MenuItem = {
  name: string;
  description: string;
  price: number;
  house?: boolean;
  /** Tasting notes, revealed as chips on hover / focus. */
  notes: string[];
  /** Espresso-based drinks carry a roast meter. */
  roast?: "Light" | "Medium" | "Dark";
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type BrewStep = {
  index: number;
  title: string;
  spec: string;
  description: string;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  hours: string;
  image: string;
  imageAlt: string;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  spec: string;
  category: "beans" | "drinkware" | "brewing-kits" | "apparel";
  image: string;
  imageAlt: string;
};

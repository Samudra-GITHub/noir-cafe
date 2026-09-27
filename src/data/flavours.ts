import { MENU } from "./menu";

/**
 * The Recipe Studio's flavour wheel — eight families from the coffee taster's
 * vocabulary. Each family lists the tasting notes our own menu uses, so the
 * wheel points back to drinks you can order.
 */
export type FlavourFamily = { id: string; label: string; notes: readonly string[] };

export const FLAVOUR_FAMILIES: readonly FlavourFamily[] = [
  { id: "fruity", label: "Fruity", notes: ["Fig", "Honeydew", "Bergamot"] },
  { id: "floral", label: "Floral", notes: ["Jasmine"] },
  { id: "sweet", label: "Sweet", notes: ["Caramel", "Vanilla", "Molasses", "Brown sugar", "Demerara", "Brown butter"] },
  { id: "nutty", label: "Nutty & cocoa", notes: ["Hazelnut", "Toasted almond", "Toasted sesame", "Milk chocolate", "Cocoa", "Cacao", "Dark cacao", "Cacao nib"] },
  { id: "spice", label: "Spice", notes: ["Cardamom"] },
  { id: "roasted", label: "Roasted", notes: ["Pine smoke", "Rye"] },
  { id: "green", label: "Green", notes: ["Green tea", "Sweet grass"] },
  { id: "savoury", label: "Savoury", notes: ["Umami", "Sea salt"] },
];

/** Menu drinks carrying at least one note from a family. */
export function drinksWithFamily(family: FlavourFamily) {
  return MENU.flatMap((category) =>
    category.items
      .filter((item) => item.notes.some((n) => family.notes.includes(n)))
      .map((item) => ({ name: item.name, notes: item.notes.filter((n) => family.notes.includes(n)) })),
  );
}

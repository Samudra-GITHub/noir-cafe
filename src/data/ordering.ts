import { MENU } from "./menu";
import type { MenuItem } from "./types";

/**
 * Ordering model — shared by the order page and the server, which always
 * recomputes prices from here (the browser's numbers are never trusted).
 *
 * Paid modifiers come from the menu's own extras line ("Oat +$0.75 · Extra
 * shot +$1.25 · Decaf available"); which drink takes which modifier follows
 * its category and description (milk drinks, espresso drinks, drinks that
 * can be served iced). Bakery takes none.
 */

export const OAT_CENTS = 75;
export const EXTRA_SHOT_CENTS = 125;
export const MAX_QUANTITY = 12;
export const MAX_LINES = 20;

export type Milk = "whole" | "oat";
export type Sweetness = "none" | "light" | "regular";
export type Temperature = "hot" | "iced";
export type Ice = "light" | "regular";

export type Modifiers = {
  milk?: Milk;
  extraShot?: boolean;
  decaf?: boolean;
  sweetness?: Sweetness;
  temperature?: Temperature;
  ice?: Ice;
};

export type Options = {
  milk: "choice" | "oat" | null; // "oat": already made with oat milk
  shot: boolean;
  decaf: boolean;
  sweetness: boolean;
  temperature: boolean;
};

export type OrderableItem = MenuItem & { slug: string; category: string; categoryTitle: string; options: Options };

export const slugOf = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ESPRESSO_BASED = new Set(["espresso", "latte", "cappuccino"]);
const CAN_BE_ICED = new Set(["latte", "matcha", "tea"]);

function optionsFor(category: string, item: MenuItem): Options {
  if (category === "bakery") return { milk: null, shot: false, decaf: false, sweetness: false, temperature: false };
  const oat = /oat milk/i.test(item.description);
  const milky = category === "latte" || category === "cappuccino" || oat;
  return {
    milk: oat ? "oat" : milky ? "choice" : null,
    shot: ESPRESSO_BASED.has(category),
    decaf: ESPRESSO_BASED.has(category),
    sweetness: true,
    temperature: CAN_BE_ICED.has(category) || item.name === "Americano",
  };
}

export const ORDER_MENU = MENU.map((c) => ({
  id: c.id,
  title: c.title,
  items: c.items.map<OrderableItem>((item) => ({
    ...item,
    slug: slugOf(item.name),
    category: c.id,
    categoryTitle: c.title,
    options: optionsFor(c.id, item),
  })),
}));

export const ITEMS_BY_SLUG = new Map(ORDER_MENU.flatMap((c) => c.items).map((i) => [i.slug, i]));

/** Defaults for an item: whole milk where there is a choice, hot, regular sweetness. */
export function defaultModifiers(item: OrderableItem): Modifiers {
  const o = item.options;
  return {
    ...(o.milk === "choice" ? { milk: "whole" as Milk } : {}),
    ...(o.shot ? { extraShot: false } : {}),
    ...(o.decaf ? { decaf: false } : {}),
    ...(o.sweetness ? { sweetness: "none" as Sweetness } : {}),
    ...(o.temperature ? { temperature: "hot" as Temperature } : {}),
  };
}

/** Keep only modifiers the item accepts, with valid values (server-side guard). */
export function sanitize(item: OrderableItem, input: unknown): Modifiers {
  const m = (input ?? {}) as Record<string, unknown>;
  const o = item.options;
  const out: Modifiers = defaultModifiers(item);
  if (o.milk === "choice" && (m.milk === "whole" || m.milk === "oat")) out.milk = m.milk;
  if (o.shot && typeof m.extraShot === "boolean") out.extraShot = m.extraShot;
  if (o.decaf && typeof m.decaf === "boolean") out.decaf = m.decaf;
  if (o.sweetness && (m.sweetness === "none" || m.sweetness === "light" || m.sweetness === "regular")) out.sweetness = m.sweetness;
  if (o.temperature && (m.temperature === "hot" || m.temperature === "iced")) out.temperature = m.temperature;
  if (out.temperature === "iced") out.ice = m.ice === "light" ? "light" : "regular";
  return out;
}

export function unitCents(item: OrderableItem, mods: Modifiers) {
  let cents = Math.round(item.price * 100);
  if (item.options.milk === "choice" && mods.milk === "oat") cents += OAT_CENTS;
  if (item.options.shot && mods.extraShot) cents += EXTRA_SHOT_CENTS;
  return cents;
}

/** "Oat · Extra shot · Iced, light ice · Lightly sweet" (pass `tr` to show it in the visitor's language). */
export function describe(item: OrderableItem, mods: Modifiers, tr: (english: string) => string = (s) => s) {
  const parts: string[] = [];
  if (mods.temperature === "iced") parts.push(mods.ice === "light" ? "Iced, light ice" : "Iced");
  if (item.options.milk === "choice" && mods.milk === "oat") parts.push("Oat");
  if (mods.extraShot) parts.push("Extra shot");
  if (mods.decaf) parts.push("Decaf");
  if (mods.sweetness === "light") parts.push("Lightly sweet");
  if (mods.sweetness === "regular") parts.push("Sweet");
  return parts.map((p) => tr(p)).join(" · ");
}

export const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export type OrderLine = { slug: string; quantity: number; modifiers: Modifiers };

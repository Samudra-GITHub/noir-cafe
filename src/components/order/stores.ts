"use client";

import { useSyncExternalStore } from "react";
import type { Modifiers } from "@/data/ordering";

/** A tiny localStorage-backed store with useSyncExternalStore subscribers. */
function createStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: T | null = null;
  const read = (): T => {
    if (cache !== null) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  };
  const write = (next: T) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  };
  const use = () => useSyncExternalStore(subscribe, read, () => fallback);
  return { read, write, use };
}

export type BagLine = { id: string; slug: string; quantity: number; modifiers: Modifiers };
export type Favorite = { slug: string; modifiers: Modifiers };
export type PlacedOrder = {
  id: string;
  number: string;
  cafeName: string;
  pickupAt: string;
  name: string;
  subtotalCents: number;
  persisted: boolean;
  payment: "pickup" | "card";
  lines: { name: string; quantity: number; detail: string; totalCents: number }[];
};

const EMPTY_BAG: BagLine[] = [];
const EMPTY_FAVS: Favorite[] = [];

export const orderBag = createStore<BagLine[]>("noir:order", EMPTY_BAG);
export const favorites = createStore<Favorite[]>("noir:order-favorites", EMPTY_FAVS);
export const lastOrder = createStore<PlacedOrder | null>("noir:last-order", null);

const sameMods = (a: Modifiers, b: Modifiers) => JSON.stringify(a) === JSON.stringify(b);

export function addToBag(slug: string, modifiers: Modifiers, quantity = 1) {
  const bag = orderBag.read();
  const existing = bag.find((l) => l.slug === slug && sameMods(l.modifiers, modifiers));
  orderBag.write(
    existing
      ? bag.map((l) => (l === existing ? { ...l, quantity: Math.min(12, l.quantity + quantity) } : l))
      : [...bag, { id: crypto.randomUUID(), slug, modifiers, quantity }],
  );
}

export function isFavorite(list: Favorite[], slug: string, modifiers: Modifiers) {
  return list.some((f) => f.slug === slug && sameMods(f.modifiers, modifiers));
}

export function toggleFavorite(slug: string, modifiers: Modifiers) {
  const list = favorites.read();
  favorites.write(isFavorite(list, slug, modifiers) ? list.filter((f) => !(f.slug === slug && sameMods(f.modifiers, modifiers))) : [{ slug, modifiers }, ...list].slice(0, 24));
}

"use client";

import { useSyncExternalStore } from "react";

const KEY = "noir:bag";
const EVENT = "noir:bag";

export type BagLine = { slug: string; name: string; variant: string; quantity: number; price: number };

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * Bag — kept in this browser only. Checkout is not built yet; the bag simply
 * remembers what a visitor has set aside.
 */
export function useBag() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const lines = JSON.parse(raw) as BagLine[];
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  const add = (line: BagLine) => {
    const current = JSON.parse(read()) as BagLine[];
    const match = current.find((l) => l.slug === line.slug && l.variant === line.variant);
    if (match) match.quantity += line.quantity;
    else current.push(line);
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* storage unavailable */
    }
    window.dispatchEvent(new Event(EVENT));
  };

  return { lines, count, add };
}

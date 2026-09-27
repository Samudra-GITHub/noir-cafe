"use client";

import { useSyncExternalStore } from "react";
import type Lenis from "lenis";

/**
 * A tiny store for the one Lenis instance. SmoothScroll creates it lazily (on
 * the first wheel or keyboard scroll, desktop only), so the library stays off
 * the first-load bundle; anything that needs it (dialogs, the mobile sheet)
 * reads it here and simply gets `null` until then.
 */
let instance: Lenis | null = null;
const listeners = new Set<() => void>();

export function setLenis(next: Lenis | null) {
  instance = next;
  listeners.forEach((l) => l());
}

export function getLenis() {
  return instance;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function useLenis() {
  return useSyncExternalStore(subscribe, getLenis, () => null);
}

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * True when animations may run. Components fall back to static, fully visible
 * states otherwise. Hydration-safe: the server snapshot (and the first client
 * render) assume motion is allowed, then the real preference applies.
 */
export function useMotionSafe() {
  return useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(QUERY).matches,
    () => true,
  );
}

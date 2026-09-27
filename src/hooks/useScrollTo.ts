"use client";

import { useCallback } from "react";
import { useLenis } from "@/lib/lenis";

/** Offset that clears the fixed glass nav (28px inset + 72px bar + breathing room). */
export const NAV_CLEARANCE = 140;

// Close match to the EASE_NOIR curve for Lenis' easing hook.
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * Smoothly scrolls to an element through Lenis (falls back to native scroll
 * when Lenis is off, e.g. under reduced motion) and moves focus there so
 * keyboard and screen-reader users land in the same place.
 */
export function useScrollTo() {
  const lenis = useLenis();
  return useCallback(
    (id: string, offset = NAV_CLEARANCE) => {
      const el = document.getElementById(id);
      if (!el) return;
      const focus = () => el.focus({ preventScroll: true });
      if (lenis) {
        lenis.scrollTo(el, { offset: -offset, duration: 1.1, easing: easeOutQuint, onComplete: focus });
      } else {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset });
        focus();
      }
      history.replaceState(null, "", `#${id}`);
    },
    [lenis],
  );
}

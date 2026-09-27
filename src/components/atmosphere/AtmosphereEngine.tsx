"use client";

import { useEffect, useState, type ComponentType } from "react";
import { whenIdle, whenPainted } from "@/lib/page-ready";

const PHONE = "(max-width: 767px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * AtmosphereEngine — a few hundred bytes on first load. On phones, once the
 * first paint is on screen and the browser is idle, it pulls in the canvas
 * layer (scroll-reactive steam and rain). Never loads on larger screens or
 * under reduced motion; the CSS light layers work without it.
 */
export function AtmosphereEngine() {
  const [Canvas, setCanvas] = useState<ComponentType | null>(null);

  useEffect(() => {
    const phone = matchMedia(PHONE);
    const reduced = matchMedia(REDUCED);
    let cancelled = false;
    const maybeLoad = () => {
      if (!phone.matches || reduced.matches) return;
      void whenPainted()
        .then(() => whenIdle())
        .then(() => import("./AtmosphereCanvas"))
        .then((mod) => {
          if (!cancelled) setCanvas(() => mod.AtmosphereCanvas);
        });
    };
    maybeLoad();
    phone.addEventListener("change", maybeLoad);
    return () => {
      cancelled = true;
      phone.removeEventListener("change", maybeLoad);
    };
  }, []);

  return Canvas ? <Canvas /> : null;
}

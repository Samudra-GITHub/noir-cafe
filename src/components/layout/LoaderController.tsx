"use client";

import { useEffect } from "react";

const MIN_MS = 800;
const MAX_MS = 2200;

/**
 * Drives the first-visit loader: progress follows real readiness signals
 * (hydration, web fonts, window load), eased so the bar never jumps. Retires
 * the loader after at least MIN_MS, at most MAX_MS, then remembers the visit.
 */
export function LoaderController() {
  useEffect(() => {
    const root = document.documentElement;
    const loader = document.getElementById("noir-loader");
    if (!loader || !root.classList.contains("noir-loading")) return;

    const bar = document.getElementById("noir-loader-bar");
    const pct = document.getElementById("noir-loader-pct");
    const start = performance.now();
    let target = 0.35; // hydrated
    let shown = 0;
    let frame = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      target = 1;
    };

    document.fonts?.ready.then(() => (target = Math.max(target, 0.7)));
    if (document.readyState === "complete") target = Math.max(target, 0.85);
    else window.addEventListener("load", () => (target = Math.max(target, 0.85)), { once: true });
    const maxTimer = window.setTimeout(finish, MAX_MS);

    const tick = (now: number) => {
      const elapsed = now - start;
      if (target >= 0.85 && elapsed >= MIN_MS) finish();
      shown += (target - shown) * 0.12;
      if (bar) bar.style.transform = `scaleX(${shown})`;
      if (pct) pct.textContent = `${String(Math.round(shown * 100)).padStart(2, "0")}%`;
      if (finished && shown > 0.995) {
        loader.classList.add("is-done");
        root.classList.remove("noir-loading");
        root.classList.add("noir-loaded");
        try {
          sessionStorage.setItem("noir:loaded", "1");
        } catch {
          /* private mode — the loader simply shows again next visit */
        }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(maxTimer);
    };
  }, []);

  return null;
}

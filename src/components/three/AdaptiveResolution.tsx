"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/** Starting pixel ratio: sharp on small screens, capped to ~1.6 MP on large ones. */
export function initialDpr(maxDpr = 1.75, budget = 1.6e6) {
  if (typeof window === "undefined") return 1;
  const area = window.innerWidth * window.innerHeight;
  return Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1, Math.sqrt(budget / area)));
}

/**
 * Keeps the scene smooth on any device: every ~half second it looks at the
 * average frame time and lowers the render resolution when frames run slow
 * (below ~45fps), raising it back toward the ceiling when there is headroom.
 */
export function AdaptiveResolution({ min = 0.75, max = 1.75 }: { min?: number; max?: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const current = useThree((s) => s.viewport.dpr);
  const acc = useRef({ time: 0, frames: 0 });
  useFrame((_, delta) => {
    const a = acc.current;
    a.time += delta;
    a.frames++;
    if (a.time < 0.5) return;
    const avg = a.time / a.frames;
    a.time = 0;
    a.frames = 0;
    if (avg > 1 / 45 && current > min) setDpr(Math.max(min, current * 0.8));
    else if (avg < 1 / 58 && current < max) setDpr(Math.min(max, current * 1.1));
  });
  return null;
}

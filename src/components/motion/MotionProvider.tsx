"use client";

import { LazyMotion } from "framer-motion";
import { whenPainted } from "@/lib/page-ready";

// The animation, gesture and layout features (~40KB) arrive in their own chunk
// once the first paint is on screen, off the critical path. Until then `m`
// components render their initial state, exactly as the server painted it.
const loadFeatures = () =>
  whenPainted()
    .then(() => import("@/lib/motion-features"))
    .then((mod) => mod.default);

/**
 * MotionProvider — every animated element uses the lightweight `m` component
 * (`strict` throws on a stray `motion.*`, so the full bundle can't creep back).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}

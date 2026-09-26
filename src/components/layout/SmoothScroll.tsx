"use client";

import { ReactLenis } from "lenis/react";
import { useMotionSafe } from "@/hooks/useMotionSafe";

/**
 * SmoothScroll — Lenis inertial scrolling on the root scroller.
 * Framer Motion's useScroll reads native scroll position, so scroll-linked
 * motion stays in sync. Disabled entirely under prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe();
  if (!safe) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: true }}>
      {children}
    </ReactLenis>
  );
}

"use client";

import { useEffect } from "react";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { getLenis, setLenis } from "@/lib/lenis";

const INTENT_EVENTS = ["wheel", "keydown"] as const;

/**
 * SmoothScroll — Lenis inertial scrolling on the root scroller, loaded on the
 * first scroll intent (wheel or keyboard) rather than with the page, and only
 * where a fine pointer is present — touch scrolling is already native and
 * smooth. Framer Motion's useScroll reads native scroll position, so
 * scroll-linked motion stays in sync. Disabled under prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const safe = useMotionSafe();

  useEffect(() => {
    if (!safe || !matchMedia("(pointer: fine)").matches) return;
    let cancelled = false;

    const start = () => {
      INTENT_EVENTS.forEach((e) => window.removeEventListener(e, start));
      if (getLenis()) return;
      void import("lenis").then(({ default: Lenis }) => {
        if (cancelled || getLenis()) return;
        setLenis(new Lenis({ autoRaf: true, lerp: 0.1, smoothWheel: true, anchors: true }));
      });
    };
    INTENT_EVENTS.forEach((e) => window.addEventListener(e, start, { passive: true }));

    return () => {
      cancelled = true;
      INTENT_EVENTS.forEach((e) => window.removeEventListener(e, start));
      getLenis()?.destroy();
      setLenis(null);
    };
  }, [safe]);

  return <>{children}</>;
}

"use client";

import { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "framer-motion";
import { PARALLAX_RANGE } from "@/lib/motion";
import { useMotionSafe } from "./useMotionSafe";

/** motion.parallax — scrubbed hero image translate. Attach `ref` to the hero section. */
export function useParallax<T extends HTMLElement = HTMLElement>(): {
  ref: React.RefObject<T | null>;
  y: MotionValue<number>;
} {
  const ref = useRef<T>(null);
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], safe ? [...PARALLAX_RANGE] : [0, 0]);
  return { ref, y };
}

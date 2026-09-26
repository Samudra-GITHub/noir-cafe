"use client";

import { useRef } from "react";
import { useScroll, useTransform, type MotionValue } from "framer-motion";
import { IMAGE_ZOOM } from "@/lib/motion";
import { useMotionSafe } from "./useMotionSafe";

type ZoomConfig = {
  progress: readonly [number, number];
  scale: readonly [number, number];
};

/** motion.imageZoom — scale an image inside an overflow-hidden frame as it crosses the viewport. */
export function useScrollZoom<T extends HTMLElement = HTMLElement>(
  config: ZoomConfig = IMAGE_ZOOM,
): { ref: React.RefObject<T | null>; scale: MotionValue<number> } {
  const ref = useRef<T>(null);
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(
    scrollYProgress,
    [...config.progress],
    safe ? [...config.scale] : [1, 1],
  );
  return { ref, scale };
}

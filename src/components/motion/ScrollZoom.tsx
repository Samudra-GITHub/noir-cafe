"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { IMAGE_ZOOM, IMAGE_ZOOM_SUBTLE } from "@/lib/motion";
import { useScrollZoom } from "@/hooks/useScrollZoom";

/**
 * ScrollZoom — motion.imageZoom frame. The frame clips (overflow hidden);
 * the child (image / video) scales 1 → 1.08 (or 1.06 when `subtle`) with scroll.
 */
export function ScrollZoom({
  subtle = false,
  className,
  children,
}: {
  subtle?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, scale } = useScrollZoom<HTMLDivElement>(subtle ? IMAGE_ZOOM_SUBTLE : IMAGE_ZOOM);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ scale }} className="relative size-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

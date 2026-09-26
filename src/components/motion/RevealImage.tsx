"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { cn } from "@/lib/cn";
import { ease, duration, inViewOnce } from "@/lib/motion";

/**
 * RevealImage — editorial photograph that is uncovered on scroll: a warm paper
 * panel lifts away (clip-path) while the image settles from 1.12 → 1, then
 * drifts with a gentle parallax (±`parallax` px) as the page moves.
 * Static and fully visible under reduced motion.
 */
export function RevealImage({
  src,
  alt,
  sizes,
  parallax = 40,
  priority = false,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  parallax?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], safe ? [-parallax, parallax] : [0, 0]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-cream", className)}>
      <motion.div
        className="absolute inset-0"
        initial={safe ? { clipPath: "inset(100% 0 0 0)" } : false}
        whileInView={{ clipPath: "inset(0% 0 0 0)" }}
        viewport={inViewOnce}
        transition={ease(duration.slow)}
      >
        <motion.div
          className="absolute inset-x-0"
          style={{ y, top: -parallax, bottom: -parallax }}
          initial={safe ? { scale: 1.12 } : false}
          whileInView={{ scale: 1 }}
          viewport={inViewOnce}
          transition={ease(1.6)}
        >
          <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imageClassName)} />
        </motion.div>
      </motion.div>
    </div>
  );
}

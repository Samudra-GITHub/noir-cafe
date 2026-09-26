"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeUp, inViewOnce, staggerContainer, staggerItem } from "@/lib/motion";
import { useMotionSafe } from "@/hooks/useMotionSafe";

type ContainerTag = "div" | "ol" | "ul" | "section";
type ItemTag = "div" | "li" | "article";

/** FadeUp — motion.fadeUp on enter (whileInView y 32→0 · opacity 0→1 · .7s). */
export function FadeUp({ delay = 0, ...props }: { delay?: number } & HTMLMotionProps<"div">) {
  const safe = useMotionSafe();
  if (!safe) return <motion.div {...props} />;
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      custom={delay}
      {...props}
    />
  );
}

/**
 * Stagger — fade-up sequence parent (staggerChildren .12). Wrap children in
 * <StaggerItem>. Use `as="ol"` / `as="ul"` with `StaggerItem as="li"` for lists.
 */
export function Stagger({ as = "div", ...props }: { as?: ContainerTag } & HTMLMotionProps<"div">) {
  const safe = useMotionSafe();
  const Tag = motion[as] as typeof motion.div;
  if (!safe) return <Tag {...props} />;
  return (
    <Tag variants={staggerContainer} initial="hidden" whileInView="visible" viewport={inViewOnce} {...props} />
  );
}

export function StaggerItem({ as = "div", ...props }: { as?: ItemTag } & HTMLMotionProps<"div">) {
  const safe = useMotionSafe();
  const Tag = motion[as] as typeof motion.div;
  return <Tag variants={safe ? staggerItem : undefined} {...props} />;
}

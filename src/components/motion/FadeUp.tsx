"use client";

import { useEffect, useRef, useState } from "react";
import { m, type HTMLMotionProps } from "framer-motion";
import { inViewOnce, staggerContainer, staggerItem } from "@/lib/motion";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { cn } from "@/lib/cn";

type ContainerTag = "div" | "ol" | "ul" | "section";
type ItemTag = "div" | "li" | "article";

/**
 * FadeUp — motion.fadeUp on enter (y 32→0 · opacity 0→1 · .7s EASE_NOIR, once,
 * at 20% visible). Pure CSS transition + IntersectionObserver: it is the most
 * common reveal on the site and often sits above the fold, so it must not wait
 * for the lazily loaded motion runtime. Static under reduced motion (CSS).
 */
export function FadeUp({
  delay = 0,
  className,
  style,
  ...props
}: { delay?: number } & React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: inViewOnce.amount },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-shown={shown || undefined}
      // The inline EARLY_REVEAL script may already have set data-shown.
      suppressHydrationWarning
      className={cn("fade-up", className)}
      style={{ ...style, "--fade-delay": `${delay}s` } as React.CSSProperties}
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
  const Tag = m[as] as typeof m.div;
  if (!safe) return <Tag {...props} />;
  return (
    <Tag variants={staggerContainer} initial="hidden" whileInView="visible" viewport={inViewOnce} {...props} />
  );
}

export function StaggerItem({ as = "div", ...props }: { as?: ItemTag } & HTMLMotionProps<"div">) {
  const safe = useMotionSafe();
  const Tag = m[as] as typeof m.div;
  return <Tag variants={safe ? staggerItem : undefined} {...props} />;
}

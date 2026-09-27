"use client";

import { m, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { hoverLift } from "@/lib/motion";
import { useMotionSafe } from "@/hooks/useMotionSafe";

/**
 * Card — ivory surface, 1px sand border, 12px radius, shadow-[0_16px_48px_#3C24151A].
 * Card behavior: group/card · image scale · focus-within:ring-2 · HOVER LIFT y −8 (.25 easeOut).
 */

type CardTone = "surface" | "muted" | "inverse";

const tones: Record<CardTone, string> = {
  surface: "bg-surface border-sand text-strong",
  muted: "bg-cream border-sand text-strong",
  inverse: "bg-espresso border-char text-beige",
};

export function Card({
  tone = "surface",
  elevated = true,
  lift = false,
  selected = false,
  className,
  ...props
}: {
  tone?: CardTone;
  elevated?: boolean;
  /** Enable the HOVER LIFT interaction. */
  lift?: boolean;
  /** Caramel border + cream fill — e.g. the active brew step or chosen seat. */
  selected?: boolean;
} & HTMLMotionProps<"div">) {
  const safe = useMotionSafe();
  return (
    <m.div
      data-state={selected ? "active" : undefined}
      className={cn(
        "group/card relative overflow-hidden rounded-md border focus-within:ring-2 focus-within:ring-espresso",
        tones[tone],
        elevated && "shadow-card",
        selected && "border-caramel bg-cream",
        className,
      )}
      {...(lift && safe ? hoverLift : {})}
      {...props}
    />
  );
}

/** Panel — large 24px-radius feature panels (menu "Today at the bar", recipe, reservation). */
export function Panel({
  tone = "inverse",
  className,
  ...props
}: { tone?: CardTone } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl",
        tone === "inverse" && "bg-espresso text-beige",
        tone === "surface" && "bg-surface text-strong shadow-card",
        tone === "muted" && "bg-cream text-strong",
        className,
      )}
      {...props}
    />
  );
}

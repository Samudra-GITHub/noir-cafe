"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

export type RoastLevel = "Light" | "Medium" | "Dark";

const LEVEL: Record<RoastLevel, number> = { Light: 1, Medium: 2, Dark: 3 };

/**
 * RoastMeter — three caramel pips (light · medium · dark). Pips fill in
 * sequence when an ancestor `group/card` or `group/row` is hovered.
 * `label` shows the roast name in mono beside the pips.
 */
export function RoastMeter({
  roast,
  label = false,
  size = "sm",
  className,
}: {
  roast: RoastLevel;
  label?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const level = LEVEL[roast];
  const { tr } = useI18n();
  return (
    <span
      role="img"
      aria-label={tr("{roast} roast, {level} of 3", { roast: tr(roast), level })}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <span className={cn("inline-flex items-center", size === "sm" ? "gap-[3px]" : "gap-1")}>
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            aria-hidden
            className={cn(
              "rounded-full",
              size === "sm" ? "size-[3px]" : "size-[5px]",
              n <= level
                ? "bg-caramel motion-safe:group-hover/card:animate-[pip-fill_0.45s_var(--ease-noir)_both] motion-safe:group-hover/row:animate-[pip-fill_0.45s_var(--ease-noir)_both]"
                : "bg-sand",
            )}
            style={n <= level ? { animationDelay: `${n * 90}ms` } : undefined}
          />
        ))}
      </span>
      {label && (
        <span aria-hidden className="font-mono text-micro text-stone uppercase">
          {tr(roast)}
        </span>
      )}
    </span>
  );
}

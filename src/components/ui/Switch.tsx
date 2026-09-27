"use client";

import { cn } from "@/lib/cn";

/**
 * Switch — an on/off control (role="switch") drawn as a small hairline track,
 * the label on the left. Sized for touch (≥44px tall). `tone="inverse"` for
 * espresso surfaces.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  tone = "inverse",
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  tone?: "default" | "inverse";
  className?: string;
}) {
  const inverse = tone === "inverse";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("flex min-h-11 w-full items-center justify-between gap-4 text-left", className)}
    >
      <span className="flex flex-col gap-0.5">
        <span className={cn("font-mono text-eyebrow uppercase", inverse ? "text-cream" : "text-strong")}>{label}</span>
        {description && (
          <span className={cn("font-sans text-body-xs", inverse ? "text-beige/60" : "text-stone")}>{description}</span>
        )}
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full border transition-colors duration-300",
          inverse
            ? checked ? "border-beige bg-beige" : "border-beige/40"
            : checked ? "border-espresso bg-espresso" : "border-sand",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-1 size-4 -translate-y-1/2 rounded-full transition-transform duration-300 ease-noir",
            checked && "translate-x-4",
            inverse ? (checked ? "bg-espresso" : "bg-beige/70") : checked ? "bg-beige" : "bg-stone",
          )}
        />
      </span>
    </button>
  );
}

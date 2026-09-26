"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/** Quantity stepper — 44px targets, mono count, bounded by min/max. */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 12,
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const button =
    "grid size-11 place-items-center rounded-full text-strong transition-colors duration-250 ease-noir hover:bg-cream disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex h-13 items-center rounded-full border border-sand px-1", className)}
    >
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus aria-hidden className="size-3.5" strokeWidth={1.5} />
      </button>
      <output aria-live="polite" className="w-8 text-center font-mono text-mono-md text-strong tabular-nums">
        {value}
      </output>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus aria-hidden className="size-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

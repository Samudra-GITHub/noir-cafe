"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * A labelled range input for the studio. The value reads out next to the
 * label; `valueText` is what screen readers announce (e.g. "620 microns,
 * medium"). `onCommit` fires when a drag or key press settles.
 */
export function StudioSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  valueText,
  hint,
  onChange,
  onCommit,
  ends,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  valueText?: string;
  hint?: string;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
  ends?: [string, string];
  className?: string;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-mono text-eyebrow text-stone uppercase">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-[1.75rem] leading-none text-strong tabular-nums">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText ?? display}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={(e) => onCommit?.(Number(e.currentTarget.value))}
        onKeyUp={(e) => onCommit?.(Number(e.currentTarget.value))}
        className="studio-range"
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
      {ends && (
        <div aria-hidden className="-mt-1 flex justify-between font-mono text-micro text-stone uppercase">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
      {hint && (
        <p id={`${id}-hint`} className="font-sans text-body-xs text-stone">
          {hint}
        </p>
      )}
    </div>
  );
}

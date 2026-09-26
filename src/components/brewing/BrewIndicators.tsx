"use client";

import { motion } from "framer-motion";
import { RoastMeter, type RoastLevel } from "@/components/ui";
import { GRIND_RANGE, TEMP_RANGE } from "@/data/brewing";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease, duration } from "@/lib/motion";

const pct = (value: number, min: number, max: number) =>
  Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

function Scale({
  label,
  value,
  percent,
  ends,
  valueText,
  fill = false,
}: {
  label: string;
  value: string;
  percent: number;
  ends: [string, string];
  valueText: string;
  fill?: boolean;
}) {
  const safe = useMotionSafe();
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-valuetext={valueText}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-micro text-stone uppercase">{label}</span>
        <span className="font-mono text-mono-sm text-strong">{value}</span>
      </div>
      <div className="relative mt-3 h-px bg-sand">
        {fill && (
          <motion.span
            className="absolute inset-y-0 left-0 bg-caramel"
            initial={{ width: safe ? "0%" : `${percent}%` }}
            animate={{ width: `${percent}%` }}
            transition={ease(duration.slow)}
          />
        )}
        <motion.span
          aria-hidden
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-caramel bg-surface"
          initial={{ left: safe ? "0%" : `${percent}%` }}
          animate={{ left: `${percent}%` }}
          transition={ease(duration.slow)}
        />
      </div>
      <div aria-hidden className="mt-2 flex justify-between font-mono text-micro text-stone uppercase">
        <span>{ends[0]}</span>
        <span>{ends[1]}</span>
      </div>
    </div>
  );
}

/** Grind size — fine (espresso) to coarse (French press). */
export function GrindIndicator({ microns }: { microns: number }) {
  return (
    <Scale
      label="Grind size"
      value={`${microns} µm`}
      percent={pct(microns, GRIND_RANGE.min, GRIND_RANGE.max)}
      ends={["Fine", "Coarse"]}
      valueText={`${microns} microns`}
    />
  );
}

/** Water temperature — a filled caramel rule across 85–96°C. */
export function TemperatureIndicator({ celsius }: { celsius: number }) {
  return (
    <Scale
      label="Water temperature"
      value={`${celsius}°C`}
      percent={pct(celsius, TEMP_RANGE.min, TEMP_RANGE.max)}
      ends={[`${TEMP_RANGE.min}°C`, `${TEMP_RANGE.max}°C`]}
      valueText={`${celsius} degrees Celsius`}
      fill
    />
  );
}

/** Roast recommendation — meter plus a sentence on why it suits the method. */
export function RoastRecommendation({ roast, note }: { roast: RoastLevel; note: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-micro text-stone uppercase">Recommended roast</span>
        <RoastMeter roast={roast} size="md" label />
      </div>
      <p className="mt-3 font-sans text-body-xs text-stone">{note}</p>
    </div>
  );
}

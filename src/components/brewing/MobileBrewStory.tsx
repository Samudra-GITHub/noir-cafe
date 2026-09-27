"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { BREW_METHODS, GRIND_RANGE, TEMP_RANGE, formatClock, type BrewMethod } from "@/data/brewing";
import { RoastMeter } from "@/components/ui";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { cn } from "@/lib/cn";

const RING = 2 * Math.PI * 108;
const pct = (v: number, min: number, max: number) => Math.min(1, Math.max(0, (v - min) / (max - min)));

/**
 * Mobile brew story — five brewing methods, one per viewport, swiped
 * sideways. When a method arrives its gauges animate in (temperature fill,
 * grind marker, the timer ring sweeping its full length); tapping the ring
 * runs a real brew timer that walks through the stages.
 */
export function MobileBrewStory() {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root: rail, threshold: 0.6 },
    );
    rail.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="brew-story-title" className="relative mt-20 bg-espresso text-beige md:hidden">
      <h2 id="brew-story-title" className="sr-only">
        Five brewing methods
      </h2>
      <div ref={railRef} className="swipe-rail h-dvh" aria-roledescription="carousel">
        {BREW_METHODS.map((method, i) => (
          <BrewSlide key={method.id} method={method} index={i} active={i === active} />
        ))}
      </div>

      {/* Progress rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[var(--gutter)] flex gap-1.5"
        style={{ top: "calc(var(--safe-top) + 84px)" }}
      >
        {BREW_METHODS.map((m, i) => (
          <span key={m.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-beige/15">
            <span
              className={cn("block h-full bg-caramel transition-transform duration-700 ease-noir origin-left", i <= active ? "scale-x-100" : "scale-x-0")}
            />
          </span>
        ))}
      </div>
    </section>
  );
}

function BrewSlide({ method, index, active }: { method: BrewMethod; index: number; active: boolean }) {
  const safe = useMotionSafe();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const base = useRef(0);
  const total = method.totalSeconds;

  // Stop and reset when swiped away.
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) {
      setRunning(false);
      setElapsed(0);
    }
  }
  useEffect(() => {
    if (!active) base.current = 0;
  }, [active]);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const id = window.setInterval(() => {
      const next = base.current + (performance.now() - start) / 1000;
      if (next >= total) {
        setElapsed(total);
        setRunning(false);
        base.current = total;
      } else setElapsed(next);
    }, 200);
    return () => {
      window.clearInterval(id);
      base.current = Math.min(total, base.current + (performance.now() - start) / 1000);
    };
  }, [running, total]);

  const live = running || elapsed > 0;
  // Before the timer runs, the ring sweeps its full length on arrival as a preview.
  const ringProgress = live ? elapsed / total : active ? 1 : 0;
  const stage = method.stages.reduce((acc, s, i) => (elapsed >= s.at ? i : acc), 0);
  const temp = pct(method.temperatureC, TEMP_RANGE.min, TEMP_RANGE.max);
  const grind = pct(method.grindMicrons, GRIND_RANGE.min, GRIND_RANGE.max);
  const transition = safe ? "duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]" : "duration-0";

  return (
    <div
      data-index={index}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${BREW_METHODS.length}: ${method.method}`}
      className="relative flex w-screen flex-col justify-between px-[var(--gutter)]"
      style={{ paddingTop: "calc(var(--safe-top) + 108px)", paddingBottom: "calc(var(--dock-height) + 44px + var(--safe-bottom))" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_42%,rgb(168_106_60/0.22),transparent_70%)]"
      />
      <div>
        <p className="font-mono text-eyebrow text-caramel-glow uppercase">
          {String(index + 1).padStart(2, "0")} · {method.code}
        </p>
        <h3 className="mt-3 font-display text-[2.75rem] leading-[0.95]">{method.method}</h3>
        <p className="mt-2 font-display text-[1.375rem] text-cream italic">
          {method.coffee.join(" ")}
        </p>
      </div>

      {/* Timer ring */}
      <button
        type="button"
        onClick={() => {
          if (elapsed >= total) {
            base.current = 0;
            setElapsed(0);
          }
          setRunning((r) => !r);
        }}
        aria-label={running ? "Pause brew timer" : "Start brew timer"}
        className="relative mx-auto grid size-[244px] place-items-center"
      >
        <svg viewBox="0 0 244 244" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="122" cy="122" r="108" fill="none" stroke="rgb(248 244 236 / 0.12)" strokeWidth="2" />
          <circle
            cx="122"
            cy="122"
            r="108"
            fill="none"
            stroke="var(--noir-caramel)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - ringProgress)}
            className={cn("transition-[stroke-dashoffset]", live ? "duration-200 ease-linear" : transition)}
          />
        </svg>
        <span className="text-center">
          <span className="block font-mono text-[2.5rem] leading-none tabular-nums">
            {formatClock(live ? elapsed : total)}
          </span>
          <span className="mt-3 flex items-center justify-center gap-2 font-mono text-micro text-cream uppercase">
            {running ? <Pause aria-hidden className="size-3" /> : elapsed >= total ? <RotateCcw aria-hidden className="size-3" /> : <Play aria-hidden className="size-3" />}
            {live ? method.stages[stage].label : "Tap to brew"}
          </span>
        </span>
      </button>
      <p aria-live="polite" className="-mt-4 text-center font-sans text-body-xs text-cream">
        {live ? method.stages[stage].detail : `${method.dose} · ${method.water}`}
      </p>

      {/* Gauges */}
      <div className="flex flex-col gap-5">
        <Gauge label="Temperature" value={`${method.temperatureC}°C`} fill={active ? temp : 0} className={transition} />
        <Gauge label="Grind size" value={`${method.grindMicrons} µm`} marker={active ? grind : 0} className={transition} ends={["Fine", "Coarse"]} />
        <div className="flex items-center justify-between border-t border-beige/15 pt-4">
          <span className="font-mono text-micro text-cream uppercase">Recommended roast</span>
          <RoastMeter roast={method.roast} size="md" />
        </div>
      </div>
    </div>
  );
}

function Gauge({
  label,
  value,
  fill,
  marker,
  ends,
  className,
}: {
  label: string;
  value: string;
  fill?: number;
  marker?: number;
  ends?: [string, string];
  className?: string;
}) {
  const amount = fill ?? marker ?? 0;
  return (
    <div role="meter" aria-label={label} aria-valuenow={Math.round(amount * 100)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={value}>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-micro text-cream uppercase">{label}</span>
        <span className="font-mono text-mono-sm text-beige">{value}</span>
      </div>
      <div className="relative mt-3 h-px bg-beige/15">
        {fill !== undefined && (
          <span className={cn("absolute inset-y-0 left-0 w-full origin-left bg-caramel transition-transform", className)} style={{ transform: `scaleX(${fill})` }} />
        )}
        {marker !== undefined && (
          <span
            className={cn("absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-caramel bg-espresso transition-[left]", className)}
            style={{ left: `${marker * 100}%` }}
          />
        )}
      </div>
      {ends && (
        <div aria-hidden className="mt-2 flex justify-between font-mono text-micro text-taupe uppercase">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}

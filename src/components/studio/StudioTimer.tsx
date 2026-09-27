"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { BrewMethod } from "@/data/brewing";
import { formatClock } from "@/data/brewing";
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/cn";

const R = 88;
const CIRC = 2 * Math.PI * R;

/**
 * The studio's brew timer — a ring that sweeps through the recipe's stages
 * (scaled to this recipe's contact time) beside a vessel that fills with
 * coffee of the recipe's colour as it brews. Real time by default, or a 10×
 * preview. Each new stage is announced to screen readers.
 */
export function StudioTimer({ method, seconds, crema }: { method: BrewMethod; seconds: number; crema: string }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 10>(1);
  const base = useRef(0);
  const scale = seconds / method.totalSeconds;
  const stages = method.stages.map((s) => ({ ...s, at: Math.round(s.at * scale) }));
  const done = elapsed >= seconds;
  const current = stages.reduce((idx, s, i) => (elapsed >= s.at ? i : idx), 0);

  // A new recipe resets the brew.
  const key = `${method.id}:${seconds}`;
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setElapsed(0);
    setRunning(false);
  }
  useEffect(() => {
    base.current = 0;
  }, [key]);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const next = base.current + ((performance.now() - start) / 1000) * speed;
      if (next >= seconds) {
        setElapsed(seconds);
        setRunning(false);
        base.current = seconds;
        feedback("confirm");
        return;
      }
      setElapsed(next);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      base.current = Math.min(seconds, base.current + ((performance.now() - start) / 1000) * speed);
    };
  }, [running, seconds, speed]);

  const toggle = () => {
    if (done) {
      base.current = 0;
      setElapsed(0);
    }
    if (!running) feedback("pour");
    setRunning((r) => !r);
  };

  const fill = elapsed / seconds;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-8 sm:grid-cols-[auto_1fr]">
      <div className="flex items-end justify-center gap-6">
        <button
          type="button"
          onClick={toggle}
          aria-label={running ? "Pause brew timer" : done ? "Restart brew timer" : "Start brew timer"}
          className="relative grid size-[200px] place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-caramel"
        >
          <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--noir-sand)" strokeWidth="2" />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="var(--noir-caramel)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - fill)}
            />
            {stages.map((s) => (
              <circle key={s.label} cx={100 + R * Math.cos((s.at / seconds) * 2 * Math.PI)} cy={100 + R * Math.sin((s.at / seconds) * 2 * Math.PI)} r="3.5" fill={elapsed >= s.at ? "var(--noir-caramel)" : "var(--noir-ivory)"} stroke="var(--noir-caramel)" strokeWidth="1.5" />
            ))}
          </svg>
          <span className="flex flex-col items-center">
            <span className="font-display text-[2.75rem] leading-none text-strong tabular-nums">{formatClock(Math.floor(elapsed))}</span>
            <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-micro text-stone uppercase">
              {running ? <Pause aria-hidden className="size-3" /> : done ? <RotateCcw aria-hidden className="size-3" /> : <Play aria-hidden className="size-3" />}
              {running ? "Pause" : done ? "Again" : "Brew"} · {formatClock(seconds)}
            </span>
          </span>
        </button>

        {/* Live extraction: coffee drips into the vessel and fills it. */}
        <svg viewBox="0 0 60 120" className="h-[150px] w-[75px] shrink-0" aria-hidden>
          <path d="M8 8 L52 8 L40 34 L20 34 Z" fill="none" stroke="var(--noir-stone)" strokeWidth="1.5" strokeLinejoin="round" />
          {running && (
            <g fill={crema}>
              {[0, 1, 2].map((i) => (
                <circle key={i} cx="30" cy="38" r="2" className="studio-drip" style={{ animationDelay: `${i * 0.33}s` }} />
              ))}
            </g>
          )}
          <clipPath id="studio-vessel">
            <rect x="10" y="46" width="40" height="68" rx="8" />
          </clipPath>
          <rect x="10" y={46 + 68 * (1 - fill)} width="40" height={68 * fill} fill={crema} clipPath="url(#studio-vessel)" className="transition-[fill] duration-500" />
          <rect x="10" y="46" width="40" height="68" rx="8" fill="none" stroke="var(--noir-stone)" strokeWidth="1.5" />
        </svg>
      </div>

      <div>
        <ol className="flex flex-col">
          {stages.map((s, i) => (
            <li
              key={s.label}
              aria-current={running && i === current ? "step" : undefined}
              className={cn(
                "flex items-baseline justify-between gap-4 border-b border-sand py-2.5 transition-colors duration-300",
                elapsed >= s.at ? "text-strong" : "text-stone",
              )}
            >
              <span className="font-sans text-body-sm font-semibold">
                {s.label}
                <span className="ml-2 font-normal text-stone">{s.detail}</span>
              </span>
              <span className="font-mono text-micro tabular-nums">{formatClock(s.at)}</span>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">
          {running ? `${stages[current].label}: ${stages[current].detail}` : done ? "Brew complete" : ""}
        </p>
        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 10 : 1))}
          aria-pressed={speed === 10}
          className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-eyebrow text-caramel-ink uppercase"
        >
          Preview ×10 {speed === 10 ? "· on" : "· off"}
        </button>
      </div>
    </div>
  );
}

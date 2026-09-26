"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { BrewMethod } from "@/data/brewing";
import { formatClock } from "@/data/brewing";
import { cn } from "@/lib/cn";

/**
 * Brew timer with a vertical stage timeline. The caramel rule fills as the
 * brew runs; the current stage lifts to espresso ink, finished stages keep a
 * filled dot. Announces each new stage politely to screen readers.
 */
export function BrewTimer({ method }: { method: BrewMethod }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);
  const total = method.totalSeconds;
  const done = elapsed >= total;

  useEffect(() => {
    if (!running) return;
    startedAt.current = performance.now();
    const id = window.setInterval(() => {
      const next = base.current + (performance.now() - (startedAt.current ?? 0)) / 1000;
      if (next >= total) {
        setElapsed(total);
        setRunning(false);
        base.current = total;
      } else {
        setElapsed(next);
      }
    }, 200);
    return () => {
      window.clearInterval(id);
      base.current = Math.min(total, base.current + (performance.now() - (startedAt.current ?? 0)) / 1000);
    };
  }, [running, total]);

  const reset = () => {
    setRunning(false);
    base.current = 0;
    setElapsed(0);
  };

  const currentIndex = method.stages.reduce((acc, stage, i) => (elapsed >= stage.at ? i : acc), 0);
  const current = method.stages[currentIndex];
  const progress = Math.min(1, elapsed / total);

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-micro text-stone uppercase">Brew timer</p>
          <p className="mt-2 font-mono text-[2rem] leading-none text-strong tabular-nums">
            <span aria-hidden>{formatClock(elapsed)}</span>
            <span aria-hidden className="text-stone"> / {formatClock(total)}</span>
            <span className="sr-only">
              {formatClock(elapsed)} of {formatClock(total)}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => (done ? (reset(), setRunning(true)) : setRunning((r) => !r))}
            aria-label={running ? "Pause timer" : done ? "Restart timer" : "Start timer"}
            className="grid size-11 place-items-center rounded-full bg-espresso text-beige transition-[background-color,translate] duration-250 ease-noir hover:-translate-y-0.5 hover:bg-caramel"
          >
            {running ? <Pause aria-hidden className="size-4" strokeWidth={1.5} /> : <Play aria-hidden className="size-4" strokeWidth={1.5} />}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset timer"
            className="grid size-11 place-items-center rounded-full border border-sand text-strong transition-[border-color,translate] duration-250 ease-noir hover:-translate-y-0.5 hover:border-espresso"
          >
            <RotateCcw aria-hidden className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {running || elapsed > 0 ? `${current.label}: ${current.detail}` : ""}
      </p>

      <ol className="relative mt-8 pl-7">
        <span aria-hidden className="absolute top-1.5 bottom-1.5 left-[4px] w-px bg-sand" />
        <span
          aria-hidden
          className="absolute top-1.5 left-[4px] w-px origin-top bg-caramel transition-transform duration-200 ease-linear"
          style={{ height: "calc(100% - 12px)", transform: `scaleY(${progress})` }}
        />
        {method.stages.map((stage, i) => {
          const reached = elapsed >= stage.at && (running || elapsed > 0);
          const isCurrent = i === currentIndex && (running || (elapsed > 0 && !done));
          return (
            <li key={stage.label} className="relative flex items-baseline justify-between gap-4 py-2">
              <span
                aria-hidden
                className={cn(
                  "absolute top-[13px] -left-7 size-[9px] rounded-full border transition-colors duration-300",
                  reached ? "border-caramel bg-caramel" : "border-sand bg-surface",
                )}
              />
              <span
                className={cn(
                  "font-sans text-body-xs transition-colors duration-300",
                  isCurrent ? "font-semibold text-strong" : reached ? "text-strong" : "text-stone",
                )}
              >
                {stage.label}
                <span className="text-stone"> — {stage.detail}</span>
              </span>
              <span className="font-mono text-mono-sm text-stone tabular-nums">{formatClock(stage.at)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

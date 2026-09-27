"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { m } from "framer-motion";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const LONG = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Six-week grid (Monday first) covering `month`, trimmed to the weeks that contain it. */
function buildWeeks(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const weeks: Date[][] = [];
  for (let i = 0; i < 6; i++) weeks.push(days.slice(i * 7, i * 7 + 7));
  return weeks.filter((w) => w.some((d) => d.getMonth() === month.getMonth()));
}

/**
 * Calendar — month grid with roving focus. Arrow keys move by day/week,
 * Home/End to week edges, PageUp/PageDown by month; past days are disabled.
 * The selected day is a 104 × 46 espresso pill that glides between cells.
 */
export function Calendar({
  value,
  onChange,
  today,
  labelledBy,
}: {
  value: Date;
  onChange: (date: Date) => void;
  today: Date;
  labelledBy: string;
}) {
  const safe = useMotionSafe();
  const [month, setMonth] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));
  const [focusDate, setFocusDate] = useState(value);
  const gridRef = useRef<HTMLDivElement>(null);
  const weeks = useMemo(() => buildWeeks(month), [month]);
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoBack = month > minMonth;
  const todayStart = startOfDay(today);

  const move = (next: Date) => {
    if (next < todayStart) return;
    setFocusDate(next);
    if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next.toDateString()}"]`)?.focus();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in map) {
      e.preventDefault();
      move(addDays(focusDate, map[e.key]));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const dow = (focusDate.getDay() + 6) % 7;
      move(addDays(focusDate, e.key === "Home" ? -dow : 6 - dow));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const d = new Date(focusDate);
      d.setMonth(d.getMonth() + (e.key === "PageDown" ? 1 : -1));
      move(d);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="sr-only" aria-live="polite">
          {MONTH.format(month)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            disabled={!canGoBack}
            aria-label="Previous month"
            className="grid size-8 place-items-center rounded-full text-strong transition-colors hover:bg-cream disabled:opacity-30"
          >
            <ChevronLeft aria-hidden className="size-3" strokeWidth={1.5} />
          </button>
          <span aria-hidden className="w-[108px] text-center font-mono text-eyebrow text-strong uppercase">
            {MONTH.format(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            aria-label="Next month"
            className="grid size-8 place-items-center rounded-full text-strong transition-colors hover:bg-cream"
          >
            <ChevronRight aria-hidden className="size-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div ref={gridRef} role="grid" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className="mt-2">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              role="columnheader"
              aria-label={d}
              className="py-3 text-center font-mono text-micro text-stone uppercase"
            >
              {d}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div role="row" key={week[0].toDateString()} className="grid grid-cols-7">
            {week.map((day) => {
              const outside = day.getMonth() !== month.getMonth();
              const past = day < todayStart;
              const selected = sameDay(day, value);
              const focusable = sameDay(day, focusDate) && !outside;
              return (
                <div role="gridcell" key={day.toDateString()} aria-selected={selected} className="flex justify-center">
                  <button
                    type="button"
                    data-date={day.toDateString()}
                    tabIndex={focusable ? 0 : -1}
                    disabled={past || outside}
                    aria-label={LONG.format(day)}
                    aria-pressed={selected}
                    onClick={() => {
                      setFocusDate(day);
                      onChange(day);
                    }}
                    className={cn(
                      "relative isolate h-[46px] w-full max-w-[104px] rounded-full font-mono text-mono-sm transition-colors duration-300 ease-noir",
                      "mt-2 first:mt-2",
                      selected ? "text-beige" : "text-strong hover:bg-cream",
                      (past || outside) && "text-sand hover:bg-transparent",
                    )}
                  >
                    {selected && (
                      <m.span
                        layoutId="calendar-selected"
                        aria-hidden
                        transition={safe ? ease(0.45) : { duration: 0 }}
                        className="absolute inset-0 -z-10 rounded-full bg-espresso"
                      />
                    )}
                    {day.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export { LONG as LONG_DATE };

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FLAVOUR_FAMILIES, drinksWithFamily } from "@/data/flavours";
import { cn } from "@/lib/cn";

const SIZE = 320;
const C = SIZE / 2;
const INNER = 56;
const OUTER = 150;

const polar = (r: number, a: number) => [C + r * Math.cos(a), C + r * Math.sin(a)] as const;

function wedge(i: number, n: number, gap = 0.012) {
  const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + gap;
  const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - gap;
  const [x0, y0] = polar(OUTER, a0);
  const [x1, y1] = polar(OUTER, a1);
  const [x2, y2] = polar(INNER, a1);
  const [x3, y3] = polar(INNER, a0);
  return `M${x0} ${y0}A${OUTER} ${OUTER} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${INNER} ${INNER} 0 0 0 ${x3} ${y3}Z`;
}

const strength = (w: number) => (w > 0.66 ? "Pronounced" : w > 0.4 ? "Present" : "Faint");

/**
 * Flavour wheel — eight families; each wedge's depth of colour shows how much
 * the current recipe brings that family forward. Choose a wedge to see its
 * notes and the drinks on our menu that carry them.
 */
export function FlavorWheel({ emphasis }: { emphasis: Record<string, number> }) {
  const [selected, setSelected] = useState(FLAVOUR_FAMILIES[0].id);
  const family = FLAVOUR_FAMILIES.find((f) => f.id === selected)!;
  const drinks = useMemo(() => drinksWithFamily(family), [family]);
  const n = FLAVOUR_FAMILIES.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[320px]" role="group" aria-label="Flavour wheel">
        {FLAVOUR_FAMILIES.map((f, i) => {
          const w = emphasis[f.id] ?? 0;
          const mid = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
          const [lx, ly] = polar((INNER + OUTER) / 2, mid);
          // Labels run along the radius; on the left half they flip so they never read upside down.
          const deg = (mid * 180) / Math.PI;
          const rot = deg > 90 && deg < 270 ? deg - 180 : deg;
          const on = f.id === selected;
          return (
            <g
              key={f.id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${f.label} — ${strength(w).toLowerCase()} in this recipe`}
              onClick={() => setSelected(f.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(f.id);
                }
              }}
              className="cursor-pointer outline-none [&:focus-visible>path]:stroke-caramel"
            >
              <path
                d={wedge(i, n)}
                fill="var(--noir-caramel)"
                fillOpacity={0.1 + w * 0.8}
                stroke={on ? "var(--noir-espresso)" : "transparent"}
                strokeWidth={2}
                className="transition-[fill-opacity] duration-500 ease-noir"
              />
              <text
                x={lx}
                y={ly}
                transform={`rotate(${rot} ${lx} ${ly})`}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn("pointer-events-none font-mono text-[10px] uppercase", w > 0.55 ? "fill-ivory" : "fill-espresso")}
              >
                {f.label}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={INNER - 6} fill="var(--noir-ivory)" />
        <text x={C} y={C - 6} textAnchor="middle" className="fill-stone font-mono text-[9px] uppercase">
          {strength(emphasis[family.id] ?? 0)}
        </text>
        <text x={C} y={C + 12} textAnchor="middle" className="fill-espresso font-display text-[17px]">
          {family.label}
        </text>
      </svg>

      <div aria-live="polite">
        <p className="font-mono text-eyebrow text-caramel-ink uppercase">{family.label}</p>
        <p className="mt-2 font-display text-[1.75rem] leading-[1.1] text-strong">{family.notes.join(" · ")}</p>
        {drinks.length > 0 && (
          <>
            <p className="mt-6 font-mono text-micro text-stone uppercase">On our menu</p>
            <ul className="mt-2 border-t border-sand">
              {drinks.map((d) => (
                <li key={d.name} className="flex items-baseline justify-between gap-4 border-b border-sand py-3">
                  <span className="font-sans text-body-sm font-semibold text-strong">{d.name}</span>
                  <span className="text-right font-sans text-body-xs text-stone">{d.notes.join(", ")}</span>
                </li>
              ))}
            </ul>
            <Link href="/menu" className="mt-4 inline-flex min-h-11 items-center font-mono text-eyebrow text-caramel-ink uppercase underline decoration-caramel/40 underline-offset-4">
              See the menu
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

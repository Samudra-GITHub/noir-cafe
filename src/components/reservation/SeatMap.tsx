"use client";

import { SEATING, type SeatingId } from "@/data/reservation";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

/**
 * Seat map — a schematic of the Mercer Street room: two-tops along the
 * window, the long oak table indoors, and the sidewalk terrace outside. The
 * chosen area glows caramel; each area shows how many seats are left at the
 * chosen time. A visual companion to the seating radio group (which is the
 * accessible control), so it is hidden from assistive tech.
 */
export function SeatMap({
  selected,
  onSelect,
  left,
  covers,
  className,
}: {
  selected: SeatingId;
  onSelect: (id: SeatingId) => void;
  left: (id: SeatingId) => number | null;
  covers: number;
  className?: string;
}) {
  const { tr } = useI18n();
  const zone = (id: SeatingId) => ({
    on: selected === id,
    full: (left(id) ?? Infinity) < covers,
    onClick: () => (left(id) ?? Infinity) >= covers && onSelect(id),
  });
  const w = zone("window");
  const i = zone("indoor");
  const o = zone("outdoor");
  const fill = (z: { on: boolean; full: boolean }) => (z.full ? "var(--noir-pebble)" : z.on ? "var(--noir-caramel)" : "var(--noir-sand)");
  const label = (id: SeatingId) => {
    const n = left(id);
    return n == null ? tr(SEATING.find((s) => s.id === id)!.label) : n < covers ? tr("Full") : n === 1 ? tr("1 seat left") : tr("{n} seats left", { n });
  };

  return (
    <svg viewBox="0 0 340 250" aria-hidden className={cn("w-full select-none", className)}>
      {/* Room */}
      <rect x="10" y="10" width="320" height="160" rx="10" fill="var(--noir-ivory)" stroke="var(--noir-sand)" />
      {/* Window wall */}
      <line x1="30" y1="10" x2="310" y2="10" stroke="var(--noir-stone)" strokeWidth="3" strokeDasharray="36 6" />
      <text x="170" y="24" textAnchor="middle" className="fill-stone font-mono text-[7px] uppercase">{tr("Window · Mercer Street")}</text>
      {/* Bar */}
      <rect x="250" y="120" width="70" height="40" rx="4" fill="var(--noir-cream)" />
      <text x="285" y="144" textAnchor="middle" className="fill-stone font-mono text-[7px] uppercase">{tr("Bar")}</text>

      {/* Window two-tops */}
      <g onClick={w.onClick} className={cn(!w.full && "cursor-pointer")}>
        {[50, 110, 170, 230].map((x) => (
          <g key={x}>
            <circle cx={x} cy={46} r={11} fill={fill(w)} className="transition-colors duration-300" />
            <circle cx={x - 16} cy={46} r={4} fill={fill(w)} opacity={0.6} />
            <circle cx={x + 16} cy={46} r={4} fill={fill(w)} opacity={0.6} />
          </g>
        ))}
        <text x="140" y="74" textAnchor="middle" className={cn("font-mono text-[8px] uppercase", w.on ? "fill-caramel-ink" : "fill-stone")}>{tr("Window ·")}{" "}{label("window")}</text>
      </g>

      {/* Long oak table */}
      <g onClick={i.onClick} className={cn(!i.full && "cursor-pointer")}>
        <rect x="40" y="96" width="190" height="22" rx="6" fill={fill(i)} className="transition-colors duration-300" />
        {Array.from({ length: 8 }, (_, k) => 52 + k * 24).map((x) => (
          <g key={x}>
            <circle cx={x} cy={88} r={4} fill={fill(i)} opacity={0.6} />
            <circle cx={x} cy={126} r={4} fill={fill(i)} opacity={0.6} />
          </g>
        ))}
        <text x="135" y="150" textAnchor="middle" className={cn("font-mono text-[8px] uppercase", i.on ? "fill-caramel-ink" : "fill-stone")}>{tr("Indoor ·")}{" "}{label("indoor")}</text>
      </g>

      {/* Door and terrace */}
      <line x1="120" y1="170" x2="160" y2="170" stroke="var(--noir-ivory)" strokeWidth="4" />
      <g onClick={o.onClick} className={cn(!o.full && "cursor-pointer")}>
        <rect x="10" y="182" width="320" height="58" rx="10" fill="none" stroke="var(--noir-sand)" strokeDasharray="4 4" />
        {[60, 130, 210, 280].map((x) => (
          <g key={x}>
            <rect x={x - 11} y={199} width={22} height={22} rx={5} fill={fill(o)} className="transition-colors duration-300" />
            <circle cx={x - 18} cy={210} r={4} fill={fill(o)} opacity={0.6} />
            <circle cx={x + 18} cy={210} r={4} fill={fill(o)} opacity={0.6} />
          </g>
        ))}
        <text x="170" y="236" textAnchor="middle" className={cn("font-mono text-[8px] uppercase", o.on ? "fill-caramel-ink" : "fill-stone")}>{tr("Outdoor ·")}{" "}{label("outdoor")}</text>
      </g>
    </svg>
  );
}

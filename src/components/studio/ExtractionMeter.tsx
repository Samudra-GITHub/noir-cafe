import { BAND_COPY, type Band } from "@/lib/brew-model";
import { cn } from "@/lib/cn";

const MIN = 12;
const MAX = 27;
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

/**
 * Extraction meter — where the recipe lands on the extraction-yield scale,
 * with the SCA "gold cup" band (18–22%) marked, the beverage strength (TDS),
 * and what that tastes like.
 */
export function ExtractionMeter({ ey, tds, band }: { ey: number; tds: number; band: Band }) {
  const copy = BAND_COPY[band];
  return (
    <div className="rounded-xl bg-espresso p-6 text-beige md:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-eyebrow text-caramel-glow uppercase">Extraction</p>
        <p className={cn("font-mono text-eyebrow uppercase", band === "balanced" ? "text-beige" : "text-caramel-glow")} aria-live="polite">
          {copy.label}
        </p>
      </div>
      <div className="mt-4 flex items-end gap-8">
        <p className="font-display text-[3.5rem] leading-none tabular-nums">
          {ey.toFixed(1)}
          <span className="text-[1.5rem]">%</span>
        </p>
        <p className="pb-2 font-mono text-eyebrow text-cream uppercase tabular-nums">TDS {tds.toFixed(2)}%</p>
      </div>

      <div className="relative mt-6 h-8" role="meter" aria-valuemin={MIN} aria-valuemax={MAX} aria-valuenow={ey} aria-valuetext={`${ey.toFixed(1)} percent extraction, ${copy.label.toLowerCase()}`} aria-label="Extraction yield">
        <div className="absolute inset-x-0 top-3 h-0.5 rounded-full bg-char" />
        <div className="absolute top-2 h-2.5 rounded-full bg-caramel/35" style={{ left: `${pct(18)}%`, width: `${pct(22) - pct(18)}%` }} />
        <div
          className="absolute top-0.5 size-5 -translate-x-1/2 rounded-full border-2 border-espresso bg-beige transition-[left] duration-500 ease-noir"
          style={{ left: `${Math.min(100, Math.max(0, pct(ey)))}%` }}
        />
        {[14, 18, 22, 26].map((t) => (
          <span key={t} className="absolute top-6 -translate-x-1/2 font-mono text-micro text-taupe" style={{ left: `${pct(t)}%` }}>
            {t}
          </span>
        ))}
      </div>

      <dl className="mt-8 grid gap-4 border-t border-char pt-5 sm:grid-cols-2">
        <div>
          <dt className="font-mono text-micro text-taupe uppercase">In the cup</dt>
          <dd className="mt-1 font-sans text-body-sm text-cream">{copy.taste}</dd>
        </div>
        <div>
          <dt className="font-mono text-micro text-taupe uppercase">Next</dt>
          <dd className="mt-1 font-sans text-body-sm text-cream">{copy.fix}</dd>
        </div>
      </dl>
      <p className="mt-6 font-sans text-body-xs text-taupe">
        An illustrative model: each house recipe is treated as balanced (≈20%), and your changes move extraction the way they do at the bar.
      </p>
    </div>
  );
}

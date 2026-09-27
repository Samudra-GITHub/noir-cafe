"use client";

import { DAYPARTS, setLight, setRain, useAtmosphere, type LightChoice } from "@/lib/atmosphere";
import { cn } from "@/lib/cn";

const LABEL: Record<LightChoice, string> = { auto: "Auto", morning: "Morning", afternoon: "Afternoon", evening: "Evening" };

/**
 * Atmosphere controls for the phone menu sheet: the light (follows New York's
 * clock by default, or fixed to a time of day) and rain mode.
 */
export function AtmosphereControls({ className }: { className?: string }) {
  const { light, rain, daypart } = useAtmosphere();
  const choices: LightChoice[] = ["auto", ...DAYPARTS];

  // Radio group keyboard model: one tab stop, arrows move and select.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = choices[(choices.indexOf(light) + step + choices.length) % choices.length];
    setLight(next);
    e.currentTarget.querySelector<HTMLElement>(`[data-choice="${next}"]`)?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div role="radiogroup" aria-label="Light" onKeyDown={onKeyDown} className="flex flex-col gap-2">
        <span className="font-mono text-eyebrow text-cream uppercase">
          Light{light === "auto" ? ` · ${LABEL[daypart]} in New York` : ""}
        </span>
        <div className="flex flex-wrap gap-2">
          {choices.map((choice) => (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={light === choice}
              tabIndex={light === choice ? 0 : -1}
              data-choice={choice}
              onClick={() => setLight(choice)}
              className={cn(
                "h-10 rounded-full border px-4 font-mono text-eyebrow uppercase transition-colors duration-300",
                light === choice ? "border-beige bg-beige text-espresso" : "border-beige/25 text-beige",
              )}
            >
              {LABEL[choice]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={rain}
        onClick={() => setRain(!rain)}
        className="flex min-h-11 items-center justify-between gap-4 text-left"
      >
        <span className="font-mono text-eyebrow text-cream uppercase">Rain mode</span>
        <span
          aria-hidden
          className={cn(
            "relative h-6 w-10 rounded-full border transition-colors duration-300",
            rain ? "border-beige bg-beige" : "border-beige/40 bg-transparent",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 left-1 size-4 -translate-y-1/2 rounded-full transition-transform duration-300 ease-noir",
              rain ? "translate-x-4 bg-espresso" : "bg-beige/70",
            )}
          />
        </span>
      </button>
    </div>
  );
}

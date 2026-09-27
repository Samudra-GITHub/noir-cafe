"use client";

import { DAYPARTS, setLight, setRain, setRainAuto, useAtmosphere, type LightChoice } from "@/lib/atmosphere";
import { Switch } from "@/components/ui";
import { setHapticsEnabled, useHaptics } from "@/lib/haptics";
import { setSoundEnabled, useSoundEnabled } from "@/lib/sound";
import { cn } from "@/lib/cn";
import { PushSwitch } from "@/components/pwa/PushSwitch";
import { useI18n } from "@/i18n/client";

/**
 * Atmosphere controls for the phone menu sheet: the light (follows New York's
 * clock by default, or fixed to a time of day), rain mode, café sound and —
 * where the device can vibrate — haptics.
 */
export function AtmosphereControls({ className }: { className?: string }) {
  const { light, rain, rainPref, weatherRain, daypart } = useAtmosphere();
  const sound = useSoundEnabled();
  const haptics = useHaptics();
  const { t } = useI18n();
  const a = t.atmosphere;
  const LABEL: Record<LightChoice, string> = { auto: a.auto, morning: a.morning, afternoon: a.afternoon, evening: a.evening };
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
      <div role="radiogroup" aria-label={a.light} onKeyDown={onKeyDown} className="flex flex-col gap-2">
        <span className="font-mono text-eyebrow text-cream uppercase">
          {a.light}{light === "auto" ? ` · ${a.inNewYork.replace("{daypart}", LABEL[daypart])}` : ""}
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

      <div className="flex flex-col gap-1">
        <Switch
          checked={rain}
          onChange={setRain}
          label={a.rain}
          description={rainPref === "auto" ? (weatherRain ? a.rainingNow : a.followsWeather) : a.setByYou}
        />
        {rainPref !== "auto" && (
          <button type="button" onClick={setRainAuto} className="self-start font-mono text-micro text-caramel-glow uppercase underline underline-offset-4">
            {a.followWeather}
          </button>
        )}
      </div>
      <Switch checked={sound} onChange={(on) => void setSoundEnabled(on)} label={a.sound} description={a.soundDescription} />
      <PushSwitch />
      {haptics.supported && (
        <Switch checked={haptics.enabled} onChange={setHapticsEnabled} label={a.haptics} description={a.hapticsDescription} />
      )}
    </div>
  );
}

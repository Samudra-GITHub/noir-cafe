"use client";

import { useEffect } from "react";
import { resumeRememberedSound, toggleSound, useSoundEnabled, useSoundSupported } from "@/lib/sound";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

/**
 * Sound toggle — four hairline bars that lie flat when muted and sway softly
 * while the café plays. Muted by default; the sound engine itself is only
 * downloaded the first time a visitor turns it on (lib/sound).
 */
export function SoundToggle({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  const enabled = useSoundEnabled();
  const supported = useSoundSupported();
  const { t } = useI18n();

  // Sound left on earlier this session resumes at the next gesture.
  useEffect(() => resumeRememberedSound(), []);

  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => void toggleSound()}
      aria-pressed={enabled}
      aria-label={enabled ? t.sound.mute : t.sound.play}
      data-cursor="link"
      className={cn(
        "group/sound grid size-11 place-items-center rounded-full transition-colors duration-500 ease-noir",
        inverse ? "text-beige hover:bg-beige/10" : "text-espresso hover:bg-espresso/5",
        className,
      )}
    >
      <span aria-hidden className="flex h-3.5 items-end gap-[3px]">
        {[0.55, 1, 0.7, 0.4].map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-px origin-bottom rounded-full bg-current transition-transform duration-500 ease-noir",
              enabled ? "motion-safe:animate-[sound-bar_1.1s_ease-in-out_infinite_alternate]" : "scale-y-[0.18]",
            )}
            style={{ height: `${h * 100}%`, animationDelay: `${i * 140}ms` }}
          />
        ))}
      </span>
    </button>
  );
}

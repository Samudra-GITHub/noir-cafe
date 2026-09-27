import { useSyncExternalStore } from "react";
import type { Voice } from "./engine";

export type { Voice };

/**
 * Sound facade — what components import. It is tiny: the synthesis engine
 * (lib/sound/engine) is only downloaded the first time a visitor turns sound
 * on, so the muted default costs nothing. `play()` is a no-op until then.
 */

type Engine = typeof import("./engine").sound;
let engine: Engine | null = null;
let enabled = false;
const listeners = new Set<() => void>();

async function load() {
  engine ??= (await import("./engine")).sound;
  return engine;
}

function set(next: boolean) {
  enabled = next;
  listeners.forEach((l) => l());
}

/** Turn sound on or off. Call from a user gesture (autoplay policy). */
export async function setSoundEnabled(next: boolean) {
  set(next);
  const e = next ? await load() : engine;
  await e?.setEnabled(next);
}

export function toggleSound() {
  return setSoundEnabled(!enabled);
}

/** Play a one-shot voice — silent while muted. */
export function play(voice: Voice) {
  if (enabled) engine?.play(voice);
}

/** If sound was on earlier this session, turn it back on at the next gesture. */
export function resumeRememberedSound() {
  let wanted = false;
  try {
    wanted = sessionStorage.getItem("noir:sound") === "on";
  } catch {}
  if (!wanted) return () => {};
  const resume = () => void setSoundEnabled(true);
  window.addEventListener("pointerdown", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
  return () => {
    window.removeEventListener("pointerdown", resume);
    window.removeEventListener("keydown", resume);
  };
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, () => enabled, () => false);
}

export function useSoundSupported() {
  return useSyncExternalStore(
    () => () => {},
    () => "AudioContext" in window,
    () => true,
  );
}

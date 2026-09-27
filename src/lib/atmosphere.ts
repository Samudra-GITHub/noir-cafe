"use client";

import { useSyncExternalStore } from "react";
import { LIGHT_KEY, RAIN_KEY } from "./atmosphere-boot";

/**
 * Atmosphere state — the light of the day in New York and the visitor's own
 * choices (a fixed light, rain). Everything is mirrored onto <html> as data
 * attributes so the CSS layers (app/globals.css, "Atmosphere engine") can react
 * without JavaScript in the paint path; ATMOSPHERE_BOOT (lib/atmosphere-boot)
 * sets them before first paint from the same rules. Phones only (below 768px):
 * the desktop keeps its fixed, designed light.
 */

export type Daypart = "morning" | "afternoon" | "evening";
export type LightChoice = Daypart | "auto";

export const DAYPARTS: readonly Daypart[] = ["morning", "afternoon", "evening"];

/** Morning 05–11, afternoon 11–17, evening 17–05, by the café's clock. */
export function daypartAt(date = new Date()): Daypart {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/New_York" }).format(date),
  );
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "afternoon";
  return "evening";
}

type State = { light: LightChoice; rain: boolean; daypart: Daypart };

const listeners = new Set<() => void>();
let state: State | null = null;
const SERVER_STATE: State = { light: "auto", rain: false, daypart: "afternoon" };

function read(): State {
  let light: LightChoice = "auto";
  let rain = false;
  try {
    const stored = localStorage.getItem(LIGHT_KEY);
    if (stored && (stored === "auto" || DAYPARTS.includes(stored as Daypart))) light = stored as LightChoice;
    rain = localStorage.getItem(RAIN_KEY) === "1";
  } catch {}
  return { light, rain, daypart: light === "auto" ? daypartAt() : light };
}

function apply(next: State) {
  state = next;
  const root = document.documentElement;
  root.dataset.daypart = next.daypart;
  if (next.rain) root.dataset.rain = "";
  else delete root.dataset.rain;
  listeners.forEach((l) => l());
}

let clock: number | undefined;
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Follow the café's clock while anything is listening.
  clock ??= window.setInterval(() => {
    const s = getState();
    if (s.light === "auto" && daypartAt() !== s.daypart) apply({ ...s, daypart: daypartAt() });
  }, 5 * 60_000);
  return () => {
    listeners.delete(onChange);
    if (!listeners.size && clock !== undefined) {
      window.clearInterval(clock);
      clock = undefined;
    }
  };
}

function getState() {
  return (state ??= read());
}

export function useAtmosphere() {
  return useSyncExternalStore(subscribe, getState, () => SERVER_STATE);
}

export function setLight(light: LightChoice) {
  try {
    localStorage.setItem(LIGHT_KEY, light);
  } catch {}
  apply({ ...getState(), light, daypart: light === "auto" ? daypartAt() : light });
}

export function setRain(rain: boolean) {
  try {
    localStorage.setItem(RAIN_KEY, rain ? "1" : "0");
  } catch {}
  apply({ ...getState(), rain });
}

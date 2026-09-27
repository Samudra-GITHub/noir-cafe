import { useSyncExternalStore } from "react";

/**
 * Haptics — short taps through the Vibration API where the device has one
 * (Android browsers; iOS Safari has no Vibration API, so this is a silent
 * no-op there). Touch devices only, on by default, switchable in the phone
 * menu, and always subtle: nothing longer than a few dozen milliseconds.
 */

export type Haptic = "press" | "swipe" | "toggle" | "success";

const PATTERNS: Record<Haptic, number | number[]> = {
  press: 8,
  swipe: 12,
  toggle: 10,
  success: [14, 70, 28],
};

const PREF_KEY = "noir:haptics";
const listeners = new Set<() => void>();
let pref: boolean | null = null;

function readPref() {
  if (pref !== null) return pref;
  try {
    pref = localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    pref = true;
  }
  return pref;
}

/** True when this device can vibrate and has a touch-first pointer. */
export function hapticsSupported() {
  return typeof navigator !== "undefined" && "vibrate" in navigator && matchMedia("(pointer: coarse)").matches;
}

export function haptic(kind: Haptic) {
  if (!hapticsSupported() || !readPref()) return;
  try {
    navigator.vibrate(PATTERNS[kind]);
  } catch {}
}

export function setHapticsEnabled(on: boolean) {
  pref = on;
  try {
    localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {}
  listeners.forEach((l) => l());
  if (on) haptic("toggle");
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useHaptics() {
  const enabled = useSyncExternalStore(subscribe, readPref, () => true);
  const supported = useSyncExternalStore(subscribe, hapticsSupported, () => false);
  return { enabled, supported };
}

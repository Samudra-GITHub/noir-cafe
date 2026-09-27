"use client";

import { useSyncExternalStore } from "react";

/**
 * New York's weather, now — from Open-Meteo (free, no key, no personal data:
 * the request carries fixed SoHo coordinates, never the visitor's). Cached in
 * the session for 20 minutes and fetched only when something asks for it.
 */
export type NycWeather = {
  temperatureF: number;
  code: number;
  label: string;
  rain: boolean;
  isDay: boolean;
  sunrise: string; // "06:48"
  sunset: string;
  fetchedAt: number;
};

const ENDPOINT =
  "https://api.open-meteo.com/v1/forecast?latitude=40.7208&longitude=-74.0023&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=America%2FNew_York&forecast_days=1&temperature_unit=fahrenheit";
const CACHE_KEY = "noir:nyc-weather";
const TTL = 20 * 60_000;

/** WMO weather codes → words. */
export function describeWeather(code: number) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code >= 95) return "Thunderstorms";
  return "—";
}
export const isRainCode = (code: number) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

let current: NycWeather | null = null;
let inflight: Promise<NycWeather | null> | null = null;
const listeners = new Set<() => void>();

function readCache(): NycWeather | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    const w = raw ? (JSON.parse(raw) as NycWeather) : null;
    return w && Date.now() - w.fetchedAt < TTL ? w : null;
  } catch {
    return null;
  }
}

export function getNycWeather(): Promise<NycWeather | null> {
  current ??= readCache();
  if (current) return Promise.resolve(current);
  inflight ??= fetch(ENDPOINT)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d) => {
      const code = d.current.weather_code as number;
      const w: NycWeather = {
        temperatureF: Math.round(d.current.temperature_2m),
        code,
        label: describeWeather(code),
        rain: isRainCode(code),
        isDay: d.current.is_day === 1,
        sunrise: String(d.daily.sunrise[0]).slice(11, 16),
        sunset: String(d.daily.sunset[0]).slice(11, 16),
        fetchedAt: Date.now(),
      };
      current = w;
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(w));
      } catch {}
      listeners.forEach((l) => l());
      return w;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function subscribe(l: () => void) {
  listeners.add(l);
  void getNycWeather();
  return () => listeners.delete(l);
}

/** The weather (null until it arrives, or if the service is unreachable). */
export function useNycWeather() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}

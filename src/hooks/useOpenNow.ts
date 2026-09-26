"use client";

import { useSyncExternalStore } from "react";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Current minutes past midnight in New York. */
function nyMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/**
 * Whether a café is open right now (New York time). Renders as open on the
 * server and during hydration — as in the design — then reflects the clock.
 */
export function useOpenNow(opens: string, closes: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      const now = nyMinutes();
      return now >= toMinutes(opens) && now < toMinutes(closes);
    },
    () => true,
  );
}

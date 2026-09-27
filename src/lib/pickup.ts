import type { Cafe } from "@/data/locations";

/**
 * Pickup times in New York, from each café's own hours. Shared by the order
 * page (to offer slots) and the server (to validate them).
 */

const ZONE = "America/New_York";
export const SLOT_MINUTES = 10;
export const LEAD_MINUTES = 10;

/** Minutes the zone is ahead of UTC at `date` (negative for New York). */
function offsetMinutes(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** Today's date and minutes-since-midnight in New York. */
function nyToday(now: Date) {
  const local = new Date(now.getTime() + offsetMinutes(now) * 60000);
  return { y: local.getUTCFullYear(), m: local.getUTCMonth(), d: local.getUTCDate(), minutes: local.getUTCHours() * 60 + local.getUTCMinutes() };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Pickup slots (UTC ISO strings) for the rest of today at `cafe`. */
export function pickupSlots(cafe: Cafe, now = new Date()) {
  const today = nyToday(now);
  const open = toMinutes(cafe.opens);
  const last = toMinutes(cafe.closes) - SLOT_MINUTES; // last pickup before closing
  let start = Math.max(open, today.minutes + LEAD_MINUTES);
  start = Math.ceil(start / SLOT_MINUTES) * SLOT_MINUTES;
  const offset = offsetMinutes(now);
  const slots: string[] = [];
  for (let t = start; t <= last; t += SLOT_MINUTES) {
    const utc = Date.UTC(today.y, today.m, today.d, Math.floor(t / 60), t % 60) - offset * 60000;
    slots.push(new Date(utc).toISOString());
  }
  return slots;
}

/** Is `iso` one of today's slots at `cafe` (with a minute of grace for clock skew)? */
export function isValidPickup(cafe: Cafe, iso: string, now = new Date()) {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return false;
  const grace = new Date(now.getTime() - 60_000);
  return pickupSlots(cafe, grace).includes(new Date(at).toISOString());
}

export function formatPickup(iso: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: ZONE, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

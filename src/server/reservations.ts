import "server-only";
import {
  MAX_ADVANCE_DAYS,
  RESERVATION_GUESTS,
  RESERVATION_TIMES,
  SEATING,
  SEAT_CAPACITY,
  guestCount,
  type SeatingId,
} from "@/data/reservation";
import { supabase } from "./supabase";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export type Availability = Record<string, Record<SeatingId, number>>;
export type ValidReservation = { day: string; time: string; guests: string; covers: number; seating: SeatingId; name: string; email: string };
export type ReservationRecord = ValidReservation & { code: string; persisted: boolean };

/** Today (YYYY-MM-DD) and minutes past midnight, in New York. */
function nyNow(now = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  return { day: `${p.year}-${p.month}-${p.day}`, minutes: +p.hour * 60 + +p.minute };
}

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const toMinutes = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5);

/** A bookable day: today (New York) up to MAX_ADVANCE_DAYS ahead. */
export function isBookableDay(day: string, now = new Date()) {
  if (!DAY.test(day) || Number.isNaN(Date.parse(`${day}T12:00:00Z`))) return false;
  const today = nyNow(now).day;
  return day >= today && day <= addDays(today, MAX_ADVANCE_DAYS);
}

async function capacity(): Promise<Record<SeatingId, number>> {
  const db = supabase();
  if (!db) return SEAT_CAPACITY;
  const { data } = await db.from("reservation_capacity").select("seating, covers");
  const out = { ...SEAT_CAPACITY };
  for (const row of data ?? []) if (row.seating in out) out[row.seating as SeatingId] = row.covers as number;
  return out;
}

/** Remaining covers per time and seating area for `day` (times already past today are 0). */
export async function availability(day: string, now = new Date()): Promise<{ slots: Availability; source: "supabase" | "defaults" }> {
  const cap = await capacity();
  const slots: Availability = {};
  const today = nyNow(now);
  for (const t of RESERVATION_TIMES) {
    const past = day === today.day && toMinutes(t) <= today.minutes;
    slots[t] = Object.fromEntries(SEATING.map((s) => [s.id, past ? 0 : cap[s.id]])) as Record<SeatingId, number>;
  }
  const db = supabase();
  if (!db) return { slots, source: "defaults" };
  const { data } = await db.from("reservations").select("time, seating, covers").eq("day", day).neq("status", "cancelled");
  for (const r of data ?? []) {
    const slot = slots[r.time as string];
    if (slot && r.seating in slot) slot[r.seating as SeatingId] = Math.max(0, slot[r.seating as SeatingId] - (r.covers as number));
  }
  return { slots, source: "supabase" };
}

export function validateReservation(body: unknown, now = new Date()): { reservation: ValidReservation } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const day = typeof b.day === "string" ? b.day : "";
  if (!isBookableDay(day, now)) return { error: "date_unavailable" };
  const time = typeof b.time === "string" && (RESERVATION_TIMES as readonly string[]).includes(b.time) ? b.time : null;
  if (!time) return { error: "time_unavailable" };
  const today = nyNow(now);
  if (day === today.day && toMinutes(time) <= today.minutes) return { error: "time_unavailable" };
  const guests = typeof b.guests === "string" && (RESERVATION_GUESTS as readonly string[]).includes(b.guests) ? b.guests : null;
  if (!guests) return { error: "guests_invalid" };
  const seating = SEATING.find((s) => s.id === b.seating)?.id;
  if (!seating) return { error: "seating_invalid" };
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
  if (!name) return { error: "name_required" };
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 254) : "";
  if (!EMAIL.test(email)) return { error: "email_invalid" };
  return { reservation: { day, time, guests, covers: guestCount(guests), seating, name, email } };
}

function reservationCode() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return "NC-" + [...crypto.getRandomValues(new Uint8Array(6))].map((b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Book the table. With Supabase, the `book_table` function checks and takes
 * capacity in one transaction (no double-booking); otherwise the booking is a
 * demo — validated against default capacity but not stored.
 */
export async function createReservation(r: ValidReservation): Promise<ReservationRecord | { error: "full" }> {
  const code = reservationCode();
  const db = supabase();
  if (!db) {
    const { slots } = await availability(r.day);
    if ((slots[r.time]?.[r.seating] ?? 0) < r.covers) return { error: "full" };
    return { ...r, code, persisted: false };
  }
  const { data, error } = await db.rpc("book_table", {
    p_code: code,
    p_day: r.day,
    p_time: r.time,
    p_seating: r.seating,
    p_covers: r.covers,
    p_guests: r.guests,
    p_name: r.name,
    p_email: r.email,
  });
  if (error) throw new Error(`book_table: ${error.message}`);
  if (data !== true) return { error: "full" };
  return { ...r, code, persisted: true };
}

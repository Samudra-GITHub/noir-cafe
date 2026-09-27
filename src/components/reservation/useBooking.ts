"use client";

import { useEffect, useState } from "react";
import { guestCount, type SeatingId } from "@/data/reservation";

export type Slots = Record<string, Record<SeatingId, number>>;
export type Booked = { code: string; day: string; time: string; guests: string; seating: SeatingId; name: string; persisted: boolean };

const ERRORS: Record<string, string> = {
  date_unavailable: "That date can't be booked online — please choose another.",
  time_unavailable: "That time has passed — please choose a later one.",
  full: "That area has just filled up for this time — please choose another seat or time.",
  name_required: "Please add a name for the table",
  email_invalid: "Enter a valid email address",
  rate_limited: "Too many requests — please wait a minute.",
};

/** Live availability for a day (refreshed every minute) and the booking request. */
export function useBooking(day: string) {
  const [slots, setSlots] = useState<Slots | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [emailed, setEmailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`/api/reservations/availability?day=${day}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && setSlots(d?.slots ?? null))
        .catch(() => {});
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [day]);

  const book = async (input: { day: string; time: string; guests: string; seating: SeatingId; name: string; email: string }) => {
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERRORS[data.error] ?? "We couldn't book the table. Please try again.");
        setStatus("error");
        return null;
      }
      setBooked(data.reservation);
      setEmailed(Boolean(data.emailed));
      setStatus("done");
      return data.reservation as Booked;
    } catch {
      setError("The connection dropped. Please try again.");
      setStatus("error");
      return null;
    }
  };

  /** Seats left in an area at a time (null while loading). */
  const left = (time: string, seating: SeatingId) => slots?.[time]?.[seating] ?? null;
  /** Can this party sit anywhere at this time? */
  const timeOpen = (time: string, guests: string) => !slots || Object.values(slots[time] ?? {}).some((n) => n >= guestCount(guests));

  return { slots, left, timeOpen, book, status, error, booked, emailed };
}

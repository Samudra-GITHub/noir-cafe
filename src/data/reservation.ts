/** Reservation options — from design/reservation.png (seating per the brief: window, indoor, outdoor). */

export const RESERVATION_TIMES = ["09:30", "10:00", "10:30", "11:00"] as const;
export const RESERVATION_GUESTS = ["1", "2", "3", "4+"] as const;

export const SEATING = [
  { id: "window", label: "Window", detail: "Morning light", image: "/images/reservation/mercer-window.jpg" },
  { id: "indoor", label: "Indoor", detail: "Long oak table", image: "/images/locations/wythe-avenue.jpg" },
  { id: "outdoor", label: "Outdoor", detail: "Sidewalk terrace", image: "/images/locations/west-10th.jpg" },
] as const;

export type SeatingId = (typeof SEATING)[number]["id"];

export const RESERVATION_VENUE = {
  eyebrow: "Your reservation",
  name: ["Noir Café", "Mercer Street"],
  image: "/images/reservation/mercer-window.jpg",
  imageAlt: "A quiet corner of the café with wooden tables, framed prints and warm lamplight",
  note: "No charge · Please cancel 2 hours ahead",
} as const;

/** The design opens on Friday 16 October 2026, 10:30, two guests, by the window. */
export const RESERVATION_DEFAULTS = {
  date: new Date(2026, 9, 16),
  time: "10:30",
  guests: "2",
  seating: "window" as SeatingId,
};

/**
 * Booking rules. Covers per seating area are operating defaults — the
 * Supabase table `reservation_capacity` overrides them when connected.
 */
export const SEAT_CAPACITY: Record<SeatingId, number> = { window: 8, indoor: 16, outdoor: 10 };
export const MAX_ADVANCE_DAYS = 60;
/** How long a table is held, for calendar invites. */
export const TABLE_MINUTES = 90;
export const RESERVATION_CAFE = { id: "mercer", address: "14 Mercer Street, New York, NY 10013" } as const;

/** Guests counted against capacity ("4+" books four covers). */
export const guestCount = (g: string) => (g === "4+" ? 4 : Number(g));

/** Calendar date as YYYY-MM-DD (the date the guest picked, no time zone shift). */
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

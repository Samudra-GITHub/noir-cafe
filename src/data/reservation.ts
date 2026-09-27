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

/**
 * iCalendar (RFC 5545) invite for a table — used by the "Add to calendar"
 * button and attached to confirmation emails. Times are New York local
 * (TZID with an embedded VTIMEZONE, so every client places it correctly).
 */

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/New_York",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:19700308T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:19701101T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

/** Escape text per RFC 5545 §3.3.11. */
const text = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

/** Fold lines longer than 75 octets (§3.1). */
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
};

const local = (day: string, minutes: number) => {
  const [y, m, d] = day.split("-");
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${y}${m}${d}T${String(h).padStart(2, "0")}${String(min).padStart(2, "0")}00`;
};

export function reservationIcs({
  code,
  day,
  time,
  minutes,
  guests,
  seating,
  name,
  venue,
  address,
}: {
  code: string;
  day: string; // YYYY-MM-DD
  time: string; // HH:MM
  minutes: number;
  guests: string;
  seating: string;
  name: string;
  venue: string;
  address: string;
}) {
  const [h, m] = time.split(":").map(Number);
  const start = h * 60 + m;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Noir Café//Reservations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${code}@noircafe.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/New_York:${local(day, start)}`,
    `DTEND;TZID=America/New_York:${local(day, start + minutes)}`,
    `SUMMARY:${text(`Table at ${venue}`)}`,
    `LOCATION:${text(address)}`,
    `DESCRIPTION:${text(`Reservation ${code} for ${name} — ${guests} ${guests === "1" ? "guest" : "guests"}, ${seating}. No charge; please cancel 2 hours ahead.`)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${text(`Your table at ${venue}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

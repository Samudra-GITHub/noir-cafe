import "server-only";
import { RESERVATION_CAFE, RESERVATION_VENUE, SEATING, TABLE_MINUTES } from "@/data/reservation";
import { reservationIcs } from "@/lib/ics";
import type { ReservationRecord } from "./reservations";

/**
 * Email — confirmation messages through Resend's HTTP API when
 * RESEND_API_KEY and RESERVATIONS_FROM are set; otherwise nothing is sent and
 * the caller reports `emailed: false`. Any provider with an HTTP API can sit
 * behind `send()`.
 */

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const LONG = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export function reservationEmail(r: ReservationRecord) {
  const seat = SEATING.find((s) => s.id === r.seating)?.label ?? r.seating;
  const when = `${LONG.format(new Date(`${r.day}T12:00:00Z`))} at ${to12h(r.time)}`;
  const venue = RESERVATION_VENUE.name.join(" · ");
  const subject = `Your table at Noir Café — ${when}`;
  const text = `Thank you, ${r.name.split(" ")[0]}.\n\nYour table is reserved.\n\n${venue}\n${RESERVATION_CAFE.address}\n${when}\n${r.guests} ${r.guests === "1" ? "guest" : "guests"} · ${seat}\nReservation ${r.code}\n\n${RESERVATION_VENUE.note}.`;
  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 0;border-top:1px solid #35302b;font:11px/1.4 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#8f867e">${k}</td><td style="padding:10px 0;border-top:1px solid #35302b;font:14px/1.4 Inter,Arial,sans-serif;color:#f8f4ec;text-align:right">${esc(v)}</td></tr>`;
  const html = `<!doctype html><html><body style="margin:0;background:#f8f4ec;padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#17120e;border-radius:18px;padding:32px;color:#f8f4ec">
<tr><td>
<p style="margin:0;font:11px/1.4 'IBM Plex Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#b67a4b">Your reservation</p>
<h1 style="margin:14px 0 6px;font:400 34px/1.1 'Cormorant Garamond',Georgia,serif">${esc(venue)}</h1>
<p style="margin:0 0 24px;font:14px/1.6 Inter,Arial,sans-serif;color:#efe5d7">Thank you, ${esc(r.name.split(" ")[0])}. We look forward to seeing you.</p>
<table role="presentation" width="100%" style="border-collapse:collapse">${row("When", when)}${row("Guests", r.guests)}${row("Seating", seat)}${row("Reservation", r.code)}${row("Address", RESERVATION_CAFE.address)}</table>
<p style="margin:24px 0 0;font:11px/1.6 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#8f867e">${esc(RESERVATION_VENUE.note)}</p>
</td></tr></table></body></html>`;
  const ics = reservationIcs({
    code: r.code,
    day: r.day,
    time: r.time,
    minutes: TABLE_MINUTES,
    guests: r.guests,
    seating: seat,
    name: r.name,
    venue,
    address: RESERVATION_CAFE.address,
  });
  return { subject, text, html, ics };
}

export async function sendReservationEmail(r: ReservationRecord): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATIONS_FROM;
  if (!key || !from) return false;
  const mail = reservationEmail(r);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [r.email],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: [{ filename: "noir-cafe-reservation.ics", content: Buffer.from(mail.ics).toString("base64") }],
    }),
  });
  if (!res.ok) console.error("[email] resend", res.status);
  return res.ok;
}

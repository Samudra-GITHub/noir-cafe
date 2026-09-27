import { sendReservationEmail } from "@/server/email";
import { rateLimit } from "@/server/rate-limit";
import { createReservation, validateReservation } from "@/server/reservations";

/**
 * POST { day, time, guests, seating, name, email } → books the table.
 * 422 with a reason when the request is invalid, 409 when the area is full.
 * The confirmation email goes out when an email provider is configured.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`reservations:${ip}`, { limit: 8, windowMs: 10 * 60_000 })) return Response.json({ error: "rate_limited" }, { status: 429 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const result = validateReservation(body);
  if ("error" in result) return Response.json({ error: result.error }, { status: 422 });
  const booked = await createReservation(result.reservation);
  if ("error" in booked) return Response.json({ error: "full" }, { status: 409 });
  const emailed = await sendReservationEmail(booked).catch(() => false);
  const { email: _email, ...publicFields } = booked;
  void _email;
  return Response.json({ reservation: publicFields, emailed });
}

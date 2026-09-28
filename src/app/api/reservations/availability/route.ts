import { limited } from "@/server/rate-limit";
import { availability, isBookableDay } from "@/server/reservations";

/** GET ?day=YYYY-MM-DD → remaining covers per time and seating area. */
export async function GET(request: Request) {
  const busy = limited(request, "availability", 60, 60_000);
  if (busy) return busy;
  const day = new URL(request.url).searchParams.get("day") ?? "";
  if (!isBookableDay(day)) return Response.json({ error: "date_unavailable" }, { status: 422 });
  const { slots, source } = await availability(day);
  return Response.json({ day, slots, source }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * GET /api/weather — New York's weather now, for the atmosphere engine and
 * the locations page. Fetched from Open-Meteo (free, no key) for fixed SoHo
 * coordinates and cached here for 15 minutes, so the site makes one upstream
 * request per quarter hour whatever the traffic, visitors' browsers never
 * talk to a third party, and an upstream hiccup never reaches them: the
 * response is then `{ available: false }` and the site simply keeps its
 * clock-based light.
 */
const SOURCE =
  "https://api.open-meteo.com/v1/forecast?latitude=40.7208&longitude=-74.0023&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=America%2FNew_York&forecast_days=1&temperature_unit=fahrenheit";

type Upstream = {
  current?: { temperature_2m?: number; weather_code?: number; is_day?: number };
  daily?: { sunrise?: string[]; sunset?: string[] };
};

export async function GET() {
  const headers = { "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600" };
  try {
    const res = await fetch(SOURCE, { next: { revalidate: 900 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(String(res.status));
    const d = (await res.json()) as Upstream;
    const c = d.current;
    if (!c || typeof c.weather_code !== "number" || typeof c.temperature_2m !== "number") throw new Error("shape");
    return Response.json(
      {
        available: true,
        current: { temperature_2m: c.temperature_2m, weather_code: c.weather_code, is_day: c.is_day === 1 ? 1 : 0 },
        daily: { sunrise: [String(d.daily?.sunrise?.[0] ?? "")], sunset: [String(d.daily?.sunset?.[0] ?? "")] },
      },
      { headers },
    );
  } catch {
    return Response.json({ available: false }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } });
  }
}

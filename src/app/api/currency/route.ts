import { DISPLAY_CURRENCIES, BASE_CURRENCY } from "@/i18n/config";

/**
 * GET /api/currency — reference exchange rates from USD (the currency every
 * price is set and charged in) to the other display currencies. Source: the
 * European Central Bank's daily reference rates via Frankfurter (no key).
 * Cached for 6 hours; if the source is unreachable the response is 503 and the
 * site simply keeps showing US dollars. Rates are never hardcoded.
 *
 * GET /api/currency?amount=6.5&to=JPY additionally converts one amount on the
 * server (the same arithmetic the client uses for display).
 */
const TARGETS = DISPLAY_CURRENCIES.filter((c) => c !== BASE_CURRENCY);
const SOURCE = `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}&symbols=${TARGETS.join(",")}`;

type Upstream = { base: string; date: string; rates: Record<string, number> };

async function fetchRates(): Promise<Upstream | null> {
  try {
    const res = await fetch(SOURCE, { next: { revalidate: 21600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = (await res.json()) as Upstream;
    if (data.base !== BASE_CURRENCY || typeof data.date !== "string") return null;
    const rates: Record<string, number> = {};
    for (const c of TARGETS) if (Number.isFinite(data.rates?.[c]) && data.rates[c] > 0) rates[c] = data.rates[c];
    return { base: data.base, date: data.date, rates };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const data = await fetchRates();
  if (!data) return Response.json({ error: "rates unavailable" }, { status: 503 });

  const url = new URL(request.url);
  const amount = url.searchParams.get("amount");
  const to = url.searchParams.get("to");
  if (amount !== null || to !== null) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0 || value > 1_000_000) return Response.json({ error: "invalid amount" }, { status: 400 });
    if (!to || !(to in data.rates)) return Response.json({ error: "unsupported currency" }, { status: 400 });
    return Response.json(
      { from: BASE_CURRENCY, to, amount: value, converted: Math.round(value * data.rates[to] * 100) / 100, date: data.date },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  }

  return Response.json(
    { base: data.base, date: data.date, rates: data.rates },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}

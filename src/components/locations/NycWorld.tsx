"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui";
import { CAFES, CAFE_GEO, LINE_COLORS, LINE_DARK_TEXT, walkingUrl, type Cafe } from "@/data/locations";
import { useNycWeather } from "@/lib/weather";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";
import { useFormat, useI18n } from "@/i18n/client";
import { LOCALE_META } from "@/i18n/config";

// ── Projection: the stretch of the city our three rooms sit in ──────────
const BOUNDS = { north: 40.7405, south: 40.7055, west: -74.0145, east: -73.9505 };
const W = 340;
const H = 300;
const px = (lat: number, lon: number) => [((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * W, ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * H] as const;
const path = (pts: [number, number][]) => pts.map(([lat, lon], i) => `${i ? "L" : "M"}${px(lat, lon).map((n) => n.toFixed(1)).join(" ")}`).join("");

/** Schematic subway alignments near the cafés (station to station, simplified). */
const LINES: { id: string; color: string; pts: [number, number][] }[] = [
  { id: "1", color: LINE_COLORS["1"], pts: [[40.7405, -74.0003], [40.7334, -74.0029], [40.7282, -74.0054], [40.7223, -74.0063], [40.7055, -74.0132]] },
  { id: "ACE", color: LINE_COLORS.A, pts: [[40.7405, -73.9985], [40.7322, -74.0005], [40.7262, -74.0037], [40.7209, -74.0053], [40.7055, -74.0098]] },
  { id: "NQRW", color: LINE_COLORS.N, pts: [[40.7405, -73.9893], [40.7291, -73.9929], [40.7243, -73.9977], [40.7195, -74.0007], [40.7055, -74.0075]] },
  { id: "6", color: LINE_COLORS["6"], pts: [[40.7405, -73.9858], [40.7282, -73.9913], [40.7224, -73.9974], [40.7188, -74.0000], [40.7128, -74.0040]] },
  { id: "JZ", color: LINE_COLORS.J, pts: [[40.7181, -74.0000], [40.7201, -73.9937], [40.7184, -73.9870], [40.7132, -73.9755], [40.7084, -73.9578]] },
  { id: "L", color: LINE_COLORS.L, pts: [[40.7372, -73.9907], [40.7307, -73.9816], [40.7224, -73.9681], [40.7174, -73.9567], [40.7145, -73.9505]] },
];

// ── Time in New York ────────────────────────────────────────────────────
function nyMinutes() {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  return +p.find((x) => x.type === "hour")!.value * 60 + +p.find((x) => x.type === "minute")!.value;
}
function useNyMinutes() {
  return useSyncExternalStore(
    (cb) => {
      const id = window.setInterval(cb, 30_000);
      return () => window.clearInterval(id);
    },
    nyMinutes,
    () => -1,
  );
}
const toMin = (hhmm: string) => +hhmm.slice(0, 2) * 60 + +hhmm.slice(3, 5);
/** Minutes after midnight in New York → that time on the visitor's clock (ICU formatting, as before). */
const clock = (m: number, intl: string) => new Intl.DateTimeFormat(intl, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 0, 1, Math.floor(m / 60), m % 60)));

/** Open or closed now, and minutes until that changes (null before the clock is known). */
function status(cafe: Cafe, now: number) {
  if (now < 0) return { open: true, minutes: null };
  const opens = toMin(cafe.opens);
  const closes = toMin(cafe.closes);
  if (now >= opens && now < closes) return { open: true, minutes: closes - now };
  return { open: false, minutes: now < opens ? opens - now : 24 * 60 - now + opens };
}

/** Distance in miles between two points (haversine). */
function miles(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function LineBullet({ line }: { line: string }) {
  return (
    <span
      aria-hidden
      className="grid size-6 place-items-center rounded-full font-sans text-[0.6875rem] font-bold"
      style={{ background: LINE_COLORS[line], color: LINE_DARK_TEXT.has(line) ? "#17120e" : "#fff" }}
    >
      {line}
    </span>
  );
}

/**
 * New York, live — the phone view of our three rooms. A schematic map of
 * SoHo, the West Village and Williamsburg with the subway lines that reach
 * them (trains drift along each line), lit for day or night by New York's
 * actual sun; the weather now; each café's live hours; its nearest station;
 * and walking directions in your maps app. "How far?" asks for your location
 * only when tapped and never sends it anywhere.
 */
export function NycWorld() {
  const { tr, locale } = useI18n();
  const format = useFormat();
  const now = useNyMinutes();
  const weather = useNycWeather();
  const [selected, setSelected] = useState(CAFES[0].id);
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const cafe = CAFES.find((c) => c.id === selected)!;
  const geo = CAFE_GEO[cafe.id];
  const st = status(cafe, now);
  const night = weather ? !weather.isDay : now >= 0 && (now < 6 * 60 + 30 || now >= 19 * 60);

  const locate = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) return setGeoError("Location isn't available on this device.");
    navigator.geolocation.getCurrentPosition(
      (p) => setHere({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setGeoError("We couldn't get your location — you can still get walking directions."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );
  };
  const dist = here ? miles(here, geo) : null;

  return (
    <div className="container-page mt-10 md:hidden">
      {/* New York, now */}
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow text-stone uppercase" aria-live="polite">
        <span>{tr("New York")}{now >= 0 ? ` · ${clock(now, LOCALE_META[locale].intl)}` : ""}</span>
        {weather && (
          <span>
            {locale === "en" ? `${weather.temperatureF}°F` : `${Math.round(((weather.temperatureF - 32) * 5) / 9)}°C`} · {tr(weather.label)}
          </span>
        )}
        {weather && <span>{weather.isDay ? tr("Sunset {time}", { time: locale === "en" ? weather.sunset : format.time(weather.sunset) }) : tr("Sunrise {time}", { time: locale === "en" ? weather.sunrise : format.time(weather.sunrise) })}</span>}
      </p>

      {/* Map */}
      <div className={cn("nyc-map relative mt-4 overflow-hidden rounded-2xl transition-colors duration-700", night ? "bg-espresso" : "bg-cream")} data-night={night || undefined}>
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="block w-full">
          {/* Rivers */}
          <path d={`M0 0 L${px(40.7405, -74.0105)[0]} 0 L${px(40.7055, -74.0170)[0]} ${H} L0 ${H}Z`} className={night ? "fill-char" : "fill-sand"} opacity={0.7} />
          <path d={`M${px(40.7405, -73.9735)[0]} 0 C ${px(40.7230, -73.9745)[0]} 90 ${px(40.7160, -73.9745)[0]} 150 ${px(40.7055, -73.9880)[0]} ${H} L${px(40.7055, -73.9790)[0]} ${H} C ${px(40.7160, -73.9690)[0]} 150 ${px(40.7230, -73.9690)[0]} 90 ${px(40.7405, -73.9690)[0]} 0Z`} className={night ? "fill-char" : "fill-sand"} opacity={0.7} />
          <text x="14" y={H - 14} className={cn("font-mono text-[7px] uppercase", night ? "fill-taupe" : "fill-stone")}>{tr("Hudson River")}</text>
          <text x={px(40.72, -73.9712)[0] - 10} y="24" className={cn("font-mono text-[7px] uppercase", night ? "fill-taupe" : "fill-stone")}>{tr("East River")}</text>
          <text x="118" y="22" className={cn("font-display text-[13px]", night ? "fill-cream" : "fill-walnut")}>{tr("Manhattan")}</text>
          <text x="258" y={H - 24} className={cn("font-display text-[13px]", night ? "fill-cream" : "fill-walnut")}>{tr("Brooklyn")}</text>

          {/* Subway lines, with trains drifting along them */}
          {LINES.map((l, i) => (
            <g key={l.id}>
              <path d={path(l.pts)} fill="none" stroke={l.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
              <path d={path(l.pts)} fill="none" stroke={night ? "#f8f4ec" : "#fffcf7"} strokeWidth={3} strokeLinecap="round" className="nyc-train" style={{ animationDelay: `${i * -1.3}s` }} />
            </g>
          ))}

          {/* Cafés */}
          {CAFES.map((c) => {
            const [x, y] = px(CAFE_GEO[c.id].lat, CAFE_GEO[c.id].lon);
            const on = c.id === selected;
            return (
              <g key={c.id} onClick={() => setSelected(c.id)} className="cursor-pointer">
                {on && <circle cx={x} cy={y} r={16} className="nyc-pulse fill-caramel" opacity={0.25} />}
                <circle cx={x} cy={y} r={on ? 10 : 8} className={on ? "fill-caramel" : night ? "fill-beige" : "fill-espresso"} stroke={night ? "#17120e" : "#f8f4ec"} strokeWidth={2} />
                <text x={x} y={y + 3} textAnchor="middle" className={cn("font-mono text-[7px] font-bold", on ? "fill-beige" : night ? "fill-espresso" : "fill-beige")}>
                  {c.index.slice(-1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Café choice (the accessible control for the map) */}
      <div role="radiogroup" aria-label={tr("Café")} className="mt-4 grid grid-cols-3 gap-2"
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const i = CAFES.findIndex((c) => c.id === selected);
          const next = CAFES[(i + step + CAFES.length) % CAFES.length];
          setSelected(next.id);
          (e.currentTarget.querySelector(`[data-cafe="${next.id}"]`) as HTMLElement | null)?.focus();
        }}
      >
        {CAFES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === selected}
            tabIndex={c.id === selected ? 0 : -1}
            data-cafe={c.id}
            onClick={() => {
              haptic("toggle");
              setSelected(c.id);
            }}
            className={cn(
              "min-h-12 rounded-xl border px-2 py-2 text-center font-sans text-body-xs font-semibold transition-colors",
              c.id === selected ? "border-espresso bg-espresso text-beige" : "border-sand bg-surface text-strong",
            )}
          >
            {c.cardName}
          </button>
        ))}
      </div>

      {/* Selected café */}
      <article aria-labelledby={`cafe-${cafe.id}`} className="mt-6 overflow-hidden rounded-2xl bg-espresso text-beige">
        <div className="relative aspect-[16/10]">
          <Image src={cafe.image} alt={tr(cafe.imageAlt)} fill sizes="100vw" className={cn("object-cover transition-[filter] duration-700", night && "brightness-[0.62] saturate-[0.85]")} />
          {night && <span aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_70%,rgb(232_168_104/0.22),transparent_70%)]" />}
          <span className="absolute top-4 inset-s-4 rounded-full bg-espresso/70 px-3 py-1 font-mono text-micro text-beige uppercase backdrop-blur-md">{night ? tr("Evening") : tr("Daytime")} · {tr(cafe.label)}</span>
        </div>
        <div className="p-6">
          <h2 id={`cafe-${cafe.id}`} className="font-display text-[2.25rem] leading-none">
            {cafe.cardName}
          </h2>
          <p className={cn("mt-3 inline-flex items-center gap-2 font-mono text-eyebrow uppercase", st.open ? "text-cream" : "text-taupe")}>
            <span aria-hidden className={cn("size-1.5 rounded-full", st.open ? "bg-olive" : "bg-taupe")} />
            {st.minutes === null
              ? `${cafe.opens}–${cafe.closes}`
              : tr(st.open ? "Open · closes in {duration}" : "Closed · opens in {duration}", {
                  duration: st.minutes >= 60 ? tr("{h} h {m} min", { h: Math.floor(st.minutes / 60), m: st.minutes % 60 }) : tr("{m} min", { m: st.minutes }),
                })}
          </p>
          <address className="mt-4 font-sans text-body-sm text-cream not-italic">
            {cafe.address[0]}
            <br />
            {cafe.address[1]}
          </address>
          <p className="mt-1 font-mono text-micro text-taupe uppercase">{tr("Daily")}{" "}{cafe.opens}–{cafe.closes}</p>

          <div className="mt-5 flex items-center gap-3 border-t border-char pt-5">
            <span className="flex gap-1" aria-label={tr("Lines {lines}", { lines: geo.transit.lines.join(", ") })} role="img">
              {geo.transit.lines.slice(0, 6).map((l) => (
                <LineBullet key={l} line={l} />
              ))}
              {geo.transit.lines.length > 6 && <span className="self-center font-mono text-micro text-taupe">+{geo.transit.lines.length - 6}</span>}
            </span>
            <span className="font-sans text-body-xs text-cream">{geo.transit.station}</span>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button href={walkingUrl(cafe)} variant="inverse" target="_blank" rel="noopener noreferrer" className="justify-between pe-6">{tr("Walk here")}</Button>
            {dist === null ? (
              <button type="button" onClick={locate} className="inline-flex min-h-11 items-center gap-2 self-start font-mono text-eyebrow text-caramel-glow uppercase">
                <Navigation aria-hidden className="size-3.5" />{" "}{tr("How far am I?")}</button>
            ) : (
              <p className="font-sans text-body-sm text-cream" aria-live="polite">
                {dist < 0.1
                  ? tr("You're right here.")
                  : tr(locale === "en" ? "{d} mi away · about {m} min on foot" : "{d} km away · about {m} min on foot", {
                      d: (locale === "en" ? dist : dist * 1.609).toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
                      m: Math.max(1, Math.round((dist / 3) * 60)),
                    })}
              </p>
            )}
            {geoError && <p className="font-sans text-body-xs text-taupe">{tr(geoError)}</p>}
          </div>
        </div>
      </article>
    </div>
  );
}

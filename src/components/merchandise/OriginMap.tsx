import type { OriginPoint } from "@/data/shop";
import { useI18n } from "@/i18n/client";

const W = 340;
const H = 190;
// Equirectangular, cropped to 50°N – 30°S so the coffee belt and New York both fit.
const LAT_TOP = 50;
const LAT_BOTTOM = -30;
const x = (lon: number) => ((lon + 180) / 360) * W;
const y = (lat: number) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H;

/**
 * Origin map — a quiet diagram rather than a geographic map: the coffee belt
 * between the tropics, the equator, and a pin for each origin, with arcs
 * travelling to the roastery in New York.
 */
export function OriginMap({ title, points }: { title: string; points: OriginPoint[] }) {
  const { tr } = useI18n();
  const roastery = points.find((p) => p.name.startsWith("Roasted"));
  const origins = points.filter((p) => p !== roastery);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${points.map((p) => tr(p.name)).join(", ")}`} className="w-full">
        <rect width={W} height={H} rx="14" fill="var(--noir-cream)" />
        {/* Coffee belt */}
        <rect x="0" y={y(23.4)} width={W} height={y(-23.4) - y(23.4)} fill="var(--noir-caramel)" opacity="0.08" />
        {[23.4, 0, -23.4].map((lat) => (
          <line
            key={lat}
            x1="0"
            x2={W}
            y1={y(lat)}
            y2={y(lat)}
            stroke="var(--noir-sand)"
            strokeDasharray={lat === 0 ? undefined : "3 4"}
          />
        ))}
        <text x="10" y={y(0) - 5} fontSize="7" fill="var(--noir-stone)" fontFamily="var(--family-code)" letterSpacing="1">{tr("EQUATOR")}</text>
        <text x="10" y={y(23.4) - 5} fontSize="7" fill="var(--noir-stone)" fontFamily="var(--family-code)" letterSpacing="1">{tr("COFFEE BELT")}</text>
        {roastery &&
          origins.map((p) => {
            const [x1, y1, x2, y2] = [x(p.lon), y(p.lat), x(roastery.lon), y(roastery.lat)];
            const cx = (x1 + x2) / 2;
            const cy = Math.min(y1, y2) - 30;
            return <path key={p.name} d={`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`} fill="none" stroke="var(--noir-caramel)" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />;
          })}
        {points.map((p) => (
          <g key={p.name} transform={`translate(${x(p.lon)} ${y(p.lat)})`}>
            <circle r="7" fill="var(--noir-caramel)" opacity="0.18" />
            <circle r="3.2" fill={p === roastery ? "var(--noir-espresso)" : "var(--noir-caramel)"} />
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-micro text-stone uppercase">
        {points.map((p) => (
          <span key={p.name} className="flex items-center gap-1.5">
            <span aria-hidden className={p === roastery ? "size-1.5 rounded-full bg-espresso" : "size-1.5 rounded-full bg-caramel"} />
            {tr(p.name)}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

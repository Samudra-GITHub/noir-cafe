"use client";

import { RoastMeter } from "@/components/ui";
import { ROAST_LANDMARKS, beanHex, beanTemperature, roastLevel, roastProfile } from "@/lib/brew-model";
import { StudioSlider } from "./StudioSlider";

const W = 340;
const H = 190;
const X0 = 34;
const X1 = W - 12;
const Y0 = H - 26;
const Y1 = 14;
const MAX_MIN = 13;
const x = (min: number) => X0 + ((X1 - X0) * min) / MAX_MIN;
const y = (temp: number) => Y0 - ((Y0 - Y1) * (temp - 80)) / (240 - 80);
const clock = (min: number) => `${Math.floor(min)}:${String(Math.round((min % 1) * 60)).padStart(2, "0")}`;

/**
 * Roast simulator — slide from light to dark and watch where the roast is
 * dropped on a classic bean-temperature curve (turning point, drying, first
 * and second crack), the share of the roast spent developing after first
 * crack, and the colour of the bean.
 */
export function RoastSimulator({
  roast,
  onChange,
  onCommit,
}: {
  roast: number;
  onChange: (v: number) => void;
  onCommit?: (v: number) => void;
}) {
  const profile = roastProfile(roast);
  const level = roastLevel(roast);
  const path = Array.from({ length: Math.round(MAX_MIN * 10) + 1 }, (_, i) => i / 10)
    .map((m, i) => `${i ? "L" : "M"}${x(m).toFixed(1)} ${y(beanTemperature(m)).toFixed(1)}`)
    .join("");
  const devPath =
    `M${x(ROAST_LANDMARKS[1].at)} ${Y0}` +
    Array.from({ length: 40 }, (_, i) => ROAST_LANDMARKS[1].at + ((profile.minutes - ROAST_LANDMARKS[1].at) * i) / 39)
      .map((m) => `L${x(m).toFixed(1)} ${y(beanTemperature(m)).toFixed(1)}`)
      .join("") +
    `L${x(profile.minutes)} ${Y0}Z`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
      <figure className="max-w-[560px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Roast curve: dropped at ${profile.drop}°C after ${clock(profile.minutes)}, ${profile.development}% development`}>
          {[100, 150, 200].map((t) => (
            <g key={t}>
              <line x1={X0} x2={X1} y1={y(t)} y2={y(t)} stroke="var(--noir-sand)" strokeWidth={1} />
              <text x={X0 - 6} y={y(t) + 3} textAnchor="end" className="fill-stone font-mono text-[7px]">{t}°</text>
            </g>
          ))}
          {[0, 4, 8, 12].map((m) => (
            <text key={m} x={x(m)} y={H - 10} textAnchor="middle" className="fill-stone font-mono text-[7px]">{m}′</text>
          ))}
          {profile.minutes > ROAST_LANDMARKS[1].at && <path d={devPath} fill="var(--noir-caramel)" fillOpacity={0.18} />}
          <path d={path} fill="none" stroke="var(--noir-espresso)" strokeWidth={1.6} />
          {ROAST_LANDMARKS.map((l, i) => (
            <g key={l.label}>
              <line x1={x(l.at)} x2={x(l.at)} y1={Y1} y2={Y0} stroke="var(--noir-stone)" strokeDasharray="3 3" strokeWidth={0.8} />
              {/* Staggered so neighbouring landmarks never collide. */}
              <text x={x(l.at) - 3} y={Y1 + 4 + (i % 2) * 11} textAnchor="end" className="fill-stone font-mono text-[6.5px] uppercase">{l.label}</text>
            </g>
          ))}
          <circle cx={x(profile.minutes)} cy={y(profile.drop)} r={5} fill="var(--noir-caramel)" stroke="var(--noir-ivory)" strokeWidth={2} />
        </svg>
        <figcaption className="mt-2 font-sans text-body-xs text-stone">
          Bean temperature over a typical roast. Shaded: development after first crack.
        </figcaption>
      </figure>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 60 84" className="h-16 w-12 shrink-0" aria-hidden>
            <ellipse cx="30" cy="42" rx="26" ry="38" fill={beanHex(roast)} />
            <path d="M30 6 C 22 24, 38 58, 30 78" fill="none" stroke="rgb(23 18 14 / 0.55)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div>
            <p className="font-display text-[1.75rem] leading-none text-strong">{level} roast</p>
            <RoastMeter roast={level} size="md" className="mt-2" />
          </div>
        </div>
        <StudioSlider
          label="Roast"
          value={roast}
          min={0}
          max={1}
          step={0.01}
          display={`${profile.drop}°C`}
          valueText={`${level} roast, dropped at ${profile.drop} degrees`}
          ends={["Light", "Dark"]}
          onChange={onChange}
          onCommit={onCommit}
        />
        <dl className="grid grid-cols-3 gap-3 border-t border-sand pt-4">
          {[
            ["Drop", `${profile.drop}°C`],
            ["Time", clock(profile.minutes)],
            ["Development", `${profile.development}%`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-micro text-stone uppercase">{k}</dt>
              <dd className="mt-1 font-sans text-body-sm font-semibold text-strong tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

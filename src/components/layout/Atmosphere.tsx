/**
 * Ambient page layers — paper grain, a warm wash of window light, and a few
 * dust motes drifting through it. Fixed, non-interactive, hidden from
 * assistive tech, and every layer stays under 8% opacity. Plain opacity (no
 * blend modes) keeps the layers cheap to composite while scrolling.
 */

// Deterministic positions so server and client render identically.
const MOTES = [
  { x: 12, y: 78, s: 2, dur: 22, delay: 0, dx: 60, dy: -160 },
  { x: 24, y: 34, s: 1.5, dur: 26, delay: 4, dx: -40, dy: -120 },
  { x: 38, y: 62, s: 2.5, dur: 30, delay: 9, dx: 50, dy: -200 },
  { x: 52, y: 22, s: 1.5, dur: 24, delay: 2, dx: 30, dy: -140 },
  { x: 63, y: 84, s: 2, dur: 28, delay: 12, dx: -60, dy: -180 },
  { x: 71, y: 46, s: 1.5, dur: 20, delay: 6, dx: 40, dy: -110 },
  { x: 83, y: 70, s: 2.5, dur: 32, delay: 15, dx: -30, dy: -220 },
  { x: 91, y: 28, s: 2, dur: 25, delay: 8, dx: -50, dy: -130 },
];

export function Atmosphere() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* Paper grain */}
      <div className="grain absolute inset-0 opacity-[0.05]" />

      {/* Warm sunlight falling from the upper left */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_8%_0%,rgb(232_168_104),transparent_70%)] opacity-[0.06]" />

      {/* Dust motes */}
      <div className="absolute inset-0 opacity-[0.07]">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="dust-mote"
            style={
              {
                left: `${m.x}%`,
                top: `${m.y}%`,
                "--s": `${m.s}px`,
                "--dur": `${m.dur}s`,
                "--delay": `${m.delay}s`,
                "--dx": `${m.dx}px`,
                "--dy": `${m.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

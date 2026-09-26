/**
 * Hero atmosphere — CSS-only layers that sit over the espresso film.
 * All hidden from assistive tech; all static under prefers-reduced-motion.
 */

/** Wisps positioned over the cup in the film, drifting upward on staggered loops. */
const WISPS = [
  { x: "44%", size: 220, dur: 11, delay: 0, drift: 18 },
  { x: "50%", size: 180, dur: 9, delay: 2.4, drift: -14 },
  { x: "47%", size: 260, dur: 13, delay: 4.8, drift: 26 },
  { x: "53%", size: 160, dur: 10, delay: 6.6, drift: -22 },
  { x: "41%", size: 200, dur: 12, delay: 8.2, drift: 10 },
];

export function HeroSteam() {
  return (
    // Peak wisp opacity × layer opacity stays under 8%.
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[36%] h-[62%] opacity-[0.08]">
      {WISPS.map((w, i) => (
        <span
          key={i}
          className="steam-wisp"
          style={
            {
              left: w.x,
              "--size": `${w.size}px`,
              "--dur": `${w.dur}s`,
              "--delay": `${w.delay}s`,
              "--drift": `${w.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Animated film grain — oversized noise tile jittered in steps. */
export function FilmGrain() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07] mix-blend-overlay">
      <div className="grain absolute -inset-[10%] motion-safe:animate-[grain-shift_0.9s_steps(4)_infinite]" />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useAtmosphere } from "@/lib/atmosphere";
import { usePagePath } from "@/i18n/client";
import { whenIdle, whenLoaded } from "@/lib/page-ready";

type Puff = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number };
type Drop = { x: number; y: number; len: number; speed: number };

const MAX_PUFFS = 90;
const DROPS = 80;

/** A soft cream puff, pre-rendered once and stamped for every particle. */
function makeSprite() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(248,244,236,1)");
  g.addColorStop(0.45, "rgba(248,244,236,0.45)");
  g.addColorStop(1, "rgba(248,244,236,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return c;
}

/**
 * AtmosphereCanvas — the engine's particle layer (phones only, lazy-loaded).
 *
 * Steam: on the home hero, puffs rise from the cup in the film. Scroll speed
 * feeds the emitter — a flick of the page sends a denser, quicker plume that
 * settles as you stop — and the plume thins as the hero is covered.
 * Rain: when rain mode is on, fine slanted streaks fall across every page;
 * scrolling leans them like wind.
 *
 * The canvas sits at 8% opacity, so no mark it draws can exceed that. The loop
 * only runs while something is visible and the tab is shown, starts once the
 * page has loaded and gone idle, and never reads layout inside a frame (the
 * scroll position comes from scroll events), so it cannot force a style or
 * layout pass per frame.
 */
export function AtmosphereCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePagePath();
  const { rain } = useAtmosphere();
  const live = useRef({ steam: pathname === "/", rain });
  useEffect(() => {
    live.current = { steam: pathname === "/", rain };
  }, [pathname, rain]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sprite = makeSprite();
    const puffs: Puff[] = [];
    let drops: Drop[] = [];
    let w = 0;
    let h = 0;
    let frame = 0;
    // Scroll position arrives with scroll events; reading it inside a frame could force layout.
    let scrollY = window.scrollY;
    let lastY = scrollY;
    let reported = -1;
    let started = false;
    let velocity = 0;
    let emit = 0;
    let frames = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      drops = Array.from({ length: DROPS }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 14 + Math.random() * 14,
        speed: 9 + Math.random() * 6,
      }));
    };
    resize();

    const tick = () => {
      frame = 0;
      const y = scrollY;
      velocity = velocity * 0.85 + (y - lastY) * 0.15;
      lastY = y;
      const speed = Math.min(Math.abs(velocity), 40);
      const { steam, rain } = live.current;
      const heroShown = steam && y < h * 0.9;
      ctx.clearRect(0, 0, w, h);

      // Steam — emitted from the cup (framed at ~48% on phones), fading as the hero is covered.
      if (heroShown) {
        emit += 0.18 + speed * 0.08;
        while (emit >= 1 && puffs.length < MAX_PUFFS) {
          emit -= 1;
          puffs.push({
            x: w * (0.48 + (Math.random() - 0.5) * 0.14),
            y: h * 0.62,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -(0.5 + Math.random() * 0.4 + speed * 0.04),
            r: 18 + Math.random() * 22,
            life: 0,
            max: 140 + Math.random() * 80,
          });
        }
        if (emit > 1) emit = 1;
      }
      const cover = Math.max(0, 1 - y / (h * 0.8));
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        p.x += p.vx + Math.sin((p.life + i * 13) * 0.03) * 0.25;
        p.y += p.vy - speed * 0.02;
        p.r += 0.22;
        if (p.life > p.max) {
          puffs.splice(i, 1);
          continue;
        }
        const t = p.life / p.max;
        ctx.globalAlpha = Math.sin(Math.PI * t) * 0.9 * cover;
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;

      // Rain — slant leans with scroll.
      if (rain) {
        const slant = 0.12 + Math.max(-0.4, Math.min(0.4, velocity * 0.01));
        ctx.strokeStyle = "rgba(226,232,238,0.9)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const d of drops) {
          d.y += d.speed;
          d.x += d.speed * slant;
          if (d.y > h) {
            d.y = -d.len;
            d.x = Math.random() * w;
          }
          if (d.x > w) d.x -= w;
          if (d.x < 0) d.x += w;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.len * slant, d.y - d.len);
        }
        ctx.stroke();
      }

      // Live particle count, for QA and devtools — written only when it changes, every 15th frame.
      if (++frames % 15 === 0 && puffs.length !== reported) {
        reported = puffs.length;
        canvas.dataset.particles = String(reported);
      }

      const busy = rain || heroShown || puffs.length > 0;
      if (busy && !document.hidden) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };

    const wake = () => {
      if (started && !frame && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      wake();
    };
    // Stay out of the way of the first load: begin once the page is loaded and idle.
    let cancelled = false;
    void whenLoaded()
      .then(() => whenIdle())
      .then(() => {
        if (cancelled) return;
        started = true;
        scrollY = lastY = window.scrollY;
        wake();
      });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", wake);
    const poke = window.setInterval(wake, 1000); // pick up rain / route changes while idle
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearInterval(poke);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full opacity-[0.08] md:hidden" />;
}

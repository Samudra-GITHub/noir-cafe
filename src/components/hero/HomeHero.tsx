"use client";

import { useEffect, useRef, useState } from "react";
import { m, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { BackgroundVideo, Button, Eyebrow } from "@/components/ui";
import { VIDEOS } from "@/constants/media";
import { RESERVE_HREF } from "@/constants/site";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { HERO_DELAYS, HERO_SCRUB_SCALE, PARALLAX_RANGE } from "@/lib/motion";
import { FilmGrain, HeroSteam } from "./HeroAtmosphere";
import { useI18n } from "@/i18n/client";

/**
 * Homepage hero — exactly one small-viewport tall, pinned beneath the page.
 * As the content scrolls up over it the film drifts (motion.parallax, −64px)
 * and scrubs in slightly, the copy lifts and fades, and the frame dims.
 * Render as the first child of a `relative` wrapper that also contains the
 * rest of the page, so the pin lasts until it is fully covered.
 */
export function HomeHero() {
  const { tr } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const safe = useMotionSafe();
  const [covered, setCovered] = useState(false);

  // The hero is pinned, so progress is measured against page scroll:
  // 0 → 1 as the content travels one hero-height and fully covers it.
  const height = useRef(900);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      height.current = el.offsetHeight || 900;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (v) => Math.min(Math.max(v / height.current, 0), 1));

  const filmY = useTransform(progress, [0, 1], safe ? [...PARALLAX_RANGE] : [0, 0]);
  const filmScale = useTransform(progress, [0, 1], safe ? [...HERO_SCRUB_SCALE] : [1.04, 1.04]);
  const copyY = useTransform(progress, [0, 0.6], safe ? [0, -72] : [0, 0]);
  const copyOpacity = useTransform(progress, [0, 0.55], safe ? [1, 0] : [1, 1]);
  const dim = useTransform(progress, [0, 1], [0, 0.6]);
  // Steam rises and thins as the page moves (most visible on the tall mobile frame).
  const steamY = useTransform(progress, [0, 1], safe ? [0, -180] : [0, 0]);
  const steamOpacity = useTransform(progress, [0, 0.7], safe ? [1, 0] : [1, 1]);

  useMotionValueEvent(progress, "change", (v) => setCovered(v >= 1));

  const enter = (step: number) => ({
    className: "hero-in",
    style: { "--hero-delay": HERO_DELAYS[step] } as React.CSSProperties,
  });

  return (
    <section
      ref={ref}
      data-nav-theme="dark"
      data-cursor="progress"
      data-cursor-scope="pinned"
      aria-labelledby="home-hero-title"
      className="sticky top-0 isolate h-dvh overflow-hidden bg-espresso text-beige md:h-svh"
      style={{ visibility: covered ? "hidden" : "visible" }}
    >
      <m.div className="absolute inset-x-0 top-0 -bottom-20" style={{ y: filmY, scale: filmScale }}>
        {/* On portrait phones the landscape film is framed on the espresso stream. */}
        <BackgroundVideo
          video={VIDEOS.heroEspresso}
          priority
          paused={covered}
          videoClassName="object-[48%_50%] md:object-center"
        />
      </m.div>

      {/* Warm scrim: heavier at the foot for the copy, lighter mid-frame. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.45)_0%,rgb(23_18_14/0.12)_30%,rgb(23_18_14/0.35)_60%,rgb(23_18_14/0.85)_100%)]"
      />
      {/* Warm vignette */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_42%,transparent_48%,rgb(60_36_21/0.55)_82%,rgb(23_18_14/0.8)_100%)]"
      />
      {/* Warm cast to sit the film in the espresso palette */}
      <div aria-hidden className="absolute inset-0 bg-walnut/15 mix-blend-multiply" />

      <m.div aria-hidden className="absolute inset-0" style={{ y: steamY, opacity: steamOpacity }}>
        <HeroSteam />
      </m.div>
      <FilmGrain />

      <m.div aria-hidden className="pointer-events-none absolute inset-0 bg-espresso" style={{ opacity: dim }} />

      <m.div
        className="container-page relative flex h-full flex-col justify-end pb-[calc(var(--dock-height)+40px+var(--safe-bottom))] md:pb-16"
        style={{ y: copyY, opacity: copyOpacity }}
      >
        <div {...enter(0)}>
          <Eyebrow tone="inverse" className="text-cream">{tr("Specialty coffee · New York")}</Eyebrow>
        </div>

        <h1 id="home-hero-title" className="type-display-2xl mt-[26px] max-w-[790px] font-normal text-beige">
          {/* Masked line reveal: the words rise into view without ever being
              transparent, so the headline paints (and counts as LCP) at once. */}
          <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
            <span {...enter(1)} className="hero-line block">{tr("Where Every Cup")}</span>
          </span>
          <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
            <span {...enter(2)} className="hero-line block">{tr("Tells A Story")}</span>
          </span>
        </h1>

        <p {...enter(3)} className="hero-in mt-5 max-w-[480px] font-sans text-body leading-[26px] text-cream md:mt-[26px]">{tr("Sourced with patience, roasted with restraint, and poured as a small act of attention.")}</p>

        {/* Phones: full-width stacked pills; desktop: side by side. */}
        <div {...enter(4)} className="hero-in mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap">
          <Button href={RESERVE_HREF} variant="inverse" className="max-md:w-full max-md:justify-between max-md:pe-6">{tr("Reserve table")}</Button>
          <Button href="/menu" variant="outline-inverse" className="max-md:w-full max-md:justify-between max-md:pe-6">{tr("Explore menu")}</Button>
        </div>
      </m.div>
    </section>
  );
}

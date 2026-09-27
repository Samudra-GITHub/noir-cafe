"use client";

import Image from "next/image";
import { useRef } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { Eyebrow } from "@/components/ui";
import { FilmGrain } from "@/components/hero/HeroAtmosphere";
import { STORY_HERO } from "@/data/story";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { HERO_DELAYS } from "@/lib/motion";

/**
 * Story hero — full-bleed editorial photograph (860px at desktop, one viewport
 * on small screens) under a warm scrim. The photo drifts slower than the page
 * (parallax) and the headline rises in on load.
 */
export function StoryHero() {
  const ref = useRef<HTMLElement>(null);
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], safe ? [0, 140] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], safe ? [1.04, 1.1] : [1.04, 1.04]);
  const step = (i: number) => ({ className: "hero-in", style: { "--hero-delay": HERO_DELAYS[i] } as React.CSSProperties });

  return (
    <section
      ref={ref}
      data-nav-theme="dark"
      aria-labelledby="story-hero-title"
      className="relative isolate h-svh min-h-[600px] overflow-hidden bg-espresso text-beige lg:h-[860px]"
    >
      <m.div className="absolute inset-0 -z-10" style={{ y, scale }}>
        <Image
          src={STORY_HERO.image}
          alt={STORY_HERO.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%]"
        />
      </m.div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(23_18_14/0.55)_0%,rgb(23_18_14/0.3)_35%,rgb(23_18_14/0.55)_70%,rgb(23_18_14/0.88)_100%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-walnut/20 mix-blend-multiply" />
      <FilmGrain />

      <div className="container-page flex h-full flex-col justify-end pb-12 md:pb-[58px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div {...step(0)}>
              <Eyebrow tone="inverse" className="text-cream">
                {STORY_HERO.eyebrow}
              </Eyebrow>
            </div>
            <h1
              id="story-hero-title"
              className="mt-[22px] font-display text-[clamp(2.75rem,1.4rem+4.6vw,5.5rem)] leading-[0.92] text-beige"
            >
              <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
                <span {...step(1)} className="hero-line block">
                  {STORY_HERO.title[0]}
                </span>
              </span>
              <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
                <span {...step(2)} className="hero-line block">
                  {STORY_HERO.title[1]}
                </span>
              </span>
            </h1>
          </div>
          <p {...step(3)} className="hero-in font-mono text-eyebrow text-cream uppercase lg:mb-1">
            {STORY_HERO.meta}
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useMotionValue, useSpring, type PanInfo } from "framer-motion";
import { FadeUp } from "@/components/motion/FadeUp";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { Button } from "@/components/ui";
import { MOST_LOVED } from "@/data/drinks";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { CAROUSEL_TILT, carouselSlide, tiltSpring } from "@/lib/motion";

const AUTOPLAY_MS = 6000;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * 03 · Most loved — split carousel. Image left (full bleed), espresso panel right.
 * motion.carousel: x ±56 · spring 120 / 20 with a slight 3D turn. The frame
 * can be flicked (drag with inertia) and tilts gently toward the pointer.
 * Autoplays; the caramel rule fills over each slide's dwell time and pauses on
 * hover, focus, or reduced motion.
 */

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 400;
export function MostLoved() {
  const safe = useMotionSafe();
  const [[index, direction], setSlide] = useState<[number, 1 | -1]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const total = MOST_LOVED.length;
  const slide = MOST_LOVED[index];
  const autoplay = safe && !paused;

  const go = useCallback(
    (dir: 1 | -1) => setSlide(([i]) => [(i + dir + total) % total, dir]),
    [total],
  );

  // Pointer tilt (springs keep it soft; zero under reduced motion).
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateY = useSpring(rawX, tiltSpring);
  const rotateX = useSpring(rawY, tiltSpring);
  const onTilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!safe || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2 * CAROUSEL_TILT);
    rawY.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * CAROUSEL_TILT);
  };
  const resetTilt = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby="loved-title"
      className="grid bg-espresso text-beige lg:min-h-[760px] lg:grid-cols-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden bg-espresso [perspective:1400px] lg:aspect-auto"
        onPointerMove={onTilt}
        onPointerLeave={resetTilt}
      >
        <m.div
          className="absolute inset-0 touch-pan-y [transform-style:preserve-3d] cursor-grab active:cursor-grabbing"
          style={{ rotateX, rotateY, scale: 1.04 }}
          drag={safe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          dragTransition={{ bounceStiffness: 220, bounceDamping: 26 }}
          onDragEnd={onDragEnd}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <m.div
              key={slide.image}
              custom={direction}
              variants={safe ? carouselSlide : undefined}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
              aria-roledescription="slide"
              aria-label={`${pad(index + 1)} of ${pad(total)}: ${slide.name}`}
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                draggable={false}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="pointer-events-none object-cover select-none"
              />
            </m.div>
          </AnimatePresence>
        </m.div>
      </div>

      <div className="flex flex-col justify-between gap-16 px-[var(--gutter)] pt-14 pb-16 lg:pt-[72px] lg:pr-[var(--gutter)] lg:pb-[135px] lg:pl-[72px]">
        <FadeUp className="max-w-[374px]">
          <SectionIntro
            id="loved-title"
            eyebrow="03 · Most loved"
            eyebrowTone="inverse"
            inverse
            gap="mt-[22px]"
            titleClassName="leading-[0.97]"
            title="The cups people return for."
          />
          <p className="mt-[15px] font-sans text-body-sm leading-[26px] text-cream">
            Espresso, milk, and patient technique. Discover the signatures that define our bar.
          </p>
        </FadeUp>

        <div className="w-full max-w-[373px]">
          <div className="flex items-start justify-between gap-6">
            <p aria-live="polite" className="pt-0.5 font-mono text-mono-sm text-beige uppercase">
              {pad(index + 1)} / {pad(total)} · {slide.name}
            </p>
            <Button variant="inverse" onClick={() => go(1)} aria-label={`Next drink: ${MOST_LOVED[(index + 1) % total].name}`}>
              Next
            </Button>
          </div>

          {/* Progress: completed slides, then the current slide's dwell filling in.
              The fill is a CSS animation, so hovering pauses it in place and the
              slide advances when it completes. */}
          <div className="relative mt-[22px] h-0.5 w-full overflow-hidden bg-char" aria-hidden>
            <div
              className="absolute inset-y-0 left-0 bg-caramel transition-[width] duration-700 ease-noir"
              style={{ width: `${(index / total) * 100}%` }}
            />
            <div
              key={index}
              className="absolute inset-y-0 origin-left bg-caramel shadow-[0_0_10px_rgb(168_106_60/0.8)]"
              style={{
                left: `${(index / total) * 100}%`,
                width: `${100 / total}%`,
                animation: safe ? `progress-fill ${AUTOPLAY_MS}ms linear both` : undefined,
                animationPlayState: autoplay ? "running" : "paused",
              }}
              onAnimationEnd={() => safe && go(1)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

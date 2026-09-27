"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { BackgroundVideo, Eyebrow } from "@/components/ui";
import { VIDEOS, type VideoAsset } from "@/constants/media";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { FilmGrain } from "./HeroAtmosphere";

type Chapter = { id: string; step: string; title: string; text: string; video: VideoAsset };

const CHAPTERS: Chapter[] = [
  {
    id: "origin",
    step: "Origin",
    title: "It begins as a seed.",
    text: "Smallholder lots, picked ripe and dried slowly at altitude.",
    video: VIDEOS.coffeeBeans,
  },
  {
    id: "brew",
    step: "Brew",
    title: "Water, measured.",
    text: "Ninety-three degrees, three pours, and patience between them.",
    video: VIDEOS.pourOver,
  },
  {
    id: "extract",
    step: "Extract",
    title: "Pressure, then honey.",
    text: "Eighteen grams in, thirty-six out, in twenty-eight seconds.",
    video: VIDEOS.heroEspresso,
  },
  {
    id: "pour",
    step: "Pour",
    title: "A steady hand.",
    text: "Microfoam folded into crema until the rosetta settles.",
    video: VIDEOS.latteArt,
  },
  {
    id: "cup",
    step: "The cup",
    title: "Served simply.",
    text: "Everything before it, held quietly in a single cup.",
    video: VIDEOS.perfectCup,
  },
];

/**
 * Preparation story — the homepage hero continues as a pinned, scroll-driven
 * film: five chapters of the coffee's preparation crossfade as the page
 * scrolls, with a caramel timeline marking progress. Only the chapter on
 * screen plays; the rest stay paused on their posters.
 */
export function PreparationStory() {
  const ref = useRef<HTMLElement>(null);
  const safe = useMotionSafe();
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(CHAPTERS.length - 1, Math.max(0, Math.floor(v * CHAPTERS.length)));
    setIndex((i) => (i === next ? i : next));
  });

  const chapter = CHAPTERS[index];

  return (
    <section
      ref={ref}
      data-nav-theme="dark"
      data-cursor="progress"
      aria-labelledby="preparation-title"
      className="relative bg-espresso text-beige"
      style={{ height: `${CHAPTERS.length * 90}svh` }}
    >
      <div className="sticky top-0 isolate h-svh overflow-hidden">
        {CHAPTERS.map((c, i) => (
          <div
            key={c.id}
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10 transition-opacity duration-[900ms] ease-noir",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <BackgroundVideo video={c.video} paused={i !== index} defer={i > index} />
          </div>
        ))}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(23_18_14/0.82)_0%,rgb(23_18_14/0.45)_45%,rgb(23_18_14/0.2)_100%)]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-walnut/15 mix-blend-multiply" />
        <FilmGrain />

        <div className="container-page flex h-full items-center">
          <div className="grid w-full gap-12 lg:grid-cols-[180px_1fr]">
            {/* Timeline */}
            <ol aria-label="Preparation" className="relative hidden flex-col gap-6 pl-6 lg:flex">
              <span aria-hidden className="absolute top-1 bottom-1 left-[3px] w-px bg-beige/15" />
              <motion.span
                aria-hidden
                className="absolute top-1 bottom-1 left-[3px] w-px origin-top bg-caramel"
                style={{ scaleY: progress }}
              />
              {CHAPTERS.map((c, i) => (
                <li
                  key={c.id}
                  aria-current={i === index ? "step" : undefined}
                  className={cn(
                    "relative font-mono text-eyebrow uppercase transition-colors duration-500",
                    i === index ? "text-beige" : i < index ? "text-cream/70" : "text-taupe",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1/2 -left-6 size-[7px] -translate-y-1/2 rounded-full border transition-colors duration-500",
                      i <= index ? "border-caramel bg-caramel" : "border-beige/30 bg-espresso",
                    )}
                  />
                  {String(i + 1).padStart(2, "0")} · {c.step}
                </li>
              ))}
            </ol>

            <div className="max-w-[620px]">
              <Eyebrow tone="accent-inverse" id="preparation-title">
                From seed to cup · {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
              </Eyebrow>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={chapter.id}
                  initial={safe ? { opacity: 0, y: 28, filter: "blur(6px)" } : false}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={safe ? { opacity: 0, y: -20, filter: "blur(6px)" } : undefined}
                  transition={ease(0.7)}
                  aria-live="polite"
                >
                  <h2 className="type-display-xl mt-5 text-beige">{chapter.title}</h2>
                  <p className="mt-6 max-w-[420px] font-sans text-body leading-[26px] text-cream">{chapter.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile progress rule */}
        <motion.span
          aria-hidden
          className="absolute right-0 bottom-0 left-0 h-px origin-left bg-caramel lg:hidden"
          style={{ scaleX: progress }}
        />
      </div>
    </section>
  );
}

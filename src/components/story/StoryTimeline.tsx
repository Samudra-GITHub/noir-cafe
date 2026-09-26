"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { BackgroundVideo } from "@/components/ui";
import { VIDEOS } from "@/constants/media";
import { STORY_TIMELINE } from "@/data/story";
import { useMotionSafe } from "@/hooks/useMotionSafe";

/**
 * Founding timeline — five milestones on a caramel rule that draws itself as
 * the section scrolls through. The café's ambience film plays faintly behind,
 * under a deep espresso wash (lazy-loaded, paused off screen).
 */
export function StoryTimeline() {
  const ref = useRef<HTMLElement>(null);
  const safe = useMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const draw = useTransform(scrollYProgress, [0, 1], safe ? [0, 1] : [1, 1]);

  return (
    <section
      ref={ref}
      aria-labelledby="timeline-title"
      className="relative isolate overflow-hidden bg-espresso py-20 text-beige lg:py-[120px]"
    >
      <BackgroundVideo video={VIDEOS.ambienceCafe} className="-z-10 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.7),rgb(23_18_14/0.55)_50%,rgb(23_18_14/0.85))]" />
      </BackgroundVideo>

      <div className="container-page">
        <SectionIntro
          id="timeline-title"
          eyebrow="The long conversation"
          eyebrowTone="accent-inverse"
          inverse
          gap="mt-5"
          title="Nine years, one table."
        />

        <div className="relative mt-16 lg:mt-20">
          {/* Rule: horizontal from lg, vertical below. */}
          <div aria-hidden className="absolute top-[5px] left-0 hidden h-px w-full bg-char lg:block" />
          <motion.div
            aria-hidden
            className="absolute top-[5px] left-0 hidden h-px w-full origin-left bg-caramel lg:block"
            style={{ scaleX: draw }}
          />
          <div aria-hidden className="absolute top-0 bottom-0 left-[5px] w-px bg-char lg:hidden" />
          <motion.div
            aria-hidden
            className="absolute top-0 bottom-0 left-[5px] w-px origin-top bg-caramel lg:hidden"
            style={{ scaleY: draw }}
          />

          <Stagger as="ol" className="relative grid gap-10 pl-8 lg:grid-cols-5 lg:gap-8 lg:pl-0">
              {STORY_TIMELINE.map((milestone) => (
                <StaggerItem as="li" key={milestone.year} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-0 -left-8 size-[11px] rounded-full border border-caramel bg-espresso lg:static lg:block"
                    />
                    <p className="font-mono text-eyebrow text-caramel-glow lg:mt-6">{milestone.year}</p>
                    <h3 className="mt-3 font-display text-heading-sm leading-[1.2]">{milestone.title}</h3>
                    <p className="mt-2 max-w-[220px] font-sans text-body-xs leading-[20.8px] text-cream">
                      {milestone.text}
                    </p>
                </StaggerItem>
              ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

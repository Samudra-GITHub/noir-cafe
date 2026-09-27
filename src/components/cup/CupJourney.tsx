"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Button, Eyebrow } from "@/components/ui";
import { LazyScene } from "@/components/three/LazyScene";
import { LATTE_ARTS, type LatteArt } from "@/components/three/art";
import { motionNeedsPermission, requestMotionPermission } from "@/components/three/useLook";
import { JOURNEY } from "@/data/journey";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/cn";
import { PageTitle } from "@/components/layout/PageTitle";

const loadJourney = () => import("@/components/three/JourneyScene");
const ART_NAME: Record<LatteArt, string> = { rosetta: "Rosetta", heart: "Heart", tulip: "Tulip" };
/** Reduced motion: no scroll-driven camera — hold the composed view of the cup. */
const STILL_VIEW = { current: 0.72 };

const pad = (n: number) => String(n).padStart(2, "0");

function useCompact() {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

/**
 * The 3D journey — five chapters, from seed to cup. A pinned WebGL stage is
 * driven by scroll: beans drift, gather and fall into the cup; the cup rises
 * with its steam; the camera settles over the latte art. The chapter copy is
 * real DOM text over the canvas, so it reads without WebGL too.
 */
export function CupJourney() {
  const safe = useMotionSafe();
  const compact = useCompact();
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(0);
  const [art, setArt] = useState<LatteArt>("rosetta");
  // iOS asks before sharing device tilt; offer the button until it is granted.
  const canAskMotion = useSyncExternalStore(() => () => {}, motionNeedsPermission, () => false);
  const [motionGranted, setMotionGranted] = useState(false);
  const needsMotion = canAskMotion && !motionGranted;

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
      progress.current = p;
      setChapter(Math.min(JOURNEY.length - 1, Math.floor(p * JOURNEY.length)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const nextArt = () => {
    feedback("add");
    setArt((a) => LATTE_ARTS[(LATTE_ARTS.indexOf(a) + 1) % LATTE_ARTS.length]);
  };

  const c = JOURNEY[chapter];

  return (
    <>
      <section
        ref={section}
        data-nav-theme="dark"
        aria-labelledby="cup-title"
        className="relative bg-espresso text-beige"
        style={{ height: `${JOURNEY.length * 100}svh` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          <LazyScene
            load={loadJourney}
            props={{ progress: safe ? progress : STILL_VIEW, art, onTap: nextArt, still: !safe, compact }}
            label={`A coffee cup in 3D — ${ART_NAME[art]} latte art, with steam rising`}
            className="absolute inset-0"
            fallback={
              <Image src="/videos/latte-art-poster.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
            }
          />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.55)_0%,transparent_30%,transparent_55%,rgb(23_18_14/0.85)_100%)]" />

          <div className="container-page pointer-events-none relative flex h-full flex-col justify-between pt-[calc(var(--safe-top)+112px)] pb-[calc(var(--dock-height)+44px+var(--safe-bottom))] md:pt-40 md:pb-16">
            <div>
              <Eyebrow tone="accent-inverse">From seed to cup · 3D</Eyebrow>
              <PageTitle>
                <h1 id="cup-title" className="type-display-lg mt-4 max-w-[560px] text-beige">
                  Five transformations. One expressive cup.
                </h1>
              </PageTitle>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div key={c.id} aria-live="polite" className="max-w-[440px] motion-safe:animate-[float-up_0.7s_var(--ease-noir)_both]">
                <p className="font-mono text-eyebrow text-caramel-glow uppercase">
                  {pad(chapter + 1)} / {pad(JOURNEY.length)} · {c.step}
                </p>
                <h2 className="mt-3 font-display text-[2.5rem] leading-[1] text-beige md:text-[3.25rem]">{c.title}</h2>
                <p className="mt-3 font-sans text-body-sm leading-[24px] text-cream">{c.text}</p>
              </div>

              <div className="pointer-events-auto flex flex-wrap items-center gap-3">
                <Button variant="outline-inverse" onClick={nextArt} aria-label={`Change the pour (now ${ART_NAME[art]})`}>
                  {ART_NAME[art]}
                </Button>
                {needsMotion && (
                  <Button
                    variant="outline-inverse"
                    arrow={false}
                    onClick={async () => {
                      if (await requestMotionPermission()) setMotionGranted(true);
                    }}
                  >
                    Tilt to look
                  </Button>
                )}
              </div>
            </div>

            {/* Chapter rail */}
            <ol aria-label="Chapters" className="absolute top-1/2 right-[var(--gutter)] hidden -translate-y-1/2 flex-col gap-3 md:flex">
              {JOURNEY.map((j, i) => (
                <li key={j.id} aria-current={i === chapter ? "step" : undefined} className="flex items-center justify-end gap-3">
                  <span className={cn("font-mono text-micro uppercase transition-opacity duration-500", i === chapter ? "text-beige opacity-100" : "text-taupe opacity-0")}>
                    {j.step}
                  </span>
                  <span className={cn("block h-px transition-all duration-500 ease-noir", i === chapter ? "w-10 bg-caramel" : "w-5 bg-beige/30")} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="cup-next" className="bg-espresso pb-[calc(var(--dock-height)+56px+var(--safe-bottom))] text-beige md:pb-32">
        <div className="container-page flex flex-col gap-8 border-t border-char pt-16 md:flex-row md:items-end md:justify-between md:pt-24">
          <div>
            <Eyebrow tone="accent-inverse">Brewing Lab</Eyebrow>
            <h2 id="cup-next" className="type-display-md mt-4 max-w-[520px] text-beige">
              {JOURNEY[JOURNEY.length - 1].text}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/brewing-lab/studio" variant="inverse">
              Build a recipe
            </Button>
            <Button href="/menu" variant="outline-inverse">
              Explore menu
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

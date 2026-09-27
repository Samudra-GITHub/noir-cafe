"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { ScrollZoom } from "@/components/motion/ScrollZoom";
import { HeroSteam } from "@/components/hero/HeroAtmosphere";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { BackgroundVideo, Button, Eyebrow } from "@/components/ui";
import { VIDEOS } from "@/constants/media";
import { BREW_METHODS, LAB_STEPS, formatClock, type BrewMethod } from "@/data/brewing";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { BrewTimer } from "./BrewTimer";
import { MobileBrewStory } from "./MobileBrewStory";
import { GrindIndicator, RoastRecommendation, TemperatureIndicator } from "./BrewIndicators";

const SAVED_KEY = "noir:saved-recipes";

/** Saved recipe ids, persisted per visitor. */
function useSavedRecipes() {
  const read = () => {
    try {
      return localStorage.getItem(SAVED_KEY) ?? "";
    } catch {
      return "";
    }
  };
  const raw = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      window.addEventListener("noir:saved", cb);
      return () => {
        window.removeEventListener("storage", cb);
        window.removeEventListener("noir:saved", cb);
      };
    },
    read,
    () => "",
  );
  const saved = raw ? raw.split(",") : [];
  const toggle = (id: string) => {
    const next = saved.includes(id) ? saved.filter((s) => s !== id) : [...saved, id];
    try {
      localStorage.setItem(SAVED_KEY, next.join(","));
    } catch {
      /* storage unavailable — the toggle simply won't persist */
    }
    window.dispatchEvent(new Event("noir:saved"));
  };
  return { saved, toggle };
}

/**
 * Brewing Lab experience — the pour-over film beside the live recipe card,
 * the five transformation cards, and an expandable guide to five brewing
 * methods. Opening a method makes it the live recipe.
 */
export function BrewingLab() {
  const [methodId, setMethodId] = useState(BREW_METHODS[0].id);
  const [openId, setOpenId] = useState<string | null>(BREW_METHODS[0].id);
  const [activeStep, setActiveStep] = useState(3);
  const method = BREW_METHODS.find((m) => m.id === methodId) ?? BREW_METHODS[0];

  const openMethod = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
    setMethodId(id);
  };

  return (
    <>
      <div className="container-page mt-12 grid gap-6 lg:mt-[68px] lg:grid-cols-[1fr_422px]">
        <FadeUp>
          <ScrollZoom subtle className="aspect-[850/560] rounded-xl bg-espresso max-lg:aspect-[4/3]">
            <BackgroundVideo video={VIDEOS.pourOver} className="rounded-xl" />
            <div aria-hidden className="absolute inset-0 bg-walnut/15 mix-blend-multiply" />
            <HeroSteam />
          </ScrollZoom>
        </FadeUp>
        <RecipePanel method={method} />
      </div>

      <div className="container-page">
        <hr className="mt-16 h-px border-0 bg-sand lg:mt-[96px]" />
        <Stagger
          as="ol"
          aria-label="Five transformations"
          className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-5"
        >
          {LAB_STEPS.map((step, i) => {
            const active = i === activeStep;
            return (
              <StaggerItem as="li" key={step.title}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "group/step flex min-h-[210px] w-full flex-col sm:h-[300px] rounded-md border p-6 text-left transition-[background-color,border-color,translate,box-shadow] duration-500 ease-noir",
                    "hover:-translate-y-1 hover:shadow-float",
                    active ? "border-caramel bg-cream" : "border-sand bg-surface hover:border-espresso/30",
                  )}
                >
                  <span className="flex items-center gap-[71px]">
                    <span
                      aria-hidden
                      className={cn(
                        "size-[11px] rounded-full transition-colors duration-500",
                        active ? "bg-caramel" : "bg-espresso",
                      )}
                    />
                    <span className="font-mono text-eyebrow text-caramel-ink">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="mt-[21px] font-display text-heading-md leading-[1.15] text-strong">{step.title}</span>
                  <span className="mt-[18px] font-mono text-[0.5625rem] text-stone">{step.spec}</span>
                  <span className="mt-auto font-sans text-[0.75rem] leading-[19px] text-strong">{step.text}</span>
                </button>
              </StaggerItem>
            );
          })}
        </Stagger>
        <p className="mt-[58px] font-mono text-eyebrow text-stone uppercase">
          Variables logged daily · Recipe v1.8
        </p>
      </div>

      <MobileBrewStory />

      <section aria-labelledby="methods-title" className="container-page mt-24 hidden md:block lg:mt-[120px]">
        <FadeUp className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro id="methods-title" eyebrow="Five methods" gap="mt-[15px]" title="Choose your ritual." />
          <p className="max-w-[380px] font-sans text-body-sm leading-[26px] text-stone">
            Each method changes the live recipe above. Start the timer and follow the pours in real time.
          </p>
        </FadeUp>

        <ul className="mt-12 border-t border-sand">
          {BREW_METHODS.map((m, i) => (
            <MethodRow
              key={m.id}
              method={m}
              index={i}
              open={openId === m.id}
              live={methodId === m.id}
              onToggle={() => openMethod(m.id)}
            />
          ))}
        </ul>
      </section>
    </>
  );
}

function RecipePanel({ method }: { method: BrewMethod }) {
  const safe = useMotionSafe();
  const { saved, toggle } = useSavedRecipes();
  const isSaved = saved.includes(method.id);
  const specs = [
    { label: "Dose", value: method.dose },
    { label: "Water", value: method.water },
    { label: "Temperature", value: `${method.temperatureC}°C` },
    { label: "Total time", value: formatClock(method.totalSeconds) },
  ];

  return (
    <section
      aria-labelledby="recipe-title"
      aria-live="polite"
      className="flex flex-col rounded-xl bg-espresso px-8 pt-[47px] pb-8 text-beige md:px-12 md:pb-12"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={method.id}
          initial={safe ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={safe ? { opacity: 0, y: -8 } : undefined}
          transition={ease(0.45)}
          className="flex flex-1 flex-col"
        >
          <Eyebrow tone="accent-inverse">Live recipe · {method.code}</Eyebrow>
          <h2 id="recipe-title" className="mt-1.5 font-display text-heading-xl leading-none">
            {method.coffee[0]}
            <br />
            {method.coffee[1]}
          </h2>
          <dl className="mt-12 lg:mt-[71px]">
            {specs.map((spec) => (
              <div key={spec.label} className="flex h-[42px] items-start justify-between border-t border-char pt-[13px]">
                <dt className="font-mono text-[0.5625rem] text-taupe">{spec.label}</dt>
                <dd className="font-mono text-mono-sm text-beige">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </AnimatePresence>
      <Button
        variant="inverse"
        fullWidth
        aria-pressed={isSaved}
        onClick={() => toggle(method.id)}
        className="mt-10 lg:mt-16"
      >
        {isSaved ? "Recipe saved" : "Save recipe"}
      </Button>
    </section>
  );
}

function MethodRow({
  method,
  index,
  open,
  live,
  onToggle,
}: {
  method: BrewMethod;
  index: number;
  open: boolean;
  live: boolean;
  onToggle: () => void;
}) {
  const safe = useMotionSafe();
  const panelId = `method-${method.id}`;
  return (
    <li className="border-b border-sand">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group/method grid w-full grid-cols-[40px_1fr_auto] items-center gap-4 py-6 text-left md:grid-cols-[72px_1fr_160px_120px_auto]"
        >
          <span className="font-mono text-eyebrow text-caramel-ink">{String(index + 1).padStart(2, "0")}</span>
          <span className="font-display text-heading-sm leading-[1.2] text-strong transition-transform duration-500 ease-noir group-hover/method:translate-x-1">
            {method.method}
          </span>
          <span className="hidden font-mono text-eyebrow text-stone uppercase md:block">{method.code}</span>
          <span className="hidden font-mono text-mono-sm text-stone md:block">
            {live ? <span className="text-caramel-ink">Live recipe</span> : formatClock(method.totalSeconds)}
          </span>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-full border border-sand text-strong transition-colors duration-300 group-hover/method:border-espresso"
          >
            {open ? <Minus className="size-3.5" strokeWidth={1.5} /> : <Plus className="size-3.5" strokeWidth={1.5} />}
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`${method.method} guide`}
            initial={safe ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={safe ? { height: 0, opacity: 0 } : undefined}
            transition={ease(0.6)}
            className="overflow-hidden"
          >
            <div className="grid gap-12 pt-2 pb-12 md:grid-cols-[72px_1fr_1fr] md:gap-x-4 lg:gap-x-16">
              <div className="hidden md:block" />
              <BrewTimer key={method.id} method={method} />
              <div className="flex flex-col gap-10">
                <GrindIndicator microns={method.grindMicrons} />
                <TemperatureIndicator celsius={method.temperatureC} />
                <RoastRecommendation roast={method.roast} note={method.roastNote} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

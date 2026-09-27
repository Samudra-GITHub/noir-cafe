"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { FadeUp, Stagger, StaggerItem } from "@/components/motion/FadeUp";
import { BackgroundVideo, Button, Eyebrow, StatusDot } from "@/components/ui";
import { VIDEOS } from "@/constants/media";
import { CAFES, directionsUrl, type Cafe } from "@/data/locations";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useOpenNow } from "@/hooks/useOpenNow";
import { ease, hoverLift } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Locations — an illustrated map of the three rooms beside the selected
 * café's panel (the flagship first, with the ambience film behind it), then
 * the three location cards. Pins, cards and the panel stay in sync.
 */
export function LocationsExperience() {
  const [activeId, setActiveId] = useState(CAFES[0].id);
  const active = CAFES.find((c) => c.id === activeId) ?? CAFES[0];

  return (
    <>
      <div className="container-page mt-12 grid gap-6 lg:mt-[61px] lg:grid-cols-[1fr_422px]">
        <FadeUp>
          <IllustratedMap activeId={activeId} onSelect={setActiveId} />
        </FadeUp>
        <CafePanel cafe={active} />
      </div>

      <Stagger as="ul" aria-label="Our cafés" className="container-page mt-16 grid gap-6 md:grid-cols-3 lg:mt-20">
        {CAFES.map((cafe) => (
          <StaggerItem as="li" key={cafe.id}>
            <LocationCard cafe={cafe} active={cafe.id === activeId} onSelect={() => setActiveId(cafe.id)} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}

/** Stylised map: a pin silhouette with an inner ring, three numbered markers. */
function IllustratedMap({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="relative aspect-[850/560] overflow-hidden rounded-xl bg-cream">
      <svg aria-hidden viewBox="0 0 850 560" className="absolute inset-0 size-full" fill="none">
        <path
          d="M425 513C330 420 142 330 142 233A283 187 0 1 1 708 233C708 330 520 420 425 513Z"
          stroke="var(--noir-sand)"
          strokeWidth="1"
        />
        <ellipse cx="424.5" cy="233" rx="107" ry="70" stroke="var(--noir-sand)" strokeWidth="1" />
      </svg>

      <ul aria-label="Map of Noir cafés">
        {CAFES.map((cafe) => (
          <li
            key={cafe.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cafe.pin.x}%`, top: `${cafe.pin.y}%` }}
          >
            <BeanMarker cafe={cafe} active={cafe.id === activeId} onSelect={() => onSelect(cafe.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Map marker — a 38px espresso disc that turns into a coffee bean on hover or focus. */
function BeanMarker({ cafe, active, onSelect }: { cafe: Cafe; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${cafe.index} · ${cafe.cardName}, ${cafe.shortAddress}`}
      className="group/pin relative grid size-11 place-items-center"
    >
      {/* Disc */}
      <span
        aria-hidden
        className={cn(
          "absolute size-[38px] rounded-full bg-espresso transition-[transform,opacity] duration-500 ease-noir",
          "group-hover/pin:scale-50 group-hover/pin:opacity-0 group-focus-visible/pin:scale-50 group-focus-visible/pin:opacity-0",
        )}
      />
      {/* Bean */}
      <svg
        aria-hidden
        viewBox="0 0 40 52"
        className={cn(
          "absolute h-[46px] w-[36px] -rotate-[24deg] scale-50 opacity-0 transition-[transform,opacity] duration-500 ease-noir",
          "group-hover/pin:rotate-[-18deg] group-hover/pin:scale-100 group-hover/pin:opacity-100",
          "group-focus-visible/pin:rotate-[-18deg] group-focus-visible/pin:scale-100 group-focus-visible/pin:opacity-100",
        )}
      >
        <ellipse cx="20" cy="26" rx="19" ry="25" fill="var(--noir-walnut)" />
        <path
          d="M20 3c-6 7-6 15 0 23s6 16 0 23"
          stroke="var(--noir-caramel)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {active && (
        <span aria-hidden className="absolute size-[54px] rounded-full border border-caramel motion-safe:animate-pulse" />
      )}
      <span className="relative font-mono text-[0.5625rem] text-beige transition-opacity duration-300 group-hover/pin:opacity-0 group-focus-visible/pin:opacity-0">
        {cafe.index}
      </span>
    </button>
  );
}

function CafePanel({ cafe }: { cafe: Cafe }) {
  const safe = useMotionSafe();
  const open = useOpenNow(cafe.opens, cafe.closes);
  const isFlagship = cafe.index === "01";

  return (
    <section
      aria-live="polite"
      aria-labelledby="cafe-panel-title"
      className="relative isolate flex flex-col overflow-hidden rounded-xl bg-espresso px-8 pt-[43px] pb-8 text-beige md:px-11 md:pb-11"
    >
      {/* Ambient film behind the flagship only. It fades in with CSS (so it
          paints before the motion runtime loads — it is this page's LCP on
          phones) and fades out with Motion. */}
      <AnimatePresence initial={false}>
        {isFlagship && (
          <m.div
            key="film"
            className="absolute inset-0 -z-10 motion-safe:animate-[fade-in_0.8s_var(--ease-noir)_both]"
            exit={{ opacity: 0 }}
            transition={ease(0.8)}
          >
            <BackgroundVideo video={VIDEOS.ambienceCafe} priority className="opacity-25">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_18_14/0.6),rgb(23_18_14/0.85))]" />
            </BackgroundVideo>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={cafe.id}
          initial={safe ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={safe ? { opacity: 0, y: -8 } : undefined}
          transition={ease(0.45)}
          className="flex flex-1 flex-col"
        >
          <Eyebrow tone="accent-inverse">
            {cafe.index} · {cafe.label}
          </Eyebrow>
          <h2 id="cafe-panel-title" className="mt-4 font-display text-heading-xl leading-[0.95]">
            {cafe.name[0]}
            <br />
            {cafe.name[1]}
          </h2>
          <address className="mt-[26px] font-sans text-body-xs leading-[22px] text-cream not-italic">
            {cafe.address[0]}
            <br />
            {cafe.address[1]}
          </address>
          <div className="mt-16 lg:mt-auto lg:pb-[108px]">
            <p className="flex items-center gap-2 font-mono text-micro text-taupe uppercase">
              <StatusDot tone={open ? "open" : "accent"} />
              {open ? "Open today" : "Closed now · opens"} {!open && cafe.opens}
            </p>
            <p className="mt-2 font-mono text-mono-sm text-beige">
              {cafe.opens} — {cafe.closes}
            </p>
          </div>
        </m.div>
      </AnimatePresence>

      <Button
        href={directionsUrl(cafe)}
        target="_blank"
        rel="noopener noreferrer"
        variant="inverse"
        fullWidth
        className="mt-10 lg:mt-0"
        aria-label={`Get directions to ${cafe.cardName} (opens in a new tab)`}
      >
        Get directions
      </Button>
    </section>
  );
}

function LocationCard({ cafe, active, onSelect }: { cafe: Cafe; active: boolean; onSelect: () => void }) {
  const safe = useMotionSafe();
  const open = useOpenNow(cafe.opens, cafe.closes);
  return (
    <m.article
      {...(safe ? hoverLift : {})}
      className={cn(
        "group/card relative overflow-hidden rounded-md border bg-surface transition-[border-color,box-shadow] duration-500 ease-noir",
        "focus-within:ring-2 focus-within:ring-caramel focus-within:ring-offset-2 focus-within:ring-offset-canvas",
        active ? "border-caramel shadow-card" : "border-sand hover:shadow-card",
      )}
    >
      <div className="relative aspect-[413/259] overflow-hidden bg-cream">
        <Image
          src={cafe.image}
          alt={cafe.imageAlt}
          fill
          sizes="(min-width: 1280px) 415px, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-[1.2s] ease-noir group-hover/card:scale-[1.05]"
        />
      </div>
      <div className="px-6 pt-[26px] pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-heading-step leading-[1.2] text-strong">
            <button
              type="button"
              onClick={onSelect}
              aria-pressed={active}
              className="text-left outline-none after:absolute after:inset-0 after:content-['']"
            >
              {cafe.cardName}
            </button>
          </h3>
          <span aria-hidden className="font-mono text-[0.5625rem] text-caramel-ink">
            {cafe.index}
          </span>
        </div>
        <p className="mt-[18px] font-sans text-body-xs text-stone">{cafe.shortAddress}</p>
        <div className="mt-[18px] flex items-center justify-between">
          <p className="flex items-center gap-2 font-mono text-micro text-stone uppercase">
            <StatusDot tone={open ? "open" : "accent"} />
            {open ? "Open" : "Closed"}
          </p>
          <p className="font-mono text-[0.5625rem] text-strong">
            <span className="sr-only">Hours </span>
            {cafe.opens}–{cafe.closes}
          </p>
        </div>
      </div>
    </m.article>
  );
}

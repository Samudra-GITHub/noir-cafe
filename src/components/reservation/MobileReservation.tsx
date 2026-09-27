"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Chip, Field } from "@/components/ui";
import {
  RESERVATION_DEFAULTS,
  RESERVATION_GUESTS,
  RESERVATION_TIMES,
  RESERVATION_VENUE,
  SEATING,
  type SeatingId,
} from "@/data/reservation";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { Calendar, LONG_DATE } from "./Calendar";
import { EMAIL, SEAT_SUMMARY, to12h, useToday } from "./ReservationExperience";

const STEPS = ["Date", "Time & guests", "Seating", "Details"] as const;
const SHORT_DATE = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

/**
 * Mobile reservation (below 768px) — Apple Wallet–style. A pass at the top
 * updates live while a four-step flow below collects the booking; on confirm
 * the pass lifts into its "requested" state. Not yet connected to a booking
 * service.
 */
export function MobileReservation() {
  const safe = useMotionSafe();
  const today = useToday();
  const titleId = useId();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [date, setDate] = useState(RESERVATION_DEFAULTS.date);
  const [time, setTime] = useState<string>(RESERVATION_DEFAULTS.time);
  const [guests, setGuests] = useState<string>(RESERVATION_DEFAULTS.guests);
  const [seating, setSeating] = useState<SeatingId>(RESERVATION_DEFAULTS.seating);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const confirm = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please add a name for the table";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address";
    setErrors(next);
    if (!Object.keys(next).length) {
      setDone(true);
      // The steps collapse away; bring the finished pass into view.
      requestAnimationFrame(() =>
        rootRef.current?.scrollIntoView({ behavior: safe ? "smooth" : "auto", block: "start" }),
      );
    }
  };

  return (
    <div ref={rootRef} className="container-page mt-8 scroll-mt-28 md:hidden">
      <Pass
        date={date}
        time={time}
        guests={guests}
        seating={seating}
        name={name}
        done={done}
      />

      {!done && (
        <section aria-labelledby={titleId} className="mt-8">
          {/* Step indicator */}
          <div className="flex items-baseline justify-between">
            <h2 id={titleId} className="font-display text-[2rem] leading-none text-strong">
              {STEPS[step]}
            </h2>
            <p className="font-mono text-eyebrow text-stone uppercase">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
          <div aria-hidden className="mt-4 grid grid-cols-4 gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={cn("h-0.5 rounded-full transition-colors duration-500", i <= step ? "bg-caramel" : "bg-sand")} />
            ))}
          </div>

          <div className="relative mt-6 overflow-hidden">
            {/* Enter-only step transition (no exit phase to wait on). */}
              <motion.div
                key={step}
                initial={safe ? { opacity: 0, x: dir * 48 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={ease(0.45)}
              >
                {step === 0 && (
                  <div className="rounded-xl bg-surface p-4 shadow-card">
                    <Calendar value={date} onChange={setDate} today={today.getTime() ? today : new Date(0)} labelledBy={titleId} />
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-8">
                    <fieldset>
                      <legend className="font-mono text-micro text-stone uppercase">Time</legend>
                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        {RESERVATION_TIMES.map((t) => (
                          <Chip key={t} size="lg" selected={time === t} onClick={() => setTime(t)} className="h-12 w-full text-[0.6875rem]">
                            {to12h(t)}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="font-mono text-micro text-stone uppercase">Guests</legend>
                      <div className="mt-3 grid grid-cols-4 gap-2.5">
                        {RESERVATION_GUESTS.map((g) => (
                          <Chip
                            key={g}
                            size="lg"
                            selected={guests === g}
                            onClick={() => setGuests(g)}
                            aria-label={g === "4+" ? "4 or more guests" : `${g} ${g === "1" ? "guest" : "guests"}`}
                            className="h-12 w-full min-w-0 px-0 text-[0.75rem]"
                          >
                            {g}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {step === 2 && (
                  <div role="radiogroup" aria-label="Seating" className="flex flex-col gap-3">
                    {SEATING.map((option) => {
                      const checked = seating === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          onClick={() => setSeating(option.id)}
                          className={cn(
                            "group/seat relative isolate h-[132px] overflow-hidden rounded-xl text-left text-beige ring-offset-2 ring-offset-canvas transition-shadow duration-300",
                            checked && "ring-2 ring-caramel",
                          )}
                        >
                          <Image
                            src={option.image}
                            alt=""
                            fill
                            sizes="100vw"
                            className={cn("-z-10 object-cover transition-transform duration-700 ease-noir", checked ? "scale-105" : "scale-100")}
                          />
                          <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(23_18_14/0.85),rgb(23_18_14/0.2))]" />
                          <span className="absolute bottom-4 left-5">
                            <span className="block font-display text-[1.75rem] leading-none">{option.label}</span>
                            <span className="mt-1.5 block font-mono text-micro text-cream uppercase">{option.detail}</span>
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "absolute top-4 right-4 grid size-6 place-items-center rounded-full border border-beige/70 transition-colors",
                              checked && "border-caramel bg-caramel",
                            )}
                          >
                            <span className={cn("size-2 rounded-full bg-beige transition-transform", checked ? "scale-100" : "scale-0")} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-4">
                    <Field
                      label="Guest name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
                      }}
                      error={errors.name}
                    />
                    <Field
                      label="Email address"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                      }}
                      error={errors.email}
                    />
                  </div>
                )}
              </motion.div>
          </div>

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button variant="secondary" arrow={false} onClick={() => go(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => go(step + 1)} className="flex-[2] justify-between pr-6">
                Continue
              </Button>
            ) : (
              <Button variant="accent" onClick={confirm} className="flex-[2] justify-between pr-6">
                Confirm
              </Button>
            )}
          </div>
          <p className="mt-5 text-center font-mono text-micro text-stone uppercase">{RESERVATION_VENUE.note}</p>
        </section>
      )}
    </div>
  );
}

/** The Wallet-style pass — live summary above, a torn perforation, and a code strip. */
function Pass({
  date,
  time,
  guests,
  seating,
  name,
  done,
}: {
  date: Date;
  time: string;
  guests: string;
  seating: SeatingId;
  name: string;
  done: boolean;
}) {
  const safe = useMotionSafe();
  const rows = [
    { label: "Date", value: SHORT_DATE.format(date) },
    { label: "Time", value: to12h(time) },
    { label: "Guests", value: guests === "4+" ? "4+" : guests },
    { label: "Seat", value: SEAT_SUMMARY[seating].replace(" table", "") },
  ];
  return (
    <motion.section
      aria-label="Your reservation pass"
      aria-live="polite"
      layout={safe}
      transition={ease(0.6)}
      className="relative isolate overflow-hidden rounded-2xl bg-espresso text-beige shadow-[0_24px_60px_-20px_rgb(23_18_14/0.55)]"
    >
      {/* Stacked-pass edge */}
      <span aria-hidden className="absolute inset-x-5 -top-2 -z-10 h-4 rounded-t-2xl bg-walnut" />
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <p className="font-mono text-micro text-caramel-glow uppercase">{done ? "Requested" : RESERVATION_VENUE.eyebrow}</p>
          <p className="mt-2 font-display text-[1.75rem] leading-[1.05]">
            {RESERVATION_VENUE.name[0]}
            <br />
            {RESERVATION_VENUE.name[1]}
          </p>
        </div>
        <span aria-hidden className="grid size-11 place-items-center rounded-full border border-beige/30">
          <span className="size-5 rounded-full border border-beige/80" />
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-4 gap-2 px-6">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="font-mono text-micro text-taupe uppercase">{r.label}</dt>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.dd
                key={r.value}
                initial={safe ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={safe ? { opacity: 0, y: -8 } : undefined}
                transition={ease(0.35)}
                className="mt-1 font-sans text-[0.8125rem] font-medium"
              >
                {r.value}
              </motion.dd>
            </AnimatePresence>
          </div>
        ))}
      </dl>

      {/* Perforation */}
      <div aria-hidden className="relative mt-6 h-6">
        <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-canvas" />
        <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-canvas" />
        <span className="absolute inset-x-6 top-1/2 border-t border-dashed border-beige/20" />
      </div>

      <div className="flex items-center justify-between gap-4 px-6 pt-1 pb-6">
        <div>
          <p className="font-mono text-micro text-taupe uppercase">Guest</p>
          <p className="mt-1 font-sans text-[0.8125rem]">{name.trim() || "—"}</p>
        </div>
        {/* Decorative code strip, not a scannable code. */}
        <span aria-hidden className="flex h-10 items-end gap-[3px]">
          {[3, 7, 4, 9, 5, 8, 3, 6, 9, 4, 7, 5, 8, 3, 6].map((h, i) => (
            <span
              key={i}
              className={cn("w-[3px] rounded-full", done ? "bg-caramel" : "bg-beige/40")}
              style={{ height: `${h * 10}%` }}
            />
          ))}
        </span>
      </div>

      {done && (
        <motion.p
          role="status"
          initial={safe ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={ease(0.5, 0.2)}
          className="border-t border-char px-6 py-5 font-sans text-body-xs text-cream"
        >
          Thank you, {name.trim().split(" ")[0]}. Your table for {LONG_DATE.format(date)} at {to12h(time)} is requested. We look forward to seeing you.
        </motion.p>
      )}
    </motion.section>
  );
}

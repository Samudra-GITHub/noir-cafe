"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button, Chip, Eyebrow, Field } from "@/components/ui";
import {
  RESERVATION_DEFAULTS,
  RESERVATION_GUESTS,
  RESERVATION_TIMES,
  RESERVATION_VENUE,
  SEATING,
  type SeatingId,
} from "@/data/reservation";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { checkDraw, ease, shake, successReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { feedback } from "@/lib/feedback";
import { Calendar, LONG_DATE } from "./Calendar";

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Today's date on the client; 0 (no restriction) during SSR and hydration. */
export function useToday() {
  const ms = useSyncExternalStore(
    () => () => {},
    () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    },
    () => 0,
  );
  return new Date(ms);
}

export const to12h = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export const SEAT_SUMMARY: Record<SeatingId, string> = {
  window: "Window table",
  indoor: "Long oak table",
  outdoor: "Terrace table",
};

type Errors = Partial<Record<"name" | "email" | "date", string>>;

function StepTitle({ id, index, children }: { id: string; index: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-heading-sm leading-[1.2] text-strong">
      {index} · {children}
    </h2>
  );
}

/**
 * Reservation experience — date, time, guests, seating and contact details on
 * the left; a live summary on the right that updates as choices change.
 * Validated on the client; not yet connected to a booking service.
 */
export function ReservationExperience() {
  const today = useToday();
  const safe = useMotionSafe();
  const ids = { date: useId(), time: useId(), guests: useId(), seating: useId(), details: useId() };
  const [date, setDate] = useState(RESERVATION_DEFAULTS.date);
  const [time, setTime] = useState<string>(RESERVATION_DEFAULTS.time);
  const [guests, setGuests] = useState<string>(RESERVATION_DEFAULTS.guests);
  const [seating, setSeating] = useState<SeatingId>(RESERVATION_DEFAULTS.seating);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [requested, setRequested] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = "Please add a name for the table";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address";
    if (today.getTime() && date < today) next.date = "Choose a date from today onward";
    return next;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      if (safe && formRef.current) {
        const target = formRef.current.querySelector<HTMLElement>("[aria-invalid='true']");
        if (target) shake(target);
        target?.focus();
      }
      return;
    }
    setRequested(true);
    feedback("confirm");
  };

  const summary = [
    { label: "Date", value: LONG_DATE.format(date) },
    { label: "Time", value: to12h(time) },
    { label: "Guests", value: guests === "4+" ? "4 or more" : `${guests} ${guests === "1" ? "person" : "people"}` },
    { label: "Seating", value: SEAT_SUMMARY[seating] },
  ];

  return (
    <div className="container-page mt-10 hidden items-start gap-6 md:grid lg:mt-[61px] lg:grid-cols-[1fr_422px]">
      <FadeUp>
        <form
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          aria-label="Reserve a table"
          className="rounded-2xl bg-surface p-6 shadow-card md:p-10"
        >
          <section aria-labelledby={ids.date}>
            <div className="flex items-start justify-between">
              <StepTitle id={ids.date} index="01">
                Choose a date
              </StepTitle>
            </div>
            <div className="mt-3 md:-mt-8">
              <Calendar
                value={date}
                today={today.getTime() ? today : new Date(0)}
                labelledBy={ids.date}
                onChange={(d) => {
                  setDate(d);
                  setErrors((er) => ({ ...er, date: undefined }));
                }}
              />
            </div>
            {errors.date && <p className="mt-2 font-mono text-[0.5625rem] text-caramel-ink">{errors.date}</p>}
          </section>

          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-6 lg:mt-[51px]">
            <fieldset aria-labelledby={ids.time}>
              <StepTitle id={ids.time} index="02">
                Time
              </StepTitle>
              <div className="mt-[15px] grid grid-cols-4 gap-[9px]">
                {RESERVATION_TIMES.map((t) => (
                  <Chip key={t} size="lg" selected={time === t} onClick={() => setTime(t)} className="w-full min-w-0 px-0">
                    {t}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset aria-labelledby={ids.guests}>
              <StepTitle id={ids.guests} index="03">
                Guests
              </StepTitle>
              <div className="mt-[15px] grid grid-cols-4 gap-[9px]">
                {RESERVATION_GUESTS.map((g) => (
                  <Chip
                    key={g}
                    size="lg"
                    selected={guests === g}
                    onClick={() => setGuests(g)}
                    aria-label={g === "4+" ? "4 or more guests" : `${g} ${g === "1" ? "guest" : "guests"}`}
                    className="w-full min-w-0 px-0"
                  >
                    {g}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset aria-labelledby={ids.seating} className="mt-12 lg:mt-[43px]">
            <StepTitle id={ids.seating} index="04">
              Seating
            </StepTitle>
            <div role="radiogroup" aria-labelledby={ids.seating} className="mt-[17px] grid gap-[13px] sm:grid-cols-3">
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
                      "group/seat flex h-16 items-start justify-between rounded-sm border px-4 pt-[13px] text-left transition-[background-color,border-color,translate] duration-300 ease-noir hover:-translate-y-0.5",
                      checked ? "border-caramel bg-cream" : "border-sand bg-surface hover:border-espresso/40",
                    )}
                  >
                    <span>
                      <span className="block font-sans text-body-xs font-semibold text-strong">{option.label}</span>
                      <span className="mt-0.5 block font-mono text-[0.5625rem] text-stone">{option.detail}</span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 grid size-3 place-items-center rounded-full border transition-colors duration-300",
                        checked ? "border-caramel" : "border-caramel/70",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full bg-caramel transition-transform duration-300 ease-noir",
                          checked ? "scale-100" : "scale-0",
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset aria-labelledby={ids.details} className="mt-12">
            <StepTitle id={ids.details} index="05">
              Details
            </StepTitle>
            <div className="mt-[17px] grid gap-4 sm:grid-cols-2">
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
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                }}
                error={errors.email}
              />
            </div>
          </fieldset>

          {/* Small screens: the confirm action lives with the form. */}
          <Button type="submit" variant="accent" fullWidth className="mt-10 lg:hidden">
            Confirm reservation
          </Button>
        </form>
      </FadeUp>

      <aside
        aria-label="Reservation summary"
        className="rounded-2xl bg-espresso p-6 text-beige md:p-9 lg:sticky lg:top-[132px]"
      >
        <Eyebrow tone="inverse" className="text-cream">
          {RESERVATION_VENUE.eyebrow}
        </Eyebrow>
        <h2 className="mt-[21px] font-display text-[2.25rem] leading-[1.28]">
          {RESERVATION_VENUE.name[0]}
          <br />
          {RESERVATION_VENUE.name[1]}
        </h2>
        <div className="relative mt-[31px] aspect-[349/219] overflow-hidden rounded-md">
          <Image
            src={RESERVATION_VENUE.image}
            alt={RESERVATION_VENUE.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 350px, 100vw"
            className="object-cover"
          />
        </div>

        <dl aria-live="polite" className="mt-8">
          {summary.map((row) => (
            <div key={row.label} className="flex h-[39px] items-center justify-between border-t border-char">
              <dt className="font-mono text-micro text-taupe">{row.label}</dt>
              <AnimatePresence mode="popLayout" initial={false}>
                <m.dd
                  key={row.value}
                  initial={safe ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={safe ? { opacity: 0, y: -6 } : undefined}
                  transition={ease(0.35)}
                  className="font-sans text-[0.75rem] text-beige"
                >
                  {row.value}
                </m.dd>
              </AnimatePresence>
            </div>
          ))}
        </dl>

        <AnimatePresence mode="wait" initial={false}>
          {requested ? (
            <m.div
              key="requested"
              role="status"
              variants={safe ? successReveal : undefined}
              initial="hidden"
              animate="visible"
              className="mt-12 flex items-start gap-3 rounded-md border border-char p-4"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0 text-caramel-glow">
                <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <m.path
                  d="M6 10.4 8.7 13 14 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={safe ? checkDraw : undefined}
                  initial="hidden"
                  animate="visible"
                />
              </svg>
              <p className="font-sans text-body-xs text-cream">
                Thank you, {name.trim().split(" ")[0]}. Your table for {LONG_DATE.format(date)} at {to12h(time)} is
                requested. We look forward to seeing you.
              </p>
            </m.div>
          ) : (
            <m.div key="confirm" exit={safe ? { opacity: 0 } : undefined}>
              <Button
                type="button"
                variant="accent"
                fullWidth
                className="mt-12 hidden lg:inline-flex"
                onClick={() => formRef.current?.requestSubmit()}
              >
                Confirm reservation
              </Button>
            </m.div>
          )}
        </AnimatePresence>
        <p className="mt-9 text-center font-mono text-micro text-taupe uppercase">{RESERVATION_VENUE.note}</p>
      </aside>
    </div>
  );
}

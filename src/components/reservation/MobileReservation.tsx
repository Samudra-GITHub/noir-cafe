"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { Button, Chip, Field } from "@/components/ui";
import {
  RESERVATION_DEFAULTS,
  RESERVATION_GUESTS,
  RESERVATION_TIMES,
  RESERVATION_VENUE,
  SEATING,
  RESERVATION_CAFE,
  TABLE_MINUTES,
  guestCount,
  isoDay,
  type SeatingId,
} from "@/data/reservation";
import { reservationIcs } from "@/lib/ics";
import { ReservationQR, downloadIcs } from "./ReservationQR";
import { SeatMap } from "./SeatMap";
import { useBooking } from "./useBooking";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { Calendar } from "./Calendar";
import { LONG_DATE } from "@/i18n/format";
import { feedback } from "@/lib/feedback";
import { EMAIL, SEAT_SUMMARY, useToday } from "./ReservationExperience";
import { useFormat, useI18n } from "@/i18n/client";

const STEPS = ["Date", "Time & guests", "Seating", "Details"] as const;

/**
 * Mobile reservation (below 768px) — Apple Wallet–style. A pass at the top
 * updates live while a four-step flow below collects the booking; on confirm
 * the table is booked through /api/reservations (live availability per time
 * and seating area) and the pass is issued — Wallet-style — with its QR code.
 */
export function MobileReservation() {
  const { tr } = useI18n();
  const format = useFormat();
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
  const booking = useBooking(isoDay(date));
  const covers = guestCount(guests);

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const confirm = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please add a name for the table";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address";
    setErrors(next);
    if (Object.keys(next).length) return;
    const booked = await booking.book({ day: isoDay(date), time, guests, seating, name: name.trim(), email: email.trim() });
    if (booked) {
      setDone(true);
      feedback("confirm");
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
        code={booking.booked?.code}
        demo={booking.booked ? !booking.booked.persisted : false}
      />

      {done && booking.booked && (
        <div className="mt-4 flex flex-col gap-3">
          <Button
            variant="secondary"
            arrow={false}
            fullWidth
            onClick={() =>
              downloadIcs(
                `noir-cafe-${booking.booked!.code}.ics`,
                reservationIcs({
                  code: booking.booked!.code,
                  day: booking.booked!.day,
                  time,
                  minutes: TABLE_MINUTES,
                  guests,
                  seating: SEAT_SUMMARY[seating],
                  name: name.trim(),
                  venue: RESERVATION_VENUE.name.join(" · "),
                  address: RESERVATION_CAFE.address,
                }),
              )
            }
          >{tr("Add to calendar")}</Button>
          <p className="text-center font-sans text-body-xs text-stone">
            {booking.emailed ? tr("A confirmation is on its way to {email}.", { email: email.trim() }) : tr("Show this pass at the host stand.")}
          </p>
        </div>
      )}

      {!done && (
        <section aria-labelledby={titleId} className="mt-8">
          {/* Step indicator */}
          <div className="flex items-baseline justify-between">
            <h2 id={titleId} className="font-display text-[2rem] leading-none text-strong">
              {tr(STEPS[step])}
            </h2>
            <p className="font-mono text-eyebrow text-stone uppercase">{tr("Step {n} of {total}", { n: step + 1, total: STEPS.length })}
            </p>
          </div>
          <div aria-hidden className="mt-4 grid grid-cols-4 gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={cn("h-0.5 rounded-full transition-colors duration-500", i <= step ? "bg-caramel" : "bg-sand")} />
            ))}
          </div>

          <div className="relative mt-6 overflow-hidden">
            {/* Enter-only step transition (no exit phase to wait on). */}
              <m.div
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
                      <legend className="font-mono text-micro text-stone uppercase">{tr("Time")}</legend>
                      <div className="mt-3 grid grid-cols-2 gap-2.5">
                        {RESERVATION_TIMES.map((t) => (
                          <Chip
                            key={t}
                            size="lg"
                            selected={time === t}
                            disabled={!booking.timeOpen(t, guests)}
                            onClick={() => setTime(t)}
                            className="h-12 w-full text-[0.6875rem] disabled:opacity-40"
                          >
                            {format.time(t)}
                            {!booking.timeOpen(t, guests) && <span className="ms-1.5 text-stone">{tr("· Full")}</span>}
                          </Chip>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="font-mono text-micro text-stone uppercase">{tr("Guests")}</legend>
                      <div className="mt-3 grid grid-cols-4 gap-2.5">
                        {RESERVATION_GUESTS.map((g) => (
                          <Chip
                            key={g}
                            size="lg"
                            selected={guests === g}
                            onClick={() => setGuests(g)}
                            aria-label={g === "4+" ? tr("4 or more guests") : g === "1" ? tr("1 guest") : tr("{n} guests", { n: g })}
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
                  <div className="flex flex-col gap-4">
                  <SeatMap selected={seating} onSelect={setSeating} left={(id) => booking.left(time, id)} covers={covers} className="rounded-xl bg-surface p-3 shadow-card" />
                  <div role="radiogroup" aria-label={tr("Seating")} className="flex flex-col gap-3">
                    {SEATING.map((option) => {
                      const checked = seating === option.id;
                      const left = booking.left(time, option.id);
                      const full = left != null && left < covers;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={checked}
                          aria-disabled={full || undefined}
                          onClick={() => !full && setSeating(option.id)}
                          className={cn(
                            full && "opacity-50",
                            "group/seat relative isolate h-[132px] overflow-hidden rounded-xl text-start text-beige ring-offset-2 ring-offset-canvas transition-shadow duration-300",
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
                          <span className="absolute bottom-4 inset-s-5">
                            <span className="block font-display text-[1.75rem] leading-none">{tr(option.label)}</span>
                            <span className="mt-1.5 block font-mono text-micro text-cream uppercase">
                              {tr(option.detail)}
                              {left != null && <> · {full ? tr("Full") : left === 1 ? tr("1 seat left") : tr("{n} seats left", { n: left })}</>}
                            </span>
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "absolute top-4 inset-e-4 grid size-6 place-items-center rounded-full border border-beige/70 transition-colors",
                              checked && "border-caramel bg-caramel",
                            )}
                          >
                            <span className={cn("size-2 rounded-full bg-beige transition-transform", checked ? "scale-100" : "scale-0")} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-4">
                    <Field
                      label={tr("Guest name")}
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
                      }}
                      error={errors.name && tr(errors.name)}
                    />
                    <Field
                      label={tr("Email address")}
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                      }}
                      error={errors.email && tr(errors.email)}
                    />
                  </div>
                )}
              </m.div>
          </div>

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <Button variant="secondary" arrow={false} onClick={() => go(step - 1)} className="flex-1">{tr("Back")}</Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => go(step + 1)} className="flex-[2] justify-between pe-6">{tr("Continue")}</Button>
            ) : (
              <Button variant="accent" onClick={() => void confirm()} disabled={booking.status === "sending"} className="flex-[2] justify-between pe-6">
                {booking.status === "sending" ? tr("Booking…") : tr("Confirm")}
              </Button>
            )}
          </div>
          {booking.error && (
            <p role="alert" className="mt-4 font-sans text-body-sm text-caramel-ink">
              {tr(booking.error)}
            </p>
          )}
          <p className="mt-5 text-center font-mono text-micro text-stone uppercase">{tr(RESERVATION_VENUE.note)}</p>
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
  code,
  demo,
}: {
  date: Date;
  time: string;
  guests: string;
  seating: SeatingId;
  name: string;
  done: boolean;
  code?: string;
  demo?: boolean;
}) {
  const { tr } = useI18n();
  const format = useFormat();
  const safe = useMotionSafe();
  const rows = [
    { label: tr("Date"), value: format.date(date, { weekday: "short", month: "short", day: "numeric" }) },
    { label: tr("Time"), value: format.time(time) },
    { label: tr("Guests"), value: guests === "4+" ? "4+" : guests },
    { label: tr("Seat"), value: tr(SEAT_SUMMARY[seating].replace(" table", "")) },
  ];
  return (
    <m.section
      aria-label={tr("Your reservation pass")}
      aria-live="polite"
      layout={safe}
      transition={ease(0.6)}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-espresso text-beige shadow-[0_24px_60px_-20px_rgb(23_18_14/0.55)]",
        code && "pass-issued",
      )}
    >
      {/* Stacked-pass edge */}
      <span aria-hidden className="absolute inset-x-5 -top-2 -z-10 h-4 rounded-t-2xl bg-walnut" />
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <p className="font-mono text-micro text-caramel-glow uppercase">{code ? (demo ? tr("Booked · demo") : tr("Booked")) : done ? tr("Requested") : tr(RESERVATION_VENUE.eyebrow)}</p>
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
              <m.dd
                key={r.value}
                initial={safe ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={safe ? { opacity: 0, y: -8 } : undefined}
                transition={ease(0.35)}
                className="mt-1 font-sans text-[0.8125rem] font-medium"
              >
                {r.value}
              </m.dd>
            </AnimatePresence>
          </div>
        ))}
      </dl>

      {/* Perforation */}
      <div aria-hidden className="relative mt-6 h-6">
        <span className="absolute top-1/2 -inset-s-3 size-6 -translate-y-1/2 rounded-full bg-canvas" />
        <span className="absolute top-1/2 -inset-e-3 size-6 -translate-y-1/2 rounded-full bg-canvas" />
        <span className="absolute inset-x-6 top-1/2 border-t border-dashed border-beige/20" />
      </div>

      <div className="flex items-center justify-between gap-4 px-6 pt-1 pb-6">
        <div>
          <p className="font-mono text-micro text-taupe uppercase">{tr("Guest")}</p>
          <p className="mt-1 font-sans text-[0.8125rem]">{name.trim() || "—"}</p>
        </div>
        {code ? (
          <div className="text-end">
            <p className="font-mono text-micro text-taupe uppercase">{tr("Reservation")}</p>
            <p className="mt-1 font-mono text-eyebrow tracking-[0.12em]">{code}</p>
          </div>
        ) : (
        /* Decorative code strip until the pass is issued. */
        <span aria-hidden className="flex h-10 items-end gap-[3px]">
          {[3, 7, 4, 9, 5, 8, 3, 6, 9, 4, 7, 5, 8, 3, 6].map((h, i) => (
            <span
              key={i}
              className={cn("w-[3px] rounded-full", done ? "bg-caramel" : "bg-beige/40")}
              style={{ height: `${h * 10}%` }}
            />
          ))}
        </span>
        )}
      </div>

      {code && (
        <m.div
          initial={safe ? { height: 0, opacity: 0 } : false}
          animate={{ height: "auto", opacity: 1 }}
          transition={ease(0.7, 0.35)}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-5 border-t border-char px-6 py-6">
            <ReservationQR code={code} className="size-28 shrink-0" />
            <p className="font-sans text-body-xs text-cream">{tr("Show this code at the host stand — we’ll take you straight to your table.")}</p>
          </div>
        </m.div>
      )}

      {done && (
        <m.p
          role="status"
          initial={safe ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={ease(0.5, 0.2)}
          className="border-t border-char px-6 py-5 font-sans text-body-xs text-cream"
        >
          {tr(code ? "Thank you, {name}. Your table for {date} at {time} is booked. We look forward to seeing you." : "Thank you, {name}. Your table for {date} at {time} is requested. We look forward to seeing you.", { name: name.trim().split(" ")[0], date: format.date(date, LONG_DATE), time: format.time(time) })}
        </m.p>
      )}
    </m.section>
  );
}

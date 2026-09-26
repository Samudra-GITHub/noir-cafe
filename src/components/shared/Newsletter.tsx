"use client";

import { useActionState, useEffect, useId } from "react";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { SectionIntro } from "@/components/shared/SectionIntro";
import { subscribe, type NewsletterState } from "@/lib/actions/newsletter";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { SHAKE_KEYFRAMES, checkDraw, shakeTransition, successReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Notes from the bar — newsletter sign-up.
 * Underline field with a floating label (rests where the design's placeholder
 * sits, lifts on focus or input), a shake on invalid input, and a drawn check
 * on success.
 */
export function Newsletter() {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribe, {
    status: "idle",
  });
  const safe = useMotionSafe();
  const [rowRef, animate] = useAnimate<HTMLDivElement>();
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const isError = state.status === "error";
  const errorAt = state.status === "error" ? state.at : 0;

  useEffect(() => {
    if (errorAt && safe && rowRef.current) {
      void animate(rowRef.current, { x: SHAKE_KEYFRAMES }, shakeTransition);
    }
  }, [errorAt, safe, animate, rowRef]);

  return (
    <section aria-labelledby="newsletter-title" className="relative z-10 bg-canvas py-20 md:pt-24 md:pb-[99px]">
      <FadeUp className="container-page flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          id="newsletter-title"
          eyebrow="Notes from the bar"
          size="heading-xl"
          gap="mt-[7px]"
          titleClassName="max-w-[480px]"
          title="New lots, quiet stories, and invitations."
        />

        <form action={action} noValidate className="w-full lg:w-[500px]">
          <AnimatePresence mode="wait" initial={false}>
            {state.status === "success" ? (
              <motion.div
                key="done"
                variants={safe ? successReveal : undefined}
                initial="hidden"
                animate="visible"
                className="flex min-h-[41px] items-center gap-3 border-b border-espresso pb-3.5"
              >
                <svg aria-hidden viewBox="0 0 20 20" className="size-5 text-caramel">
                  <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  <motion.path
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
                <p className="font-sans text-body-sm text-strong">{state.message}</p>
              </motion.div>
            ) : (
              <motion.div
                key="field"
                ref={rowRef}
                exit={safe ? { opacity: 0, y: -8, transition: { duration: 0.25 } } : undefined}
                className={cn(
                  "flex items-center gap-4 border-b pb-3.5 transition-colors duration-250 ease-noir",
                  isError ? "border-caramel" : "border-espresso focus-within:border-caramel",
                )}
              >
                <div className="relative min-w-0 flex-1">
                  <input
                    key={errorAt}
                    defaultValue={isError ? state.email : undefined}
                    id={inputId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder=" "
                    aria-invalid={isError || undefined}
                    aria-describedby={messageId}
                    className="peer block min-h-11 w-full bg-transparent font-sans text-body-sm text-strong outline-none md:min-h-0"
                  />
                  <label
                    htmlFor={inputId}
                    className={cn(
                      "pointer-events-none absolute top-1/2 left-0 origin-left -translate-y-1/2 font-sans text-body-sm text-stone",
                      "transition-[transform,color] duration-300 ease-noir",
                      "peer-focus:-translate-y-[calc(50%+22px)] peer-focus:scale-[0.72] peer-focus:text-caramel-ink",
                      "peer-[:not(:placeholder-shown)]:-translate-y-[calc(50%+22px)] peer-[:not(:placeholder-shown)]:scale-[0.72]",
                    )}
                  >
                    Your email address
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  className="group/submit inline-flex min-h-11 items-center gap-1.5 font-mono text-eyebrow text-strong uppercase transition-colors duration-250 ease-noir hover:text-caramel-ink disabled:opacity-40 md:min-h-0"
                >
                  {pending ? "Sending" : "Subscribe"}
                  <ArrowUpRight
                    aria-hidden
                    className="size-2.5 transition-transform duration-250 ease-noir group-hover/submit:translate-x-0.5 group-hover/submit:-translate-y-0.5"
                    strokeWidth={1.75}
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p
            id={messageId}
            role="status"
            className={cn("mt-3 font-mono text-micro uppercase", isError ? "text-caramel-ink" : "text-stone")}
          >
            {isError ? state.message : "Monthly at most · Unsubscribe anytime"}
          </p>
        </form>
      </FadeUp>
    </section>
  );
}

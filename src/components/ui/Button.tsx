"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/cn";

/**
 * Button — design-system "Button · variant primary | secondary | outline · size md"
 *   primary   bg-espresso text-beige        → hover bg-caramel, lift 2px
 *   accent    bg-caramel text-beige         (confirm reservation)
 *   secondary border-espresso transparent   (LEARN MORE / VIEW ALL DRINKS)
 *   inverse   bg-beige text-espresso        (on espresso / imagery: RESERVE, NEXT)
 *   outline-inverse  hairline on imagery    (hero EXPLORE MENU)
 *   disabled  opacity-40 pointer-events-none
 * 52px tall pill, 12px uppercase Inter semibold, 9px ↗ glyph.
 *
 * Micro-interactions (fine pointers, motion allowed): lifts 2px with a soft
 * shadow, a light bloom follows the cursor, and the pill leans ≤3px toward it.
 * On touch devices with a vibration motor, a press gives a short haptic tap.
 */

export type ButtonVariant = "primary" | "accent" | "secondary" | "inverse" | "outline-inverse";

const base =
  "group/button relative isolate inline-flex h-13 min-w-11 shrink-0 items-center justify-center gap-2.5 overflow-hidden rounded-full pr-[18px] pl-6 " +
  "font-sans text-button font-semibold uppercase tracking-[0.01em] whitespace-nowrap " +
  "[transform:translate3d(var(--mx,0px),var(--my,0px),0)] " +
  "transition-[background-color,color,border-color,translate,transform,box-shadow] duration-250 ease-noir " +
  "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgb(60_36_21/0.5)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-caramel " +
  // Bloom: a soft radial light that tracks the pointer (centered for keyboard focus).
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:opacity-0 " +
  "before:bg-[radial-gradient(90px_circle_at_var(--bx,50%)_var(--by,50%),var(--bloom),transparent_72%)] " +
  "before:transition-opacity before:duration-500 before:ease-noir hover:before:opacity-100 focus-visible:before:opacity-100 " +
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-espresso text-beige hover:bg-caramel [--bloom:rgb(248_244_236/0.22)]",
  accent: "bg-caramel text-beige hover:bg-walnut [--bloom:rgb(248_244_236/0.2)]",
  secondary:
    "border border-espresso text-espresso hover:bg-espresso hover:text-beige [--bloom:rgb(168_106_60/0.4)]",
  inverse: "bg-beige text-espresso hover:bg-cream [--bloom:rgb(168_106_60/0.22)]",
  "outline-inverse":
    "border border-beige/25 text-beige/90 hover:border-beige/70 hover:text-beige [--bloom:rgb(248_244_236/0.16)]",
};

type CommonProps = {
  variant?: ButtonVariant;
  /** Show the ↗ glyph. On by default — every CTA in the design carries it. */
  arrow?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.ComponentProps<typeof Link>, keyof CommonProps> & { href: string; disabled?: boolean };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function buttonClasses({
  variant = "primary",
  fullWidth,
  className,
}: Pick<CommonProps, "variant" | "fullWidth" | "className">) {
  return cn(base, variants[variant], fullWidth && "w-full", className);
}

const MAGNET_X = 3;
const MAGNET_Y = 2;

/** Pointer-follow for the bloom and the magnetic lean. Writes CSS variables only — no re-renders. */
function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const safe = useMotionSafe();

  // Press haptic (touch devices; lib/haptics decides whether the device can).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const press = () => haptic("press");
    el.addEventListener("pointerdown", press);
    return () => el.removeEventListener("pointerdown", press);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !safe || !window.matchMedia("(pointer: fine)").matches) return;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--bx", `${px * 100}%`);
      el.style.setProperty("--by", `${py * 100}%`);
      el.style.setProperty("--mx", `${(px - 0.5) * 2 * MAGNET_X}px`);
      el.style.setProperty("--my", `${(py - 0.5) * 2 * MAGNET_Y}px`);
    };
    const leave = () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [safe]);

  return ref;
}

function Arrow() {
  return (
    <ArrowUpRight
      aria-hidden
      className="size-[22px] transition-transform duration-250 ease-noir group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
      strokeWidth={1.4}
    />
  );
}

export function Button({ variant, arrow = true, fullWidth, className, children, ...rest }: ButtonProps) {
  const classes = buttonClasses({ variant, fullWidth, className });
  const linkRef = useMagnetic<HTMLAnchorElement>();
  const buttonRef = useMagnetic<HTMLButtonElement>();
  const content = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );

  if (rest.href !== undefined) {
    const { disabled, ...linkProps } = rest as Omit<ButtonAsLink, keyof CommonProps>;
    return (
      <Link
        ref={linkRef}
        {...linkProps}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as Omit<ButtonAsButton, keyof CommonProps>;
  return (
    <button ref={buttonRef} type={type} {...buttonProps} className={classes}>
      {content}
    </button>
  );
}

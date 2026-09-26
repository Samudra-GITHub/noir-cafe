import type { Transition, Variants } from "framer-motion";

/**
 * Motion system — mirrors "04 Motion language" in design/design-system.png.
 *
 * One easing curve everywhere (EASE_NOIR, also exposed to CSS as --ease-noir),
 * three durations, and named variants for every animated pattern. Components
 * import from here instead of declaring ad-hoc transitions.
 *
 * Favor transform + opacity. Every consumer respects prefers-reduced-motion
 * (hooks/useMotionSafe) and never delays access to content.
 */

export const EASE_NOIR = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.25,
  base: 0.7,
  slow: 1.1,
  steam: 2.4,
} as const;

/** Default tween used by any one-off transition. */
export const ease = (d: number = duration.base, delay = 0): Transition => ({
  duration: d,
  ease: EASE_NOIR,
  delay,
});

/* ── Reveal ─────────────────────────────────────────────────────────────── */

/** motion.fadeUp — .7s · whileInView y 32→0, opacity 0→1 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number = 0) => ({ opacity: 1, y: 0, transition: ease(duration.base, delay) }),
};

/** Fade-up sequence — staggerChildren .12 · y 24→0 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: ease() },
};

/** Shared whileInView viewport config — trigger once, slightly before fully visible. */
export const inViewOnce = { once: true, amount: 0.2 } as const;

/* ── Hero ───────────────────────────────────────────────────────────────── */

/**
 * Hero entrance delays by step — played by the `.hero-in` CSS animation
 * (same curve, 1.1s) so the headline paints before hydration:
 * 0 eyebrow · 1–2 headline lines · 3 supporting copy · 4 buttons (after the headline lands).
 */
export const HERO_DELAYS = [0.1, 0.18, 0.28, 0.6, 0.85] as const;

/** motion.parallax — scrubbed · hero only · y 0 → −64px (spec: 40–80px) */
export const PARALLAX_RANGE = [0, -64] as const;
/** Slight scrub of the film as the page covers it. */
export const HERO_SCRUB_SCALE = [1.04, 1.1] as const;

/* ── Carousel ───────────────────────────────────────────────────────────── */

/** motion.carousel — x ±56 · spring 120 / 20, with a slight 3D turn */
export const carouselSpring: Transition = { type: "spring", stiffness: 120, damping: 20 };
export const CAROUSEL_OFFSET = 56;

export const carouselSlide: Variants = {
  enter: (dir: 1 | -1) => ({ x: dir * CAROUSEL_OFFSET, opacity: 0, rotateY: dir * -6, scale: 1.02 }),
  center: { x: 0, opacity: 1, rotateY: 0, scale: 1, transition: carouselSpring },
  exit: (dir: 1 | -1) => ({
    x: dir * -CAROUSEL_OFFSET,
    opacity: 0,
    rotateY: dir * 6,
    scale: 1.02,
    transition: carouselSpring,
  }),
};

/** Pointer tilt for the carousel frame (degrees at the frame edge). */
export const CAROUSEL_TILT = 3;
export const tiltSpring: Transition = { type: "spring", stiffness: 150, damping: 18, mass: 0.6 };

/* ── Cards ──────────────────────────────────────────────────────────────── */

/** Card behavior — HOVER LIFT · whileHover y −8 · .25 */
export const hoverLift = {
  whileHover: { y: -8 },
  transition: ease(duration.fast),
} as const;

/** Shop product card — card y −6 · image scale 1.03 · .28s */
export const productHover = {
  card: { y: -6 },
  image: { scale: 1.03 },
  transition: ease(0.28),
} as const;

/* ── Scroll ─────────────────────────────────────────────────────────────── */

/** motion.imageZoom — scroll progress .15→.85 · scale 1→1.08 (lab hero: 1→1.06) */
export const IMAGE_ZOOM = { progress: [0.15, 0.85], scale: [1, 1.08] } as const;
export const IMAGE_ZOOM_SUBTLE = { progress: [0.15, 0.85], scale: [1, 1.06] } as const;

/* ── Overlays & feedback ────────────────────────────────────────────────── */

/** Mobile menu sheet — fades in while blurring the page behind it. */
export const sheet: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(28px)", transition: ease(0.45) },
  exit: { opacity: 0, backdropFilter: "blur(0px)", transition: ease(0.3) },
};

export const sheetItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: ease(0.6, 0.08 + i * 0.05) }),
};

/** Invalid input — short horizontal shake. */
export const SHAKE_KEYFRAMES = [0, -8, 8, -6, 6, -3, 3, 0];
export const shakeTransition: Transition = { duration: 0.5, ease: "easeInOut" };

/** Success confirmation — message rises, check mark draws. */
export const successReveal: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: ease(0.5) },
};
export const checkDraw: Variants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: ease(0.6, 0.15) },
};

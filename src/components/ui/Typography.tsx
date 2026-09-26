import { cn } from "@/lib/cn";

/**
 * Typography — Cormorant Garamond carries voice, Inter stays quiet and legible,
 * IBM Plex Mono exposes prices, timing, origin and system detail.
 */

type DisplaySize =
  | "2xl"
  | "xl"
  | "lg"
  | "md"
  | "heading-xl"
  | "heading-lg"
  | "heading"
  | "heading-md"
  | "heading-step"
  | "heading-sm";

const displaySizes: Record<DisplaySize, string> = {
  "2xl": "type-display-2xl",       // 104 · hero
  xl: "type-display-xl",           // 72  · section statement
  lg: "type-display-lg",           // 60  · page H1 / section H2
  md: "type-display-md",           // 56  · split-panel statement
  "heading-xl": "type-heading-xl", // 44  · newsletter
  "heading-lg": "type-heading-lg", // 42  · menu category, pull quote
  heading: "font-display text-[1.875rem] leading-[1.07] md:text-heading", // 36
  "heading-md": "font-display text-heading-md", // 32
  "heading-step": "font-display text-heading-step", // 30
  "heading-sm": "font-display text-heading-sm", // 28
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "blockquote";

export function Display({
  as: Tag = "h2",
  size = "lg",
  className,
  ...props
}: { as?: HeadingTag; size?: DisplaySize } & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={cn(displaySizes[size], "font-normal", className)} {...props} />;
}

type TextSize = "lg" | "md" | "sm" | "xs";

const textSizes: Record<TextSize, string> = {
  lg: "text-body-lg",  // 20 · editorial lead
  md: "text-body",     // 16
  sm: "text-body-sm",  // 15 · section intros
  xs: "text-body-xs",  // 13 · item descriptions
};

type TextTone = "strong" | "warm" | "muted" | "inverse" | "inverse-muted";

const textTones: Record<TextTone, string> = {
  strong: "text-strong",
  warm: "text-warm",
  muted: "text-stone",
  inverse: "text-beige",
  "inverse-muted": "text-cream",
};

export function Text({
  as: Tag = "p",
  size = "md",
  tone = "strong",
  className,
  ...props
}: {
  as?: "p" | "span" | "div" | "li";
  size?: TextSize;
  tone?: TextTone;
} & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={cn("font-sans", textSizes[size], textTones[tone], className)} {...props} />;
}

type MonoTone = "accent" | "accent-inverse" | "strong" | "muted" | "inverse" | "inverse-subtle";

const monoTones: Record<MonoTone, string> = {
  accent: "text-caramel-ink",
  "accent-inverse": "text-caramel-glow",
  strong: "text-strong",
  muted: "text-stone",
  inverse: "text-beige",
  "inverse-subtle": "text-taupe",
};

/** Eyebrow — "01 · THE DAILY RITUAL". 10px Plex Mono, uppercase. */
export function Eyebrow({
  as: Tag = "p",
  tone = "accent",
  className,
  ...props
}: { as?: "p" | "span" | "div"; tone?: MonoTone } & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={cn("type-eyebrow", monoTones[tone], className)} {...props} />;
}

type MonoSize = "md" | "sm" | "xs" | "micro";

const monoSizes: Record<MonoSize, string> = {
  md: "text-mono-md",  // 13 · card price
  sm: "text-mono-sm",  // 11 · list price, time
  xs: "text-eyebrow",  // 10 · origin meta
  micro: "text-micro uppercase", // 8 · spec labels
};

/** Mono — prices, timing, origin, spec labels. */
export function Mono({
  as: Tag = "span",
  size = "sm",
  tone = "strong",
  className,
  ...props
}: {
  as?: "span" | "p" | "dt" | "dd" | "time" | "div";
  size?: MonoSize;
  tone?: MonoTone;
} & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={cn("font-mono", monoSizes[size], monoTones[tone], className)} {...props} />;
}

/** Price — Plex Mono, fixed two decimals ("$6.50"). Pass `whole` for shop prices ("$22"). */
export function Price({
  value,
  whole,
  size = "sm",
  tone = "strong",
  className,
}: {
  value: number;
  whole?: boolean;
  size?: MonoSize;
  tone?: MonoTone;
  className?: string;
}) {
  const formatted = whole ? `$${Math.round(value)}` : `$${value.toFixed(2)}`;
  return (
    <Mono size={size} tone={tone} className={cn("tabular-nums", className)}>
      {formatted}
    </Mono>
  );
}

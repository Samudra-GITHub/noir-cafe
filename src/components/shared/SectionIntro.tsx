import { Display, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";

type DisplaySize = React.ComponentProps<typeof Display>["size"];

/**
 * SectionIntro — the recurring "01 · THE DAILY RITUAL" eyebrow + Cormorant heading pair.
 * `gap` is the eyebrow→heading spacing, which varies with heading size in the exports.
 */
export function SectionIntro({
  eyebrow,
  title,
  id,
  size = "lg",
  as = "h2",
  eyebrowTone = "accent",
  inverse = false,
  gap = "mt-4",
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  id?: string;
  size?: DisplaySize;
  as?: "h1" | "h2" | "h3";
  eyebrowTone?: React.ComponentProps<typeof Eyebrow>["tone"];
  inverse?: boolean;
  gap?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={className}>
      <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow>
      <Display
        as={as}
        id={id}
        size={size}
        className={cn(gap, inverse ? "text-beige" : "text-strong", titleClassName)}
      >
        {title}
      </Display>
    </div>
  );
}

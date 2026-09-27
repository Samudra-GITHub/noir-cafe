import { cn } from "@/lib/cn";

/** Container — 1296px content column with responsive gutter (20 / 40 / 72). */
export function Container({
  as: Tag = "div",
  className,
  ...props
}: { as?: "div" | "section" | "header" | "footer" | "nav" | "main" } & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={cn("container-page", className)} {...props} />;
}

type SectionTone = "canvas" | "surface" | "muted" | "inverse";

const sectionTones: Record<SectionTone, string> = {
  canvas: "bg-canvas text-strong",
  surface: "bg-surface text-strong",
  muted: "bg-cream text-strong",
  inverse: "bg-espresso text-beige",
};

/** Section — full-bleed band with a surface tone and the shared vertical rhythm. */
export function Section({
  tone = "canvas",
  spacing = true,
  className,
  ...props
}: { tone?: SectionTone; spacing?: boolean } & React.HTMLAttributes<HTMLElement>) {
  return <section className={cn(sectionTones[tone], spacing && "section-y", className)} {...props} />;
}

/** Divider — 1px hairline. */
export function Divider({
  tone = "subtle",
  className,
}: {
  tone?: "subtle" | "strong" | "inverse" | "inverse-strong";
  className?: string;
}) {
  return (
    <hr
      className={cn(
        "h-px w-full border-0",
        tone === "subtle" && "bg-sand",
        tone === "strong" && "bg-espresso",
        tone === "inverse" && "bg-char",
        tone === "inverse-strong" && "bg-beige/80",
        className,
      )}
    />
  );
}

/** SpecList — label/value rows (ROAST · Medium, Dose · 15.0 g, Date · Friday…). */
export function SpecList({
  items,
  layout = "row",
  inverse = false,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  /** row = drink-card columns; stack = recipe / reservation summary lines. */
  layout?: "row" | "stack";
  inverse?: boolean;
  className?: string;
}) {
  if (layout === "row") {
    return (
      <dl className={cn("flex justify-between gap-4", className)}>
        {items.map((item, i) => (
          <div key={item.label} className={cn("flex flex-col gap-0.5", i === items.length - 1 && "text-end")}>
            <dt className={cn("font-mono text-micro uppercase", inverse ? "text-taupe" : "text-stone")}>
              {item.label}
            </dt>
            <dd className={cn("text-[0.6875rem] leading-[1.5]", inverse ? "text-beige" : "text-strong")}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={cn("flex flex-col", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center justify-between border-t py-3.5",
            inverse ? "border-char" : "border-sand",
          )}
        >
          <dt className={cn("font-mono text-micro", inverse ? "text-taupe" : "text-stone")}>{item.label}</dt>
          <dd className={cn("text-body-xs", inverse ? "text-beige" : "text-strong")}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

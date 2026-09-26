import { cn } from "@/lib/cn";

/** Badge — the "HOUSE" tag on menu rows: cream pill, 8px caramel mono. */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full bg-cream px-2 font-mono text-micro text-caramel-ink uppercase",
        className,
      )}
      {...props}
    />
  );
}

/** NoteChip — a static flavor note ("white peach"), hairline pill in 9px mono. */
export function NoteChip({
  inverse = false,
  className,
  ...props
}: { inverse?: boolean } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 font-mono text-[0.5625rem] whitespace-nowrap uppercase",
        inverse ? "border-beige/20 text-cream" : "border-sand text-stone",
        className,
      )}
      {...props}
    />
  );
}

/** StatusDot — olive "OPEN" indicator on location cards, caramel for active steps. */
export function StatusDot({
  tone = "open",
  className,
}: {
  tone?: "open" | "accent" | "strong";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 rounded-full",
        tone === "open" && "bg-olive",
        tone === "accent" && "bg-caramel",
        tone === "strong" && "bg-espresso",
        className,
      )}
    />
  );
}

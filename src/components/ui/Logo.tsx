import Link from "next/link";
import { cn } from "@/lib/cn";

/** Logo — 28px outlined circle + "NOIR CAFÉ" wordmark in Cormorant (26px). */
export function Logo({
  tone = "strong",
  href = "/",
  className,
}: {
  tone?: "strong" | "inverse";
  href?: string | null;
  className?: string;
}) {
  const mark = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5",
        tone === "strong" ? "text-espresso" : "text-beige",
        className,
      )}
    >
      <span aria-hidden className="size-7 rounded-full border-[1.5px] border-current" />
      <span className="font-display text-logo font-medium tracking-[0.01em] whitespace-nowrap uppercase">Noir Café</span>
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} aria-label="Noir Café — home" className="inline-flex">
      {mark}
    </Link>
  );
}

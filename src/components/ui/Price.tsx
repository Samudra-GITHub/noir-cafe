"use client";

import { useFormat } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { Mono, type MonoSize, type MonoTone } from "./Typography";

/**
 * Price — Plex Mono, in the visitor's language and display currency.
 * English in US dollars is exactly the original "$6.50" (or "$22" with
 * `whole`, for shop prices); other currencies read "≈ €5.70".
 */
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
  const format = useFormat();
  return (
    <Mono size={size} tone={tone} className={cn("tabular-nums", className)}>
      {format.price(value, whole)}
    </Mono>
  );
}

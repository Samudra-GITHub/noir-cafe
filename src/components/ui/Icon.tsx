import {
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coffee,
  MapPin,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/** Icon — "Icon · name · size 20 · strokeWidth 1.25". Outline set only. */
const icons = {
  coffee: Coffee,
  "map-pin": MapPin,
  "shopping-bag": ShoppingBag,
  calendar: Calendar,
  "arrow-up-right": ArrowUpRight,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.25,
  label,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Accessible label. Omit for decorative icons. */
  label?: string;
  className?: string;
}) {
  const Glyph = icons[name];
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("shrink-0", className)}
    />
  );
}

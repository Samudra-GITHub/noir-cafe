"use client";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/client";

/**
 * Chip — "Chip · selected · icon · dismissible"
 * State contract: data-state="active" · aria-pressed. Selected uses espresso fill;
 * caramel is reserved for the active indicator or count.
 * Also covers the reservation time / guest pills via `size="lg"`.
 */
export function Chip({
  selected = false,
  size = "sm",
  icon,
  count,
  onDismiss,
  className,
  children,
  ...props
}: {
  selected?: boolean;
  size?: "sm" | "lg";
  icon?: React.ReactNode;
  count?: number;
  onDismiss?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { tr } = useI18n();
  return (
    <button
      type="button"
      aria-pressed={selected}
      data-state={selected ? "active" : "inactive"}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border font-mono whitespace-nowrap",
        "transition-colors duration-250 ease-noir",
        size === "sm" ? "h-7 px-3.5 text-[0.5625rem]" : "h-9 min-w-22 px-4 text-[0.5625rem]",
        selected
          ? "border-espresso bg-espresso text-beige"
          : "border-sand bg-transparent text-strong hover:border-espresso",
        className,
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {count !== undefined && <span className="text-caramel-ink">{count}</span>}
      {onDismiss && (
        <span
          role="button"
          tabIndex={0}
          aria-label={tr("Remove")}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onDismiss();
            }
          }}
          className="-me-1 ms-0.5 opacity-60 hover:opacity-100"
        >
          ×
        </span>
      )}
    </button>
  );
}

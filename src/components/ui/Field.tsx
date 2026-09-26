import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Field — "Field · label · error · hint"
 *   default  1px sand border
 *   focus    2px espresso border
 *   error    caramel border + caramel label
 * 48px tall, 8px radius, ivory surface, 13px Inter value, 9px mono label & hint.
 * Focus animates: the border deepens, a soft caramel halo blooms and the label
 * darkens; errors shake once (see `shake`).
 */
export function Field({
  label,
  hint,
  error,
  className,
  inputClassName,
  id,
  ...props
}: {
  label: string;
  hint?: string;
  error?: string;
  inputClassName?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cn("group/field flex flex-col gap-1.5", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "font-mono text-[0.5625rem] leading-none transition-colors duration-300 ease-noir",
          error ? "text-caramel-ink" : "text-stone group-focus-within/field:text-strong",
        )}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          "h-12 w-full rounded-sm border bg-surface px-3.5 font-sans text-body-xs text-strong",
          "placeholder:text-stone outline-none transition-[border-color,box-shadow] duration-300 ease-noir",
          error
            ? "border-caramel shadow-[0_0_0_4px_rgb(168_106_60/0.12)]"
            : "border-sand hover:border-espresso/40 focus:border-espresso focus:shadow-[inset_0_0_0_1px_var(--noir-espresso),0_0_0_4px_rgb(168_106_60/0.14)]",
          inputClassName,
        )}
        {...props}
      />
      {message && (
        <p id={messageId} className={cn("font-mono text-[0.5625rem]", error ? "text-caramel-ink" : "text-stone")}>
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * UnderlineField — newsletter input ("Your email address" ——— SUBSCRIBE ↗).
 * Borderless, 1px espresso baseline.
 */
export function UnderlineField({
  label,
  action,
  hint,
  className,
  id,
  ...props
}: {
  label: string;
  action: React.ReactNode;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-4 border-b border-espresso pb-3.5">
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
        <input
          id={inputId}
          placeholder={label}
          className="min-w-0 flex-1 bg-transparent font-sans text-body-sm text-strong placeholder:text-stone outline-none"
          {...props}
        />
        {action}
      </div>
      {hint && <p className="font-mono text-micro text-stone uppercase">{hint}</p>}
    </div>
  );
}

"use client";

import { DISPLAY_CURRENCIES, LOCALES, LOCALE_META, BASE_CURRENCY, type DisplayCurrency, type Locale } from "@/i18n/config";
import { setCurrency, switchLocale, useCurrency, useFormat, useI18n, usePagePath, useRates } from "@/i18n/client";
import { cn } from "@/lib/cn";

/** A pill radio group in the atmosphere-controls style: one tab stop, arrows move and select. */
function PillGroup<T extends string>({
  label,
  options,
  value,
  onSelect,
  render,
  lang,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onSelect: (next: T) => void;
  render: (option: T) => string;
  lang?: (option: T) => string | undefined;
}) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = options[(options.indexOf(value) + step + options.length) % options.length];
    onSelect(next);
    e.currentTarget.querySelector<HTMLElement>(`[data-choice="${next}"]`)?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="flex flex-col gap-2">
      <span className="font-mono text-eyebrow text-cream uppercase">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            tabIndex={value === option ? 0 : -1}
            data-choice={option}
            lang={lang?.(option)}
            onClick={() => onSelect(option)}
            className={cn(
              "h-10 rounded-full border px-4 font-mono text-eyebrow transition-colors duration-300",
              value === option ? "border-beige bg-beige text-espresso" : "border-beige/25 text-beige",
            )}
          >
            {render(option)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Language and display currency (phone and tablet menu sheet; the language
 * itself is usually chosen through LanguageSheet, so it can be left out). Changing the
 * language reloads the page in that language and remembers it; the currency
 * is a per-device display preference — every price is charged in US dollars.
 */
export function LanguageCurrency({ className, language = true }: { className?: string; language?: boolean }) {
  const { locale, t } = useI18n();
  const path = usePagePath();
  const currency = useCurrency();
  const rates = useRates();
  const format = useFormat();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {language && (
      <PillGroup<Locale>
        label={t.locale.language}
        options={LOCALES}
        value={locale}
        onSelect={(next) => next !== locale && switchLocale(next, path)}
        render={(l) => LOCALE_META[l].name}
        lang={(l) => l}
      />
      )}
      <PillGroup<DisplayCurrency>
        label={t.locale.currency}
        options={DISPLAY_CURRENCIES}
        value={currency}
        onSelect={setCurrency}
        render={(c) => c}
      />
      {currency !== BASE_CURRENCY && rates && (
        <p className="font-sans text-body-xs text-cream">
          {format.fill(t.locale.chargedIn, {
            date: format.date(new Date(`${rates.date}T12:00:00Z`), { dateStyle: "medium", timeZone: "UTC" }),
          })}
        </p>
      )}
    </div>
  );
}

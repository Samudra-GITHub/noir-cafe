"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button, NoteChip, QuantitySelector } from "@/components/ui";
import {
  EXTRA_SHOT_CENTS,
  OAT_CENTS,
  defaultModifiers,
  money,
  unitCents,
  type Modifiers,
  type OrderableItem,
} from "@/data/ordering";
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/cn";
import { favorites, isFavorite, toggleFavorite } from "./stores";

type Choice<T extends string> = { value: T; label: string; extra?: string };

function Choices<T extends string>({ legend, value, options, onChange }: { legend: string; value: T; options: Choice<T>[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="font-mono text-micro text-stone uppercase">{legend}</legend>
      <div
        role="radiogroup"
        aria-label={legend}
        className="mt-2.5 flex flex-wrap gap-2"
        onKeyDown={(e) => {
          // One tab stop; arrows move and select (WAI-ARIA radio group).
          const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          const i = options.findIndex((o) => o.value === value);
          const next = options[(i + step + options.length) % options.length];
          onChange(next.value);
          (e.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
        }}
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            tabIndex={value === o.value ? 0 : -1}
            data-value={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-full border px-4 font-sans text-body-xs transition-colors duration-200",
              value === o.value ? "border-espresso bg-espresso text-beige" : "border-sand text-strong hover:border-espresso",
            )}
          >
            {o.label}
            {o.extra && <span className={value === o.value ? "text-cream" : "text-stone"}>{o.extra}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Customise a drink before adding it: milk, an extra shot, decaf, hot or iced
 * (and how much ice), sweetness, quantity — the price follows every choice.
 * The heart saves this exact drink as a favourite.
 */
export function CustomizeDrink({ item, onAdd }: { item: OrderableItem; onAdd: (modifiers: Modifiers, quantity: number) => void }) {
  const [mods, setMods] = useState<Modifiers>(() => defaultModifiers(item));
  const [quantity, setQuantity] = useState(1);
  const favs = favorites.use();
  const fav = isFavorite(favs, item.slug, mods);
  const o = item.options;
  const set = (patch: Modifiers) => setMods((m) => ({ ...m, ...patch }));

  return (
    <div className="flex flex-col gap-7 p-6 pb-[calc(24px+var(--safe-bottom))] md:p-10">
      <div className="flex items-start justify-between gap-4 pr-10">
        <div>
          <p className="font-mono text-eyebrow text-caramel-ink uppercase">{item.categoryTitle}</p>
          <h2 className="mt-2 font-display text-[2.25rem] leading-none text-strong">{item.name}</h2>
          <p className="mt-2 font-sans text-body-sm text-stone">{item.description}</p>
          <ul aria-label="Tasting notes" className="mt-3 flex flex-wrap gap-1.5">
            {item.notes.map((n) => (
              <li key={n}>
                <NoteChip>{n}</NoteChip>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          aria-pressed={fav}
          aria-label={fav ? "Remove from favourites" : "Save as a favourite"}
          onClick={() => {
            if (!fav) feedback("favorite");
            toggleFavorite(item.slug, mods);
          }}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-sand text-caramel-ink transition-colors hover:border-caramel"
        >
          <Heart aria-hidden className={cn("size-5", fav && "fill-current")} strokeWidth={1.5} />
        </button>
      </div>

      {o.temperature && (
        <Choices
          legend="Served"
          value={mods.temperature ?? "hot"}
          options={[{ value: "hot", label: "Hot" }, { value: "iced", label: "Iced" }]}
          onChange={(temperature) => set({ temperature, ice: temperature === "iced" ? (mods.ice ?? "regular") : undefined })}
        />
      )}
      {mods.temperature === "iced" && (
        <Choices legend="Ice" value={mods.ice ?? "regular"} options={[{ value: "light", label: "Light ice" }, { value: "regular", label: "Regular ice" }]} onChange={(ice) => set({ ice })} />
      )}
      {o.milk === "choice" && (
        <Choices
          legend="Milk"
          value={mods.milk ?? "whole"}
          options={[{ value: "whole", label: "Whole" }, { value: "oat", label: "Oat", extra: `+${money(OAT_CENTS)}` }]}
          onChange={(milk) => set({ milk })}
        />
      )}
      {o.milk === "oat" && <p className="font-sans text-body-xs text-stone">Made with oat milk.</p>}
      {(o.shot || o.decaf) && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2.5 font-mono text-micro text-stone uppercase">Espresso</legend>
          {o.shot && (
            <button
              type="button"
              aria-pressed={!!mods.extraShot}
              onClick={() => set({ extraShot: !mods.extraShot })}
              className={cn("inline-flex h-11 items-center gap-1.5 rounded-full border px-4 font-sans text-body-xs", mods.extraShot ? "border-espresso bg-espresso text-beige" : "border-sand text-strong")}
            >
              Extra shot <span className={mods.extraShot ? "text-cream" : "text-stone"}>+{money(EXTRA_SHOT_CENTS)}</span>
            </button>
          )}
          {o.decaf && (
            <button
              type="button"
              aria-pressed={!!mods.decaf}
              onClick={() => set({ decaf: !mods.decaf })}
              className={cn("inline-flex h-11 items-center rounded-full border px-4 font-sans text-body-xs", mods.decaf ? "border-espresso bg-espresso text-beige" : "border-sand text-strong")}
            >
              Decaf
            </button>
          )}
        </fieldset>
      )}
      {o.sweetness && (
        <Choices
          legend="Sweetness"
          value={mods.sweetness ?? "none"}
          options={[{ value: "none", label: "Unsweetened" }, { value: "light", label: "Lightly sweet" }, { value: "regular", label: "Sweet" }]}
          onChange={(sweetness) => set({ sweetness })}
        />
      )}

      <div className="flex items-center gap-3 border-t border-sand pt-6">
        <QuantitySelector value={quantity} onChange={setQuantity} />
        <Button
          fullWidth
          className="justify-between pr-6"
          onClick={() => {
            feedback("add");
            onAdd(mods, quantity);
          }}
        >
          Add · {money(unitCents(item, mods) * quantity)}
        </Button>
      </div>
    </div>
  );
}

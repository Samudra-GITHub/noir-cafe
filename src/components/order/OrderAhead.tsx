"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { Button, Dialog, Eyebrow, StatusDot } from "@/components/ui";
import { useOpenNow } from "@/hooks/useOpenNow";
import { PageTitle } from "@/components/layout/PageTitle";
import { CAFES } from "@/data/locations";
import { ITEMS_BY_SLUG, ORDER_MENU, defaultModifiers, describe, money, unitCents, type OrderableItem } from "@/data/ordering";
import { formatPickup, pickupSlots } from "@/lib/pickup";
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/cn";
import { CustomizeDrink } from "./CustomizeDrink";
import { OrderReview } from "./OrderReview";
import { addToBag, favorites, lastOrder, orderBag, type PlacedOrder } from "./stores";

type Config = { unavailable: string[]; card: boolean; accounts: boolean; persisted: boolean };

/** Ticks every minute so pickup slots stay current. */
function useMinute() {
  return useSyncExternalStore(
    (cb) => {
      const id = window.setInterval(cb, 60_000);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / 60_000),
    () => 0,
  );
}

/** Live availability and what checkout supports; refreshed every minute. */
function useOrderingConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/ordering", { cache: "no-store" })
        .then((r) => r.json())
        .then((c: Config) => alive && setConfig(c))
        .catch(() => {});
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);
  return config;
}

export function Confirmation({ order, onNew }: { order: PlacedOrder; onNew: () => void }) {
  return (
    <section aria-labelledby="order-confirmed" className="mx-auto max-w-[560px] rounded-xl bg-espresso p-8 text-beige md:p-10">
      <p className="font-mono text-eyebrow text-caramel-glow uppercase">{order.persisted ? "Order received" : "Order placed · demo"}</p>
      <h2 id="order-confirmed" className="mt-3 font-display text-[3.5rem] leading-none tabular-nums" tabIndex={-1}>
        {order.number}
      </h2>
      <p className="mt-3 font-sans text-body-sm text-cream">
        {order.name}, your order will be ready at {order.cafeName} at {formatPickup(order.pickupAt)}. {order.payment === "pickup" ? "Pay at the counter." : ""}
      </p>
      <ul className="mt-6 border-t border-char">
        {order.lines.map((l, i) => (
          <li key={i} className="flex justify-between gap-4 border-b border-char py-3 font-sans text-body-sm">
            <span>
              {l.quantity} × {l.name}
              {l.detail && <span className="block text-body-xs text-taupe">{l.detail}</span>}
            </span>
            <span className="font-mono text-eyebrow tabular-nums">{money(l.totalCents)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right font-display text-[1.75rem] tabular-nums">{money(order.subtotalCents)}</p>
      {!order.persisted && (
        <p className="mt-4 font-sans text-body-xs text-taupe">
          Demo mode: this order was validated and priced by the server but not sent to a bar — connect Supabase to receive orders.
        </p>
      )}
      <Button variant="inverse" className="mt-8" onClick={onNew}>
        Start a new order
      </Button>
    </section>
  );
}

/**
 * Order ahead — choose a café and a pickup time, customise drinks, keep
 * favourites, review and place the order. Availability is live when the menu
 * is connected to Supabase; card checkout appears when Stripe is configured.
 */
export function OrderAhead({ accountSlot }: { accountSlot?: React.ReactNode }) {
  const config = useOrderingConfig();
  const minute = useMinute();
  const bag = orderBag.use();
  const favs = favorites.use();
  const placed = lastOrder.use();
  const [cafeId, setCafeId] = useState(CAFES[0].id);
  const cafe = CAFES.find((c) => c.id === cafeId)!;
  const slots = useMemo(() => (minute ? pickupSlots(cafe) : []), [cafe, minute]);
  const [pickupAt, setPickupAt] = useState<string | null>(null);
  const pickup = pickupAt && slots.includes(pickupAt) ? pickupAt : (slots[0] ?? null);
  const [customizing, setCustomizing] = useState<OrderableItem | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const unavailable = new Set(config?.unavailable ?? []);

  const count = bag.reduce((s, l) => s + l.quantity, 0);
  const subtotal = bag.reduce((s, l) => {
    const item = ITEMS_BY_SLUG.get(l.slug);
    return item ? s + unitCents(item, l.modifiers) * l.quantity : s;
  }, 0);

  const quickAdd = (item: OrderableItem) => {
    feedback("add");
    addToBag(item.slug, defaultModifiers(item));
  };

  if (showConfirmation && placed) {
    return (
      <div className="container-page pt-32 pb-24 lg:pt-[172px]">
        <Confirmation order={placed} onNew={() => setShowConfirmation(false)} />
      </div>
    );
  }

  return (
    <div className="container-page pt-32 pb-40 lg:pt-[172px]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Order ahead</Eyebrow>
          <PageTitle>
            <h1 className="type-display-lg mt-[13px] text-strong">Ready when you are.</h1>
          </PageTitle>
        </div>
        <div className="flex items-center gap-3">{accountSlot}</div>
      </header>

      {/* Café and pickup */}
      <section aria-label="Café and pickup time" className="mt-10 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div
          role="radiogroup"
          aria-label="Café"
          className="grid gap-2 sm:grid-cols-3"
          onKeyDown={(e) => {
            const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
            if (!step) return;
            e.preventDefault();
            const i = CAFES.findIndex((c) => c.id === cafeId);
            const next = CAFES[(i + step + CAFES.length) % CAFES.length];
            setCafeId(next.id);
            (e.currentTarget.querySelector(`[data-cafe="${next.id}"]`) as HTMLElement | null)?.focus();
          }}
        >
          {CAFES.map((c) => (
            <CafeOption key={c.id} cafe={c} selected={c.id === cafeId} onSelect={() => setCafeId(c.id)} />
          ))}
        </div>
        <label className="flex min-w-0 flex-col gap-2">
          <span className="font-mono text-micro text-stone uppercase">Pickup</span>
          {slots.length ? (
            <select
              value={pickup ?? ""}
              onChange={(e) => setPickupAt(e.target.value)}
              className="h-13 max-w-full min-w-0 rounded-full border border-sand bg-surface px-5 font-sans text-body-sm text-strong focus:border-espresso"
            >
              {slots.map((s, i) => (
                <option key={s} value={s}>
                  {i === 0 ? `As soon as possible · ${formatPickup(s)}` : formatPickup(s)}
                </option>
              ))}
            </select>
          ) : (
            <p className="flex h-13 items-center rounded-full border border-sand px-5 font-sans text-body-sm text-stone">
              {minute ? `Closed now — ordering reopens at ${cafe.opens}` : "Checking times…"}
            </p>
          )}
        </label>
      </section>

      {/* Favourites */}
      {favs.length > 0 && (
        <section aria-labelledby="favs" className="mt-10">
          <h2 id="favs" className="font-mono text-eyebrow text-stone uppercase">Your favourites</h2>
          <ul className="swipe-rail -mx-[var(--gutter)] mt-3 gap-2 px-[var(--gutter)] [&>*]:snap-start">
            {favs.map((f, i) => {
              const item = ITEMS_BY_SLUG.get(f.slug);
              if (!item) return null;
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={unavailable.has(item.slug)}
                    onClick={() => {
                      feedback("add");
                      addToBag(item.slug, f.modifiers);
                    }}
                    className="flex h-full min-h-16 w-60 items-center gap-3 rounded-xl border border-sand bg-surface px-4 py-3 text-left hover:border-espresso disabled:opacity-40"
                  >
                    <Heart aria-hidden className="size-4 shrink-0 fill-caramel text-caramel" />
                    <span className="flex flex-1 flex-col">
                      <span className="font-sans text-body-sm font-semibold text-strong">{item.name}</span>
                      <span className="font-sans text-body-xs text-stone">{describe(item, f.modifiers) || item.description}</span>
                    </span>
                    <span className="font-mono text-eyebrow tabular-nums">{money(unitCents(item, f.modifiers))}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Menu */}
      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-x-16">
        {ORDER_MENU.map((category) => (
          <section key={category.id} aria-labelledby={`order-${category.id}`}>
            <h2 id={`order-${category.id}`} className="font-display text-[2rem] leading-none text-strong">
              {category.title}
            </h2>
            <ul className="mt-4 border-t border-sand">
              {category.items.map((item) => {
                const soldOut = unavailable.has(item.slug);
                const plain = item.category === "bakery";
                return (
                  <li key={item.slug} className="flex items-center gap-4 border-b border-sand py-4">
                    <div className="flex-1">
                      <p className="font-sans text-body-sm font-semibold text-strong">
                        {item.name}
                        {soldOut && <span className="ml-2 rounded-full bg-cream px-2 py-0.5 font-mono text-micro text-stone uppercase">Sold out today</span>}
                      </p>
                      <p className="font-sans text-body-xs text-stone">{item.description}</p>
                    </div>
                    <span className="font-mono text-eyebrow text-strong tabular-nums">{money(Math.round(item.price * 100))}</span>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={() => (plain ? quickAdd(item) : setCustomizing(item))}
                      aria-label={plain ? `Add ${item.name}` : `Customise ${item.name}`}
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-sand text-strong transition-colors hover:border-espresso hover:bg-espresso hover:text-beige disabled:opacity-30"
                    >
                      <Plus aria-hidden className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-10 font-sans text-body-xs text-stone">
        Prices are confirmed at checkout. Please tell the barista about allergies — see the <Link href="/menu" className="underline">menu</Link> notes.
      </p>

      {/* Order bar */}
      {count > 0 && (
        <div className="fixed inset-x-4 z-40 mx-auto max-w-[560px] bottom-[calc(var(--dock-height)+28px+var(--safe-bottom))] md:bottom-8">
          <Button fullWidth className="justify-between pr-6 shadow-[0_18px_40px_-12px_rgb(23_18_14/0.6)]" onClick={() => setReviewing(true)}>
            Review order · {count} {count === 1 ? "item" : "items"} · {money(subtotal)}
          </Button>
        </div>
      )}

      <Dialog open={!!customizing} onClose={() => setCustomizing(null)} title={customizing ? `Customise ${customizing.name}` : "Customise"} className="max-md:h-dvh max-md:max-h-none max-md:rounded-none">
        {customizing && (
          <CustomizeDrink
            key={customizing.slug}
            item={customizing}
            onAdd={(mods, qty) => {
              addToBag(customizing.slug, mods, qty);
              setCustomizing(null);
            }}
          />
        )}
      </Dialog>

      <Dialog open={reviewing} onClose={() => setReviewing(false)} title="Review order" className="max-md:h-dvh max-md:max-h-none max-md:rounded-none">
        {reviewing && (
          <OrderReview
            cafeId={cafe.id}
            cafeName={cafe.cardName}
            pickupAt={pickup}
            card={!!config?.card}
            onNeedsNewSlot={() => setPickupAt(null)}
            onPlaced={() => {
              setReviewing(false);
              setShowConfirmation(true);
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

function CafeOption({ cafe, selected, onSelect }: { cafe: (typeof CAFES)[number]; selected: boolean; onSelect: () => void }) {
  const open = useOpenNow(cafe.opens, cafe.closes);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      data-cafe={cafe.id}
      onClick={onSelect}
      className={cn(
        "flex min-h-16 flex-col items-start justify-center rounded-xl border px-4 py-3 text-left transition-colors",
        selected ? "border-espresso bg-espresso text-beige" : "border-sand bg-surface text-strong hover:border-espresso",
      )}
    >
      <span className="font-sans text-body-sm font-semibold">{cafe.cardName}</span>
      <span className={cn("mt-0.5 inline-flex items-center gap-1.5 font-mono text-micro uppercase", selected ? "text-cream" : "text-stone")}>
        <StatusDot tone={open ? "open" : "strong"} />
        {open ? "Open" : "Closed"} · {cafe.opens}–{cafe.closes}
      </span>
    </button>
  );
}

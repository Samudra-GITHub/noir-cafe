"use client";

import { useId, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button, Field } from "@/components/ui";
import { ITEMS_BY_SLUG, describe, unitCents } from "@/data/ordering";
import { formatPickup } from "@/lib/pickup";
import { feedback } from "@/lib/feedback";
import { cn } from "@/lib/cn";
import { lastOrder, orderBag, type PlacedOrder } from "./stores";
import { useFormat, useI18n } from "@/i18n/client";
import { LOCALE_META } from "@/i18n/config";

const ERRORS: Record<string, string> = {
  pickup_unavailable: "That pickup time has just passed — please choose another.",
  name_required: "Add a name so the barista can call your order.",
  empty_order: "Your order is empty.",
  invalid_line: "Something in your order is no longer on the menu.",
  unknown_cafe: "Please choose a café.",
  card_unavailable: "Card payment isn't available right now — you can pay at pickup.",
  rate_limited: "Too many orders at once — please wait a minute.",
};

/**
 * Review and place the order: adjust quantities, add a name for the counter,
 * choose to pay at pickup (or by card, when Stripe is configured), and send.
 * Prices shown here are recomputed on the server before anything is charged.
 */
export function OrderReview({
  cafeId,
  cafeName,
  pickupAt,
  card,
  onPlaced,
  onNeedsNewSlot,
}: {
  cafeId: string;
  cafeName: string;
  pickupAt: string | null;
  card: boolean;
  onPlaced: (order: PlacedOrder) => void;
  onNeedsNewSlot: () => void;
}) {
  const { tr, locale } = useI18n();
  const format = useFormat();
  const bag = orderBag.use();
  const [name, setName] = useState("");
  const [payment, setPayment] = useState<"pickup" | "card">("pickup");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>();
  const legendId = useId();

  const lines = bag.flatMap((l) => {
    const item = ITEMS_BY_SLUG.get(l.slug);
    return item ? [{ ...l, item, detail: describe(item, l.modifiers, tr), total: unitCents(item, l.modifiers) * l.quantity }] : [];
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const setQty = (id: string, q: number) => orderBag.write(q < 1 ? bag.filter((l) => l.id !== id) : bag.map((l) => (l.id === id ? { ...l, quantity: Math.min(12, q) } : l)));

  const place = async () => {
    if (!name.trim()) {
      setNameError(ERRORS.name_required);
      return;
    }
    if (!pickupAt) {
      setError(ERRORS.pickup_unavailable);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cafeId, pickupAt, name: name.trim(), payment, lines: bag.map(({ slug, quantity, modifiers }) => ({ slug, quantity, modifiers })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERRORS[data.error] ?? "We couldn't place the order. Please try again.");
        if (data.error === "pickup_unavailable") onNeedsNewSlot();
        return;
      }
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      const o = data.order;
      const placed: PlacedOrder = {
        id: o.id,
        number: o.number,
        cafeName: o.cafeName,
        pickupAt: o.pickupAt,
        name: o.name,
        subtotalCents: o.subtotalCents,
        persisted: o.persisted,
        payment: o.payment,
        lines: o.lines.map((l: { name: string; quantity: number; detail: string; totalCents: number }) => ({ name: l.name, quantity: l.quantity, detail: l.detail, totalCents: l.totalCents })),
      };
      lastOrder.write(placed);
      orderBag.write([]);
      feedback("confirm");
      onPlaced(placed);
    } catch {
      setError("The connection dropped. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-[calc(24px+var(--safe-bottom))] md:p-10">
      <div className="pe-10">
        <p className="font-mono text-eyebrow text-caramel-ink uppercase">{tr("Your order")}</p>
        <h2 className="mt-2 font-display text-[2.25rem] leading-none text-strong">{cafeName}</h2>
        <p className="mt-2 font-sans text-body-sm text-stone">{pickupAt ? tr("Pickup at {time}", { time: formatPickup(pickupAt, LOCALE_META[locale].intl) }) : tr("Choose a pickup time")}</p>
      </div>

      {lines.length === 0 ? (
        <p className="font-sans text-body-sm text-stone">{tr("Your order is empty.")}</p>
      ) : (
        <ul className="border-t border-sand">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 border-b border-sand py-3.5">
              <div className="flex-1">
                <p className="font-sans text-body-sm font-semibold text-strong">{l.item.name}</p>
                {l.detail && <p className="font-sans text-body-xs text-stone">{l.detail}</p>}
              </div>
              <div className="flex items-center gap-1" role="group" aria-label={tr("{name} quantity", { name: l.item.name })}>
                <button type="button" onClick={() => setQty(l.id, l.quantity - 1)} aria-label={l.quantity === 1 ? tr("Remove {name}", { name: l.item.name }) : tr("One fewer")} className="grid size-11 place-items-center rounded-full text-stone hover:bg-cream">
                  {l.quantity === 1 ? <X aria-hidden className="size-4" /> : <Minus aria-hidden className="size-4" />}
                </button>
                <span className="w-5 text-center font-mono text-eyebrow tabular-nums" aria-live="polite">{l.quantity}</span>
                <button type="button" onClick={() => setQty(l.id, l.quantity + 1)} aria-label={tr("One more")} disabled={l.quantity >= 12} className="grid size-11 place-items-center rounded-full text-stone hover:bg-cream disabled:opacity-30">
                  <Plus aria-hidden className="size-4" />
                </button>
              </div>
              <span className="w-16 text-end font-mono text-eyebrow text-strong tabular-nums">{format.money(l.total)}</span>
            </li>
          ))}
        </ul>
      )}

      <Field label={tr("Name for the order")} autoComplete="given-name" value={name} onChange={(e) => { setName(e.target.value); setNameError(undefined); }} error={nameError && tr(nameError)} maxLength={60} />

      <fieldset aria-labelledby={legendId}>
        <legend id={legendId} className="font-mono text-micro text-stone uppercase">{tr("Payment")}</legend>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {([["pickup", tr("Pay at pickup"), tr("Card or cash at the counter")], ...(card ? [["card", tr("Pay now"), tr("Secure card checkout")]] : [])] as [("pickup" | "card"), string, string][]).map(([value, label, note]) => (
            <label key={value} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3", payment === value ? "border-espresso" : "border-sand")}>
              <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} className="accent-espresso" />
              <span className="flex flex-col">
                <span className="font-sans text-body-sm font-semibold text-strong">{label}</span>
                <span className="font-sans text-body-xs text-stone">{note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="font-sans text-body-sm text-caramel-ink">
          {tr(error)}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-sand pt-6">
        <p className="font-display text-[1.75rem] leading-none text-strong tabular-nums">{format.money(subtotal)}</p>
        <Button onClick={place} disabled={sending || lines.length === 0} className="pe-6">
          {sending ? tr("Sending…") : payment === "card" ? tr("Continue to payment") : tr("Place order")}
        </Button>
      </div>
    </div>
  );
}

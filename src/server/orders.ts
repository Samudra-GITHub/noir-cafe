import "server-only";
import { CAFES } from "@/data/locations";
import { ITEMS_BY_SLUG, MAX_LINES, MAX_QUANTITY, describe, sanitize, unitCents, type Modifiers } from "@/data/ordering";
import { isValidPickup } from "@/lib/pickup";
import { supabase } from "./supabase";

export type PricedLine = { slug: string; name: string; quantity: number; modifiers: Modifiers; detail: string; unitCents: number; totalCents: number };

export type ValidOrder = {
  cafeId: string;
  cafeName: string;
  pickupAt: string;
  name: string;
  lines: PricedLine[];
  subtotalCents: number;
};

export type OrderRecord = ValidOrder & { id: string; number: string; status: "received" | "awaiting_payment" | "paid"; payment: "pickup" | "card"; persisted: boolean };

/** Validate and price an order from the browser. Every price is recomputed here. */
export function validateOrder(body: unknown, now = new Date()): { order: ValidOrder } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const cafe = CAFES.find((c) => c.id === b.cafeId);
  if (!cafe) return { error: "unknown_cafe" };
  if (typeof b.pickupAt !== "string" || !isValidPickup(cafe, b.pickupAt, now)) return { error: "pickup_unavailable" };
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 60) : "";
  if (!name) return { error: "name_required" };
  if (!Array.isArray(b.lines) || b.lines.length === 0 || b.lines.length > MAX_LINES) return { error: "empty_order" };

  const lines: PricedLine[] = [];
  for (const raw of b.lines) {
    const l = (raw ?? {}) as Record<string, unknown>;
    const item = typeof l.slug === "string" ? ITEMS_BY_SLUG.get(l.slug) : undefined;
    const quantity = Number(l.quantity);
    if (!item || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return { error: "invalid_line" };
    const modifiers = sanitize(item, l.modifiers);
    const unit = unitCents(item, modifiers);
    lines.push({ slug: item.slug, name: item.name, quantity, modifiers, detail: describe(item, modifiers), unitCents: unit, totalCents: unit * quantity });
  }
  return {
    order: {
      cafeId: cafe.id,
      cafeName: cafe.cardName,
      pickupAt: new Date(b.pickupAt as string).toISOString(),
      name,
      lines,
      subtotalCents: lines.reduce((s, l) => s + l.totalCents, 0),
    },
  };
}

/** A short, readable order number for the counter (e.g. "N-4F7K"). */
function orderNumber() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return "N-" + [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Store the order. With Supabase configured it is persisted (table `orders`);
 * otherwise it is a demo order: fully validated and priced, but not stored —
 * the response says so and the UI labels it.
 */
export async function saveOrder(order: ValidOrder, opts: { userId: string | null; payment: "pickup" | "card" }): Promise<OrderRecord> {
  const record: OrderRecord = {
    ...order,
    id: crypto.randomUUID(),
    number: orderNumber(),
    status: opts.payment === "card" ? "awaiting_payment" : "received",
    payment: opts.payment,
    persisted: false,
  };
  const db = supabase();
  if (db) {
    const { error } = await db.from("orders").insert({
      id: record.id,
      number: record.number,
      user_id: opts.userId,
      cafe_id: record.cafeId,
      guest_name: record.name,
      pickup_at: record.pickupAt,
      status: record.status,
      payment: record.payment,
      lines: record.lines,
      subtotal_cents: record.subtotalCents,
    });
    if (error) throw new Error(`orders insert: ${error.message}`);
    record.persisted = true;
  }
  return record;
}

export async function markOrderPaid(orderId: string) {
  const db = supabase();
  if (!db) return;
  await db.from("orders").update({ status: "paid" }).eq("id", orderId);
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { money } from "@/data/ordering";
import { formatPickup } from "@/lib/pickup";
import { orderBag } from "./stores";

type Paid = { paid: boolean; number?: string; cafe?: string; pickupAt?: string; totalCents?: number };

/** After Stripe Checkout: confirm the payment with the server and show the ticket. */
export function PaidConfirmation() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<Paid | "loading" | "error">("loading");

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/orders/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Paid) => {
        setState(d);
        if (d.paid) orderBag.write([]);
      })
      .catch(() => setState("error"));
  }, [sessionId]);

  if (!sessionId || state === "error") {
    return (
      <div className="mx-auto max-w-[560px] text-center">
        <p className="font-sans text-body-sm text-stone">We couldn&rsquo;t find that payment. If you were charged, please show your email receipt at the counter.</p>
        <Button href="/order" className="mt-6">Back to ordering</Button>
      </div>
    );
  }
  if (state === "loading") return <p className="text-center font-mono text-eyebrow text-stone uppercase" role="status">Confirming payment…</p>;

  return (
    <section aria-labelledby="paid-title" className="mx-auto max-w-[560px] rounded-xl bg-espresso p-8 text-beige md:p-10">
      <p className="font-mono text-eyebrow text-caramel-glow uppercase">{state.paid ? "Paid · order received" : "Payment pending"}</p>
      <h1 id="paid-title" className="mt-3 font-display text-[3.5rem] leading-none tabular-nums">{state.number}</h1>
      <p className="mt-3 font-sans text-body-sm text-cream">
        {state.cafe && state.pickupAt ? `Ready at ${state.cafe} at ${formatPickup(state.pickupAt)}.` : ""}
        {state.totalCents != null ? ` ${money(state.totalCents)} paid.` : ""}
      </p>
      <Button href="/order" variant="inverse" className="mt-8">Order again</Button>
    </section>
  );
}

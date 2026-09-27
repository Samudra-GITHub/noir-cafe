import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { AccountButton } from "@/components/order/AccountButton";
import { OrderAhead } from "@/components/order/OrderAhead";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Order ahead",
  description: "Order your coffee ahead at any Noir Café — choose milk, sweetness and ice, pick a time, and collect it at the counter.",
  path: "/order",
});

const accounts = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

export default function OrderPage() {
  return (
    <PageTransition>
      <main>
        <OrderAhead
          accountSlot={accounts ? <AccountButton /> : <span className="font-mono text-eyebrow text-stone uppercase">Ordering as a guest</span>}
        />
      </main>
    </PageTransition>
  );
}

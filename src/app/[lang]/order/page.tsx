import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/server";
import { PageTransition } from "@/components/layout/PageTransition";
import { AccountButton } from "@/components/order/AccountButton";
import { OrderAhead } from "@/components/order/OrderAhead";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata("order", "/order");
}

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

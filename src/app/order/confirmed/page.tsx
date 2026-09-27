import { Suspense } from "react";
import type { Metadata } from "next";
import { PaidConfirmation } from "@/components/order/PaidConfirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function OrderConfirmedPage() {
  return (
    <main className="container-page pt-32 pb-24 lg:pt-[172px]">
      <Suspense>
        <PaidConfirmation />
      </Suspense>
    </main>
  );
}

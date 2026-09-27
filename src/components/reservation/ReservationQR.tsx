"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The reservation's QR code — scanned at the host stand to find the booking.
 * Encodes "NOIR-RES:<code>". The encoder loads only when a code exists.
 * A <span> (display: block) so it can sit inside running text.
 */
export function ReservationQR({ code, className, dark = "#17120e", light = "#f8f4ec" }: { code: string; className?: string; dark?: string; light?: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void import("qrcode").then((QR) =>
      QR.toString(`NOIR-RES:${code}`, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark, light } }).then((s) => alive && setSvg(s)),
    );
    return () => {
      alive = false;
    };
  }, [code, dark, light]);
  return (
    <span
      role="img"
      aria-label={`QR code for reservation ${code}`}
      className={cn("block aspect-square overflow-hidden rounded-lg bg-beige [&>svg]:size-full", className)}
      // The SVG is produced locally by the qrcode library from our own code string.
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}

/** Download an .ics invite for the booking. */
export function downloadIcs(filename: string, ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

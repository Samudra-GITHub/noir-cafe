"use client";

import dynamic from "next/dynamic";

/** Pointer-only enhancements, split out of the main bundle and never server-rendered. */
const CustomCursor = dynamic(() => import("./CustomCursor").then((m) => m.CustomCursor), { ssr: false });

export function ClientEnhancements() {
  return <CustomCursor />;
}

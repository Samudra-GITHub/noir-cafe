import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Ask the barista — Noir Café concierge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "menu", eyebrow: "Concierge", title: "Ask the barista." });
}

import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "The Noir Café autumn menu";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "menu", eyebrow: "Menu · Autumn 2026", title: "Made slowly. Served simply." });
}

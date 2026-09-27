import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Recipe Studio — Noir Café Brewing Lab";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "lab", eyebrow: "Brewing Lab · Studio", title: "Build a recipe. Watch the cup change." });
}

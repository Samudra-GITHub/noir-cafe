import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "The Noir Café brewing lab";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "lab", eyebrow: "Brewing lab", title: "Five transformations. One expressive cup." });
}

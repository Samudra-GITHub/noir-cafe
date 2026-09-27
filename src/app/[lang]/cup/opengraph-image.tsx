import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "From seed to cup, in 3D — Noir Café";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "lab", eyebrow: "From seed to cup · 3D", title: "Five transformations. One expressive cup." });
}

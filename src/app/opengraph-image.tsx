import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Noir Café — specialty coffee in New York";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "home", eyebrow: "Specialty coffee · New York", title: "Where every cup tells a story." });
}

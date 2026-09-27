import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "The Noir Café shop";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "shop", eyebrow: "Objects for ritual · Edition 03", title: "Good tools invite better mornings." });
}

import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Reserve a table at Noir Café";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ backdrop: "reservation", eyebrow: "Reservations · Mercer Street", title: "Your table, held quietly." });
}

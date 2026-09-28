import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION } from "@/lib/seo";

const SHORTCUT_ICON = { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" };

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    lang: "en",
    dir: "ltr",
    name: "Noir Café",
    short_name: "Noir",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#f8f4ec",
    theme_color: "#17120e",
    categories: ["food", "lifestyle"],
    prefer_related_applications: false,
    // A second launch focuses the open window instead of opening another.
    launch_handler: { client_mode: ["focus-existing", "auto"] },
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Reserve a table", short_name: "Reserve", url: "/reservation", icons: [SHORTCUT_ICON] },
      { name: "Order ahead", short_name: "Order", url: "/order", icons: [SHORTCUT_ICON] },
      { name: "Menu", url: "/menu", icons: [SHORTCUT_ICON] },
    ],
    screenshots: [
      { src: "/screenshots/phone-home.jpg", sizes: "780x1688", type: "image/jpeg", form_factor: "narrow", label: "Noir Café on a phone" },
      { src: "/screenshots/desktop-home.jpg", sizes: "1440x900", type: "image/jpeg", form_factor: "wide", label: "Noir Café on a desktop" },
    ],
  };
}

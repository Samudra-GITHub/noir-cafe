import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const ROUTES = [
  { path: "", priority: 1 },
  { path: "/menu", priority: 0.9 },
  { path: "/reservation", priority: 0.9 },
  { path: "/locations", priority: 0.8 },
  { path: "/shop", priority: 0.8 },
  { path: "/story", priority: 0.6 },
  { path: "/brewing-lab", priority: 0.6 },
  { path: "/brewing-lab/studio", priority: 0.5 },
  { path: "/cup", priority: 0.5 },
  { path: "/concierge", priority: 0.5 },
  { path: "/order", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority,
  }));
}

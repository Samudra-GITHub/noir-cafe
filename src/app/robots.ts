import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Pages are open to crawlers; the API, the offline fallback and order receipts are not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/offline", "/*/offline", "/order/confirmed", "/*/order/confirmed"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

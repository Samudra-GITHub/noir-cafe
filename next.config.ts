import type { NextConfig } from "next";
import { securityHeaders } from "./security-headers";

const YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Every image is local (public/); no remote hosts are allowed through the optimizer.
    remotePatterns: [],
    qualities: [60, 75, 85],
    deviceSizes: [390, 640, 828, 1080, 1440, 1920, 2560],
    minimumCacheTTL: YEAR,
  },
  experimental: {
    // Tree-shake the motion and scroll libraries per import.
    optimizePackageImports: ["framer-motion", "lenis"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders() },
      {
        // The service worker must always be fresh so updates roll out.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
      {
        // Videos and photography are content-addressed by name; cache hard and allow range requests.
        source: "/:dir(videos|images|icons)/:path*",
        headers: [
          { key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` },
          { key: "Accept-Ranges", value: "bytes" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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

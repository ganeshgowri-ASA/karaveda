import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure external packages used in API routes are properly bundled
  serverExternalPackages: ["@qdrant/js-client-rest", "cheerio"],
  images: {
    unoptimized: false,
  },
};

export default nextConfig;

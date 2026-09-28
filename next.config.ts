import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
    middlewareClientMaxBodySize: "500mb",
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

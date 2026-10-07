import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  devIndicators: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

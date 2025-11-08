import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    domains: ["vercel.com"],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  basePath: "",
};

export default nextConfig;

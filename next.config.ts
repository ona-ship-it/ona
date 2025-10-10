import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vercel.com'],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  // Serve assets from the current host (no cross-origin prefix)
  // basePath intentionally left default
};

export default nextConfig;

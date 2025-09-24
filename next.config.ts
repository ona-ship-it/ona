import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  swcMinify: true,
  reactStrictMode: true,
  images: {
    domains: ['vercel.com'],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["vercel.com", "onaguicom-git-onagui-new-feature-theos-projects-a68fa111.vercel.app"],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  basePath: "",
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://onaguicom-git-onagui-new-feature-theos-projects-a68fa111.vercel.app"
      : "",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['i.pravatar.cc'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default nextConfig;

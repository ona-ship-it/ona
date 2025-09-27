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
};

export default nextConfig;

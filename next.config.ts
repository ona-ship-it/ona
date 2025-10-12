import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  basePath: "",
  // Do not override assetPrefix; let Vercel serve static assets from deployment domain
  assetPrefix: undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  typedRoutes: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    domains: [
      "vercel.com",
      "onaguicom-git-onagui-new-feature-theos-projects-a68fa111.vercel.app",
      "i.pravatar.cc",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

export default nextConfig;

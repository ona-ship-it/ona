import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "onagui.com" }],
        destination: "https://www.onagui.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

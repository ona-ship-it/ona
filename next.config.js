/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next only traces files within this project (Next 15+)
  outputFileTracingRoot: __dirname,
  typescript: {
    // Skip type checking during build (type errors in node_modules)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const path = require('path')

if (process.env.NODE_ENV !== 'development' && !process.env.CRON_SECRET) {
  console.warn('⚠️  CRON_SECRET is missing. Protected cron/API endpoints will reject requests.')
}

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
  // Turbopack is used for development builds, but it doesn't support webpack-style
  // resolve alias configuration. We rely on TypeScript path mapping (tsconfig.json)
  // for the `@/*` import paths.
  turbopack: {},
  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config
  },
};

module.exports = nextConfig;

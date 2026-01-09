/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: ['node-cron', 'pg', 'nodemailer'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude server-only services from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/services/withdrawalWorker': false,
        '@/services/reconciliationMonitor': false,
        '@/services/walletServiceManager': false,
        '@/services/onChainMonitor': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
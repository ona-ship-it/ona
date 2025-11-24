/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next only traces files within this project (Next 15+)
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
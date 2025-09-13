/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai']
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
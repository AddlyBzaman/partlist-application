/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tls: false,
        net: false,
        fs: false,
        dns: false,
        'crypto': false,
        'stream': false,
        'url': false,
        'zlib': false,
        'http': false,
        'https': false,
        'assert': false,
        'os': false,
        'path': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
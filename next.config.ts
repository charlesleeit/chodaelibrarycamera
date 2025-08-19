import { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  experimental: {
    typedRoutes: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default config;

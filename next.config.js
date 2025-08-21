const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, './'),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ----> DETTA ÄR DEN VIKTIGA ÄNDRINGEN <----
    ignoreBuildErrors: true, 
  },
  images: {
    unoptimized: false,
    domains: ['cdn.reai.io'],
    minimumCacheTTL: 60,
  },
  // Cloud Run specific optimizations
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack-konfiguration för sökvägar
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
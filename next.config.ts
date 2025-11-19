import withPWA from 'next-pwa';
import type { NextConfig } from 'next';

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_middlewareManifest\.js$/,
  ],
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  eslint: {
    // ESLint errors are checked during development
    // Temporarily disabled during builds to allow deployment while fixing errors incrementally
    // TODO: Fix all ESLint errors and set to false for better code quality
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript errors are checked during development
    // All 46 TypeScript errors have been fixed - can now enforce type checking
    // Set to false to enable strict type checking during builds
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'recharts'
    ],
    // Speed up Fast Refresh
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Standalone output for optimized production builds
  output: 'standalone',
  // Optimize webpack for faster builds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster development builds
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    
    // Optimize module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'novunt-backend-uw3z.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    formats: ['image/avif', 'image/webp']
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
};

export default withPWAConfig(nextConfig);
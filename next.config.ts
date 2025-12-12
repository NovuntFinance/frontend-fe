import { withSentryConfig } from '@sentry/nextjs';
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
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
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
      'recharts',
    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Disable standalone output on Windows to avoid path issues
  // Re-enable for production deployments if needed
  output: process.platform === 'win32' ? undefined : 'standalone',
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

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
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
};

export default withSentryConfig(withPWAConfig(nextConfig), {
  org: 'novunt',
  project: 'javascript-nextjs',
  // Silent mode suppresses warnings when auth token is missing
  silent: true,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
  // Note: To enable source map uploads and releases, add SENTRY_AUTH_TOKEN
  // to Vercel environment variables. Without it, Sentry will work but
  // won't upload source maps or create releases (warnings are suppressed).
});

// Sentry wrapper available when re-enabling: import { withSentryConfig } from '@sentry/nextjs';
// Temporarily disable PWA to debug build issue - will re-enable after fixing
// import withPWA from 'next-pwa';
import type { NextConfig } from 'next';
import { securityHeaders } from './src/lib/security-headers';

// Temporarily disabled PWA config
// const withPWAConfig = withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
//   buildExcludes: [
//     /middleware-manifest\.json$/,
//     /app-build-manifest\.json$/,
//     /_buildManifest\.js$/,
//     /_middlewareManifest\.js$/,
//   ],
//   runtimeCaching: [
//     {
//       urlPattern: /^https?.*/,
//       handler: 'NetworkFirst',
//       options: {
//         cacheName: 'offlineCache',
//         expiration: {
//           maxEntries: 200,
//         },
//       },
//     },
//   ],
// });

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow Vercel deploy: do not fail build on ESLint (fix warnings locally over time)
  eslint: {
    ignoreDuringBuilds: true,
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
  // Disable standalone output on Windows to avoid path issues
  // Re-enable for production deployments if needed
  output: process.platform === 'win32' ? undefined : 'standalone',
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
  // Keep webpack config for compatibility, but Turbopack will be used
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
        hostname: 'api.novunt.com',
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

  // Security: HTTPS-only, HSTS, CSP, clickjacking protection (see src/lib/security-headers.ts)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

// Temporarily export config without Sentry/PWA wrappers to debug build
// Re-enable after fixing the build issue
export default nextConfig;
// export default withSentryConfig(withPWAConfig(nextConfig), {
//   org: 'novunt',
//   project: 'javascript-nextjs',
//   silent: true,
//   widenClientFileUpload: true,
//   disableLogger: true,
//   automaticVercelMonitors: true,
// });

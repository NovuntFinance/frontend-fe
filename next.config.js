/**
 * Next.js Configuration with Sentry Integration
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing config
  reactStrictMode: true,
};

// Bundle analyzer (when ANALYZE=true)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Apply bundle analyzer if needed
const configWithAnalyzer = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(nextConfig)
  : nextConfig;

// Sentry configuration options
const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload source maps for better error tracking
  silent: true,
  
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  
  // Hide source maps from generated client bundles
  hideSourceMaps: true,
  
  // Route browser requests to Sentry through a Next.js rewrite to avoid ad-blockers
  tunnelRoute: '/monitoring',
  
  // Adjust this value in production
  widenClientFileUpload: true,
  
  // Hides source maps from generated client bundles
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

// Export config with Sentry
module.exports = withSentryConfig(configWithAnalyzer, sentryOptions);

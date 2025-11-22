/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Bundle Analyzer Configuration
 * Analyze and visualize bundle size
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing next config
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = process.env.ANALYZE === 'true'
  ? withBundleAnalyzer(nextConfig)
  : nextConfig;

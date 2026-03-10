import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://novunt.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/terms', '/privacy', '/login', '/register', '/signup'],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/debug-auth',
          '/debug-token',
          '/sentry-test',
          '/sentry-example-page',
          '/verify-email',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

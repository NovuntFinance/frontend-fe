/**
 * Content Security Policy Configuration
 * For Next.js middleware or next.config.js
 *
 * Security: Disallow inline scripts and eval where possible.
 * Next.js may require 'unsafe-inline' / 'unsafe-eval' in dev; consider nonces in production.
 * Test: Inline script injection must fail (e.g. <script>alert(1)</script> in user content).
 */

export const cspDirectives = {
  // Default: same origin only
  'default-src': ["'self'"],

  // Scripts: same origin + trusted CDNs. Inline/eval required for Next.js; restrict in prod if using nonces.
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://vercel.live',
    'https://*.vercel.com',
    'https://challenges.cloudflare.com',
  ],

  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],

  'img-src': ["'self'", 'data:', 'blob:', 'https:'],

  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],

  'connect-src': [
    "'self'",
    // Novunt API and frontend domains
    'https://api.novunt.com',
    'https://www.novunt.com',
    'https://novunt.com',
    process.env.NEXT_PUBLIC_API_URL || '',
    'https://*.vercel.com',
    'wss://*.vercel.com',
    'https://challenges.cloudflare.com',
    // Third-party public APIs used for live trading signals
    'https://api.coingecko.com',
    'https://api.frankfurter.app',
    // Sentry error tracking
    'https://*.ingest.de.sentry.io',
    'https://*.sentry.io',
  ],

  // Frames: Turnstile widget
  'frame-src': ["'self'", 'https://challenges.cloudflare.com'],

  'media-src': ["'self'"],

  'object-src': ["'none'"],

  'base-uri': ["'self'"],

  'form-action': ["'self'"],

  // Clickjacking protection
  'frame-ancestors': ["'none'"],

  'upgrade-insecure-requests': [],
};

/**
 * Convert CSP directives to header string
 */
export function generateCSPHeader(
  directives: typeof cspDirectives = cspDirectives
): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Build CSP header with a nonce for script-src and style-src (no unsafe-inline for scripts).
 * Use in Next.js proxy when you enable nonce-based CSP. See docs/CSP_NONCE_HARDENING.md.
 */
export function generateCSPHeaderWithNonce(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    'https://vercel.live',
    'https://*.vercel.com',
    'https://challenges.cloudflare.com',
  ].join(' ');
  const styleSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    'https://fonts.googleapis.com',
  ].join(' ');
  const rest = Object.entries(cspDirectives)
    .filter(([key]) => key !== 'script-src' && key !== 'style-src')
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  return `default-src 'self'; script-src ${scriptSrc}; style-src ${styleSrc}; ${rest}`;
}

/**
 * Security headers for Next.js
 * Add to next.config.js
 */
export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: generateCSPHeader(),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/**
 * Example usage in next.config.js:
 *
 * const { securityHeaders } = require('./src/lib/security-headers');
 *
 * module.exports = {
 *   async headers() {
 *     return [
 *       {
 *         source: '/:path*',
 *         headers: securityHeaders,
 *       },
 *     ];
 *   },
 * };
 */

/**
 * Content Security Policy Configuration
 * For Next.js middleware or next.config.js
 */

export const cspDirectives = {
    // Default source: only allow same origin
    'default-src': ["'self'"],

    // Scripts: allow same origin and specific trusted domains
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Next.js
        "'unsafe-eval'", // Required for Next.js dev mode
        'https://vercel.live',
        'https://*.vercel.com',
    ],

    // Styles: allow same origin and inline styles (for styled-components, etc.)
    'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
    ],

    // Images: allow same origin, data URIs, and CDNs
    'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
    ],

    // Fonts: allow same origin and Google Fonts
    'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
    ],

    // Connect (API calls): allow same origin and your API
    'connect-src': [
        "'self'",
        process.env.NEXT_PUBLIC_API_URL || '',
        'https://*.vercel.com',
        'wss://*.vercel.com',
    ],

    // Media: allow same origin
    'media-src': ["'self'"],

    // Objects: disallow plugins (Flash, Java, etc.)
    'object-src': ["'none'"],

    // Base URI: restrict to same origin
    'base-uri': ["'self'"],

    // Forms: only allow submitting to same origin
    'form-action': ["'self'"],

    // Frame ancestors: prevent clickjacking
    'frame-ancestors': ["'none'"],

    // Upgrade insecure requests
    'upgrade-insecure-requests': [],
};

/**
 * Convert CSP directives to header string
 */
export function generateCSPHeader(directives: typeof cspDirectives = cspDirectives): string {
    return Object.entries(directives)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
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

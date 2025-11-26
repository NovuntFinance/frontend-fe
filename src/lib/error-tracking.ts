/**
 * Error Tracking Integration
 * Sentry setup for production error monitoring
 */

import * as SentryLib from '@sentry/nextjs';

// Cast to any for advanced browser tracing/replay APIs which may not be present
// in the typed Sentry SDK but are available at runtime.

const Sentry: any = SentryLib;

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

/**
 * Initialize Sentry
 * Call this in app startup (layout.tsx or _app.tsx)
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('⚠️ Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: `novunt-frontend@${APP_VERSION}`,

    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session Replay (optional)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.yourdomain\.com/,
        ],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Error filtering

    beforeSend(event: any, hint: any) {
      // Filter out development errors
      if (ENVIRONMENT === 'development') {
        console.error('Sentry Event:', event);
        return null; // Don't send in development
      }

      // Filter out known errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't track cancellation errors
        if (
          error.message.includes('cancelled') ||
          error.message.includes('aborted')
        ) {
          return null;
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Failed to fetch',
    ],
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Manually capture exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture message
 */
export function captureMessage(message: string, level: string = 'info') {
  Sentry.captureMessage(message, level as any);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}

/**
 * Integration with logger
 */
export function integrateWithLogger() {
  const originalError = console.error;
  console.error = (...args) => {
    // Call original console.error
    originalError(...args);

    // Send to Sentry if it's an Error object
    const error = args[0];
    if (error instanceof Error) {
      captureException(error);
    }
  };
}

// Export Sentry for advanced usage
export { Sentry };

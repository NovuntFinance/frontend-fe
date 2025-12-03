// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Prefer environment variable, fall back to hard-coded DSN for safety
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    'https://25743c5c8c6de3e984e0792b4e94f96c@o4510407588315136.ingest.de.sentry.io/4510407588708432',

  // Set environment and release/version tracking
  environment: process.env.NODE_ENV || 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Integrations
  integrations(integrations) {
    return [
      ...integrations,
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ];
  },

  // Filter errors before sending
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      // Only log errors, not all events (reduce console noise)
      const error = hint?.originalException;
      if (error instanceof Error) {
        // Skip logging MetaMask extension errors (they're not app errors)
        if (
          error.message?.includes('MetaMask') ||
          error.message?.includes('Failed to connect to MetaMask') ||
          error.stack?.includes(
            'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn'
          )
        ) {
          return null;
        }
        // Log actual errors for debugging
        console.error('[Sentry Event]', event);
      }
      return null;
    }

    const error = hint?.originalException;
    if (error instanceof Error) {
      // Ignore test errors from Sentry test page
      if (
        error.message.includes('Test error from Sentry') ||
        error.message.includes('Error with breadcrumbs')
      ) {
        return null;
      }

      // Ignore MetaMask extension errors (not app errors)
      if (
        error.message?.includes('MetaMask') ||
        error.message?.includes('Failed to connect to MetaMask') ||
        error.stack?.includes(
          'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn'
        )
      ) {
        return null;
      }

      // Don't track cancellation errors
      if (
        error.message.includes('cancelled') ||
        error.message.includes('aborted')
      ) {
        return null;
      }
    }

    // Filter out favicon 404 errors
    if (event.request?.url?.includes('favicon')) {
      return null;
    }

    // Filter out test page errors
    if (event.request?.url?.includes('/sentry-test')) {
      return null;
    }

    // Filter out MetaMask extension URLs
    if (
      event.request?.url?.includes(
        'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn'
      )
    ) {
      return null;
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'cancelled',
    // Ignore test errors
    'Test error from Sentry verification page',
    'Error with breadcrumbs',
    // Ignore favicon errors
    'favicon.ico',
    // Ignore MetaMask extension errors
    'Failed to connect to MetaMask',
    'MetaMask',
    'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn',
  ],

  // Ignore transactions (performance tracking) for certain URLs
  ignoreTransactions: ['/sentry-test', '/favicon.ico', '/favicon--route-entry'],

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

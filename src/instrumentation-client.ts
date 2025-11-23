// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://25743c5c8c6de3e984e0792b4e94f96c@o4510407588315136.ingest.de.sentry.io/4510407588708432",

  // Set environment
  environment: process.env.NODE_ENV || 'development',

  // Add release/version tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% when error occurs

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter errors before sending
  beforeSend(event, hint) {
    // Don't send in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry Event]', event);
      return null;
    }

    // Filter out test errors
    const error = hint.originalException;
    if (error instanceof Error) {
      // Ignore test errors from Sentry test page
      if (error.message.includes('Test error from Sentry') ||
        error.message.includes('Error with breadcrumbs')) {
        return null;
      }

      // Don't track cancellation errors
      if (error.message.includes('cancelled') || error.message.includes('aborted')) {
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
  ],

  // Ignore transactions (performance tracking) for certain URLs
  ignoreTransactions: [
    '/sentry-test',
    '/favicon.ico',
    '/favicon--route-entry',
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
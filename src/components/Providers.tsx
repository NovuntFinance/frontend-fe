'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ShareAndSocialProofProvider } from '@/components/providers/ShareAndSocialProofProvider';
import { logger } from '@/lib/logger';
import { GlobalModalsProvider } from '@/contexts/GlobalModalsContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { TwoFAProvider } from '@/contexts/TwoFAContext';
import { CommandPalette } from '@/components/search/CommandPalette';
import { AuthSessionHandler } from '@/components/auth/AuthSessionHandler';
import { initializePlatformSettings } from '@/services/platformSettingsService';

export function Providers({ children }: { children: React.ReactNode }) {
  // Debug logging at app initialization
  useEffect(() => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
    logger.info('Frontend initialized', {
      apiBaseURL: apiBaseURL || 'NOT SET',
      environment: process.env.NODE_ENV,
    });

    // Initialize platform settings (fetch platform day start)
    // This may fail with 401 if user is not authenticated - that's OK, we use default
    initializePlatformSettings().catch((error: any) => {
      // 401/403 are expected when backend restricts public settings; use default, don't log as error
      const status = error?.response?.status || error?.statusCode;
      if (status !== 401 && status !== 403) {
        logger.error('Failed to initialize platform settings', { error });
      }
    });

    if (!apiBaseURL) {
      logger.warn('NEXT_PUBLIC_API_URL is not set', {
        instructions: {
          development: 'NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1',
          production: 'NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1',
        },
      });
    } else {
      logger.success('NEXT_PUBLIC_API_URL is configured', { url: apiBaseURL });
    }

    // Suppress MetaMask extension errors (they're not app errors)
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      const stack = args[1]?.stack || args[0]?.stack || '';

      // Suppress MetaMask extension errors
      if (
        message.includes('MetaMask') ||
        message.includes('Failed to connect to MetaMask') ||
        stack.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn') ||
        args.some(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn')
        )
      ) {
        // Silently ignore MetaMask extension errors
        return;
      }

      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';

      // Suppress MetaMask extension warnings
      if (
        message.includes('MetaMask') ||
        message.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn')
      ) {
        // Silently ignore MetaMask extension warnings
        return;
      }

      originalWarn.apply(console, args);
    };

    // Global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error || event.message || '';
      const errorString = error.toString() || '';
      const stack = event.error?.stack || '';

      // Suppress MetaMask extension errors
      if (
        errorString.includes('MetaMask') ||
        errorString.includes('Failed to connect to MetaMask') ||
        stack.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn')
      ) {
        event.preventDefault();
        return;
      }
    };

    // Global unhandled promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      const stack = event.reason?.stack || '';

      // Suppress MetaMask extension promise rejections
      if (
        reason.includes('MetaMask') ||
        reason.includes('Failed to connect to MetaMask') ||
        stack.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn')
      ) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TwoFAProvider>
            <ConfigProvider>
              <GlobalModalsProvider>
                <AuthSessionHandler />
                {children}
                <Toaster position="top-right" richColors />

                {/* Command Palette - Global Search (Cmd+K / Ctrl+K) */}
                <CommandPalette />

                {/* Viral Growth Features: Share Modal + Live Activity Feed */}
                <ShareAndSocialProofProvider />
              </GlobalModalsProvider>
            </ConfigProvider>
          </TwoFAProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Cleanup extension-injected attributes that commonly cause hydration mismatches
// (e.g. Grammarly adds data-gr-ext-installed/data-new-gr-c-s-check-loaded)
export function cleanupInjectedAttributes() {
  if (typeof document === 'undefined') return;
  const attrs = ['data-gr-ext-installed', 'data-new-gr-c-s-check-loaded'];
  attrs.forEach((a) => {
    if (document.body.hasAttribute && document.body.hasAttribute(a)) {
      document.body.removeAttribute(a);
    }
  });
}

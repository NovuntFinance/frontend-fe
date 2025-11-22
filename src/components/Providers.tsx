"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ShareAndSocialProofProvider } from '@/components/providers/ShareAndSocialProofProvider';
import { logger } from '@/lib/logger';

export function Providers({ children }: { children: React.ReactNode }) {
  // Debug logging at app initialization
  useEffect(() => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
    logger.info('Frontend initialized', {
      apiBaseURL: apiBaseURL || 'NOT SET',
      environment: process.env.NODE_ENV,
    });

    if (!apiBaseURL) {
      logger.warn('NEXT_PUBLIC_API_URL is not set', {
        instructions: {
          development: 'NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1',
          production: 'NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1',
        },
      });
    } else {
      logger.success('NEXT_PUBLIC_API_URL is configured', { url: apiBaseURL });
    }
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
          {children}
          <Toaster position="top-right" richColors />

          {/* Viral Growth Features: Share Modal + Live Activity Feed */}
          <ShareAndSocialProofProvider />
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


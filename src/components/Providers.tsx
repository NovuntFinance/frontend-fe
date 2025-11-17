"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  // Debug logging at app initialization
  useEffect(() => {
    const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;
    console.log('🔧 ==========================================');
    console.log('🔧 Frontend Initialization');
    console.log('🔧 ==========================================');
    console.log('🔧 API Base URL:', apiBaseURL || 'NOT SET');
    console.log('🔧 Environment:', process.env.NODE_ENV);
    console.log('🔧 NEXT_PUBLIC_API_URL:', apiBaseURL || 'NOT SET (using fallback)');
    
    if (!apiBaseURL) {
      console.warn('⚠️ NEXT_PUBLIC_API_URL is not set!');
      console.warn('⚠️ Please set it in .env.local:');
      console.warn('⚠️   Development: NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1');
      console.warn('⚠️   Production: NEXT_PUBLIC_API_URL=https://novunt-backend-uw3z.onrender.com/api/v1');
    } else {
      console.log('✅ NEXT_PUBLIC_API_URL is configured:', apiBaseURL);
    }
    console.log('🔧 ==========================================');
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
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

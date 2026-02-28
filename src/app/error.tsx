/**
 * Custom Global Error Page (500)
 * Handles runtime errors with branded design
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import dynamicImport from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

// Dynamically import Logo to avoid SSR issues
const Logo = dynamicImport(() => import('@/components/ui/logo').then(mod => ({ default: mod.Logo })), { ssr: false });

// Disable static generation
export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-b from-novunt-blue-900 via-background to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danger/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Header */}
        <header className="shrink-0 p-4">
          {typeof window !== 'undefined' && <Logo size="md" />}
        </header>

        {/* Main Content - scrollable only if needed on very small screens */}
        <main className="flex-1 flex items-center justify-center px-4 min-h-0 py-2">
          <div className="max-w-xl w-full text-center space-y-4">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-danger" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                Something Went Wrong
              </h1>
              <p className="text-sm text-muted-foreground">
                We encountered an unexpected error. Our team has been notified and we&apos;re working on fixing it.
              </p>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <Card className="border-danger/20 bg-danger/5">
                <CardContent className="p-3 text-left">
                  <p className="text-xs font-mono text-danger break-all line-clamp-2">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Error ID: {error.digest}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                size="default"
                onClick={reset}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                size="default"
                variant="outline"
                asChild
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Support - compact inline */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <a
                  href="mailto:support@novunt.com"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact Support
                </a>
              </p>
              <span className="hidden sm:inline text-muted-foreground/50">·</span>
              <p className="text-xs text-muted-foreground">
                Try: refresh the page, clear cache, or try again later.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="shrink-0 py-3 text-center text-xs text-muted-foreground">
          © 2025 Novunt
        </footer>
      </div>
    </div>
  );
}

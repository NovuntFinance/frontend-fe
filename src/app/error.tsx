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
const Logo = dynamicImport(
  () => import('@/components/ui/logo').then((mod) => ({ default: mod.Logo })),
  { ssr: false }
);

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
    <div className="from-novunt-blue-900 via-background to-background flex h-screen flex-col overflow-hidden bg-gradient-to-b">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-danger/10 absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Header */}
        <header className="shrink-0 p-4">
          {typeof window !== 'undefined' && <Logo size="md" />}
        </header>

        {/* Main Content - scrollable only if needed on very small screens */}
        <main className="flex min-h-0 flex-1 items-center justify-center px-4 py-2">
          <div className="w-full max-w-xl space-y-4 text-center">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="bg-danger/10 flex h-16 w-16 items-center justify-center rounded-full">
                <AlertTriangle className="text-danger h-8 w-8" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-1">
              <h1 className="text-foreground text-2xl font-bold">
                Something Went Wrong
              </h1>
              <p className="text-muted-foreground text-sm">
                We encountered an unexpected error. Our team has been notified
                and we&apos;re working on fixing it.
              </p>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <Card className="border-danger/20 bg-danger/5">
                <CardContent className="p-3 text-left">
                  <p className="text-danger line-clamp-2 font-mono text-xs break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      Error ID: {error.digest}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
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
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <p className="text-muted-foreground text-xs">
                Need help?{' '}
                <a
                  href="/dashboard"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Contact Support
                </a>
              </p>
              <span className="text-muted-foreground/50 hidden sm:inline">
                ·
              </span>
              <p className="text-muted-foreground text-xs">
                Try: refresh the page, clear cache, or try again later.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-muted-foreground shrink-0 py-3 text-center text-xs">
          © 2025 Novunt
        </footer>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-gradient-to-b from-novunt-blue-900 via-background to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-danger/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6">
          {typeof window !== 'undefined' && <Logo size="lg" />}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-danger/10 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-16 h-16 text-danger" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-danger/20 animate-ping" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Something Went Wrong
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                We encountered an unexpected error. Our team has been notified and we&apos;re working on fixing it.
              </p>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <Card className="border-danger/20 bg-danger/5">
                <CardContent className="p-4 text-left">
                  <p className="text-sm font-mono text-danger break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={reset}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Support Card */}
            <Card className="mt-12 border-primary/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  If this problem persists, please contact our support team.
                </p>
                <Button
                  variant="outline"
                  asChild
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  <a href="mailto:support@novunt.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </a>
                </Button>
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Reference Code: {error.digest}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* What You Can Do */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold">What you can try:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Try again in a few minutes</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Novunt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

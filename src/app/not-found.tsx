/**
 * Custom 404 Not Found Page
 * Branded error page with helpful navigation
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

// Dynamically import Logo to avoid SSR issues
const Logo = dynamicImport(() => import('@/components/ui/logo').then(mod => ({ default: mod.Logo })), { ssr: false });

// Disable static generation
export const dynamic = 'force-dynamic';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-novunt-blue-900 via-background to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-novunt-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6">
          {typeof window !== 'undefined' && <Logo size="lg" />}
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 relative z-10">
          <div className="max-w-2xl w-full text-center space-y-8">
            {/* Error Code */}
            <div className="relative">
              <h1 className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-10">💎</div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Page Not Found
              </h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  The page you couldn&apos;t find the page you were looking for.
                  It&apos;s possible the page was moved or deleted.
                  Go back to the homepage and try again.
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.back()}
                className="bg-primary hover:bg-primary/90"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Go Back
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Home Page
                </Link>
              </Button>
            </div>

            {/* Quick Links */}
            <Card className="mt-12 border-primary/20 relative z-10">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  Quick Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group relative z-10"
                    prefetch={true}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Home className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Dashboard</p>
                      <p className="text-xs text-muted-foreground">View your account</p>
                    </div>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group relative z-10"
                    prefetch={true}
                  >
                    <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <Search className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Sign In</p>
                      <p className="text-xs text-muted-foreground">Access your account</p>
                    </div>
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group relative z-10"
                    prefetch={true}
                  >
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <HelpCircle className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Get Started</p>
                      <p className="text-xs text-muted-foreground">Create an account</p>
                    </div>
                  </Link>
                  <Link
                    href="/#learn"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group relative z-10"
                    prefetch={false}
                  >
                    <div className="p-2 rounded-lg bg-novunt-gold-500/10 group-hover:bg-novunt-gold-500/20 transition-colors">
                      <HelpCircle className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-foreground">Learn More</p>
                      <p className="text-xs text-muted-foreground">About Novunt</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
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

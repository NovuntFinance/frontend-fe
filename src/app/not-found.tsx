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
const Logo = dynamicImport(
  () => import('@/components/ui/logo').then((mod) => ({ default: mod.Logo })),
  { ssr: false }
);

// Disable static generation
export const dynamic = 'force-dynamic';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="from-novunt-blue-900 via-background to-background min-h-screen bg-gradient-to-b">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-novunt-gold-500/10 absolute top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary/10 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="p-6">
          {typeof window !== 'undefined' && <Logo size="lg" />}
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-2xl space-y-8 text-center">
            {/* Error Code */}
            <div className="relative">
              <h1 className="from-primary via-secondary to-primary bg-gradient-to-r bg-clip-text text-9xl font-bold text-transparent md:text-[12rem]">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-10">💎</div>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4">
              <h2 className="text-foreground text-3xl font-bold md:text-4xl">
                Page Not Found
              </h2>
              <p className="text-muted-foreground mx-auto max-w-md text-lg">
                The page you couldn&apos;t find the page you were looking for.
                It&apos;s possible the page was moved or deleted. Go back to the
                homepage and try again.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
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
                <Link href="/dashboard">
                  <Home className="mr-2 h-5 w-5" />
                  Home Page
                </Link>
              </Button>
            </div>

            {/* Quick Links */}
            <Card className="border-primary/20 relative z-10 mt-12">
              <CardContent className="p-6">
                <h3 className="text-muted-foreground mb-4 text-sm font-semibold">
                  Quick Links
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link
                    href="/dashboard"
                    className="hover:bg-primary/5 group relative z-10 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                    prefetch={true}
                  >
                    <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors">
                      <Home className="text-primary h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground text-sm font-medium">
                        Dashboard
                      </p>
                      <p className="text-muted-foreground text-xs">
                        View your account
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/login"
                    className="hover:bg-primary/5 group relative z-10 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                    prefetch={true}
                  >
                    <div className="bg-secondary/10 group-hover:bg-secondary/20 rounded-lg p-2 transition-colors">
                      <Search className="text-secondary h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground text-sm font-medium">
                        Sign In
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Access your account
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/signup"
                    className="hover:bg-primary/5 group relative z-10 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                    prefetch={true}
                  >
                    <div className="bg-accent/10 group-hover:bg-accent/20 rounded-lg p-2 transition-colors">
                      <HelpCircle className="text-accent h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground text-sm font-medium">
                        Get Started
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Create an account
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/#learn"
                    className="hover:bg-primary/5 group relative z-10 flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
                    prefetch={false}
                  >
                    <div className="bg-novunt-gold-500/10 group-hover:bg-novunt-gold-500/20 rounded-lg p-2 transition-colors">
                      <HelpCircle className="text-secondary h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground text-sm font-medium">
                        Learn More
                      </p>
                      <p className="text-muted-foreground text-xs">
                        About Novunt
                      </p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-muted-foreground p-6 text-center text-sm">
          <p>© 2025 Novunt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

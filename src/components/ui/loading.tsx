/**
 * Branded Loading Components
 * Loading indicators with Novunt branding
 */

'use client';

import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { ShimmerCard } from '@/components/ui/shimmer';

interface LoadingProps {
  /** Optional label shown under the spinner. */
  label?: string;
  /** Additional tailwind classes for the container. */
  className?: string;
  /** Size of the spinner in rem units (default 3rem). */
  size?: number;
}

const Loading = ({ label = 'Loading…', className, size = 3 }: LoadingProps) => {
  const spinnerSize = `${size}rem`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'text-muted-foreground flex flex-col items-center gap-4',
        className
      )}
    >
      <div
        className="border-primary/80 animate-spin rounded-full border-4 border-t-transparent"
        style={{ width: spinnerSize, height: spinnerSize }}
      />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </div>
  );
};

export default Loading;

/**
 * Full-screen loading component with Novunt branding
 */
export function LoadingScreen({
  message = 'Loading...',
  showLogo = true,
  size = 'lg',
  className,
}: {
  message?: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'from-novunt-blue-900 to-background bg-gradient-to-b',
        className
      )}
    >
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-novunt-gold-500/20 absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
        <div className="bg-primary/20 absolute right-1/4 bottom-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {showLogo && (
          <div className="animate-pulse">
            <Logo size={size} clickable={false} />
          </div>
        )}

        {/* Loading spinner */}
        <div className="relative">
          <div className="border-primary/20 border-t-primary h-16 w-16 animate-spin rounded-full border-4" />
        </div>

        {message && (
          <p className="animate-pulse text-lg font-medium text-white/90">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for content
 * Uses ShimmerCard for consistent loading experience
 */
export function LoadingSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerCard key={i} className="h-4" />
      ))}
    </div>
  );
}

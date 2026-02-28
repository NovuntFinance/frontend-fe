/**
 * Branded Loading Components
 * Loading indicators with Novunt branding (rotating logo)
 */

'use client';

import { cn } from '@/lib/utils';
import { ShimmerCard } from '@/components/ui/shimmer';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';

interface LoadingProps {
  /** Optional label shown under the spinner. */
  label?: string;
  /** Additional tailwind classes for the container. */
  className?: string;
  /** Size of the spinner: sm, md, lg, xl (default lg). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Loading = ({
  label = 'Loading…',
  className,
  size = 'lg',
}: LoadingProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'text-muted-foreground flex flex-col items-center gap-4',
        className
      )}
    >
      <NovuntSpinner size={size} />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </div>
  );
};

export default Loading;

/**
 * Full-screen loading component with Novunt branding (rotating logo)
 */
export function LoadingScreen({
  message = 'Loading...',
  size = 'xl',
  className,
}: {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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

      {/* Content: rotating Novunt logo (same as index/auth) */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <NovuntSpinner size={size} />
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

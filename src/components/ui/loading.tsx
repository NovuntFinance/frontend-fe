/**
 * Branded Loading Components
 * Loading indicators with Novunt branding
 */

'use client';

import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

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
			className={cn('flex flex-col items-center gap-4 text-muted-foreground', className)}
		>
			<div
				className="animate-spin rounded-full border-4 border-primary/80 border-t-transparent"
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
    <div className={cn(
      'fixed inset-0 z-50 flex flex-col items-center justify-center',
      'bg-gradient-to-b from-novunt-blue-900 to-background',
      className
    )}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-novunt-gold-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
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
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>

        {message && (
          <p className="text-lg font-medium text-white/90 animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for content
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
        <div
          key={i}
          className="h-4 bg-primary/10 rounded animate-pulse"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

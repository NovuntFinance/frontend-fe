/**
 * Standardized Loading States Component Library
 * Consistent loading indicators across the platform
 */

'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ShimmerCard } from '@/components/ui/shimmer';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { LoadingScreen } from '@/components/ui/loading';

/**
 * Page-level loading state
 * Use for full page loads
 */
export function PageLoading({ 
  message = 'Loading...', 
  className 
}: { 
  message?: string; 
  className?: string;
}) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center', className)}>
      <LoadingScreen message={message} />
    </div>
  );
}

/**
 * Card-level loading state
 * Use for individual card components
 */
export function CardLoading({ 
  className,
  height = 'h-32'
}: { 
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      <ShimmerCard className={height} />
    </div>
  );
}

/**
 * Button loading state
 * Use for button actions
 */
export function ButtonLoading({ 
  size = 'sm',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <NovuntSpinner size={size} />
    </div>
  );
}

/**
 * List loading state
 * Use for lists of items
 */
export function ListLoading({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

/**
 * Table loading state
 * Use for data tables
 */
export function TableLoading({ 
  rows = 5,
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-10 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Grid loading state
 * Use for grid layouts
 */
export function GridLoading({ 
  items = 6,
  columns = 3,
  className 
}: { 
  items?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardLoading key={i} height="h-48" />
      ))}
    </div>
  );
}

/**
 * Inline loading state
 * Use for inline content loading
 */
export function InlineLoading({ 
  message,
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <NovuntSpinner size="sm" />
      {message && <span>{message}</span>}
    </div>
  );
}

/**
 * Skeleton text loading
 * Use for text content
 */
export function TextLoading({ 
  lines = 2,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4 w-full',
            i === lines - 1 && 'w-3/4' // Last line shorter
          )} 
        />
      ))}
    </div>
  );
}

/**
 * Standardized Loading States Export
 * Use this object for consistent loading states
 */
export const LoadingStates = {
  Page: PageLoading,
  Card: CardLoading,
  Button: ButtonLoading,
  List: ListLoading,
  Table: TableLoading,
  Grid: GridLoading,
  Inline: InlineLoading,
  Text: TextLoading,
};


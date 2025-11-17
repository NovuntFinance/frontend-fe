/**
 * Shimmer Loader Component
 * Ultra-modern shimmer effect for loading states
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Shimmer({ className, width = '100%', height = '100%' }: ShimmerProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-muted', className)}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: '50%' }}
      />
    </div>
  );
}

/**
 * Shimmer Text Component
 */
export function ShimmerText({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          width="100%"
          height={i === lines - 1 ? '0.75rem' : '1rem'}
          className={cn(
            'rounded',
            i === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * Shimmer Card Component
 */
export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6', className)}>
      <div className="space-y-4">
        <Shimmer width="60%" height="1.5rem" />
        <ShimmerText lines={2} />
        <div className="flex gap-4">
          <Shimmer width="40%" height="2rem" />
          <Shimmer width="40%" height="2rem" />
        </div>
      </div>
    </div>
  );
}


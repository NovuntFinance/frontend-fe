/**
 * Suspense Boundaries
 * Suspense wrappers for better loading UX
 */

'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ShimmerCard } from '@/components/ui/shimmer';

/**
 * Dashboard Suspense Boundary
 */
export function DashboardSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>;
}

/**
 * Wallet Suspense Boundary
 */
export function WalletSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<WalletSkeleton />}>{children}</Suspense>;
}

/**
 * Staking Suspense Boundary
 */
export function StakingSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<StakingSkeleton />}>{children}</Suspense>;
}

/**
 * Modal Suspense Boundary
 */
export function ModalSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ModalSkeleton />}>{children}</Suspense>;
}

/**
 * Generic Content Suspense
 */
export function ContentSuspense({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <ContentSkeleton />}>{children}</Suspense>
  );
}

// Skeleton Components
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
      <ShimmerCard className="h-64" />
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="space-y-6">
      <ShimmerCard className="h-48" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    </div>
  );
}

function StakingSkeleton() {
  return (
    <div className="space-y-6">
      <ShimmerCard className="h-64" />
    </div>
  );
}

function ModalSkeleton() {
  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <ShimmerCard className="h-64 w-full max-w-lg" />
    </div>
  );
}

function ContentSkeleton() {
  return <ShimmerCard className="h-48" />;
}

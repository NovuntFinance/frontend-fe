/**
 * Wallet Dashboard Skeleton Loader
 * Loading state for wallet dashboard
 */

'use client';

import React, { memo } from 'react';
import { ShimmerCard } from '@/components/ui/shimmer';

/**
 * Loading Skeleton for Wallet Dashboard
 * Memoized to prevent unnecessary re-renders
 */
export const WalletDashboardSkeleton = memo(function WalletDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <ShimmerCard className="h-64" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
            </div>
        </div>
    );
});

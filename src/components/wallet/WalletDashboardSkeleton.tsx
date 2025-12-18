/**
 * Wallet Dashboard Skeleton Loader
 * Loading state for wallet dashboard
 */

'use client';

import React, { memo } from 'react';
import { LoadingStates } from '@/components/ui/loading-states';

/**
 * Loading Skeleton for Wallet Dashboard
 * Memoized to prevent unnecessary re-renders
 */
export const WalletDashboardSkeleton = memo(function WalletDashboardSkeleton() {
    return (
        <div className="space-y-6">
            <LoadingStates.Card height="h-64" />
            <LoadingStates.Grid items={4} columns={4} className="gap-4" />
        </div>
    );
});

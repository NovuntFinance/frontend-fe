/**
 * Suspense Boundaries
 * Suspense wrappers for better loading UX
 */

'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Dashboard Suspense Boundary
 */
export function DashboardSuspense({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            {children}
        </Suspense>
    );
}

/**
 * Wallet Suspense Boundary
 */
export function WalletSuspense({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<WalletSkeleton />}>
            {children}
        </Suspense>
    );
}

/**
 * Staking Suspense Boundary
 */
export function StakingSuspense({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<StakingSkeleton />}>
            {children}
        </Suspense>
    );
}

/**
 * Modal Suspense Boundary
 */
export function ModalSuspense({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<ModalSkeleton />}>
            {children}
        </Suspense>
    );
}

/**
 * Generic Content Suspense
 */
export function ContentSuspense({
    children,
    fallback
}: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}) {
    return (
        <Suspense fallback={fallback || <ContentSkeleton />}>
            {children}
        </Suspense>
    );
}

// Skeleton Components
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-40" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        </div>
    );
}

function WalletSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <Skeleton className="h-48 w-full mb-4" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function StakingSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <Skeleton className="h-6 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ModalSkeleton() {
    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="flex justify-end gap-2">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ContentSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    );
}

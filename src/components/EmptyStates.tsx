/**
 * Empty State Components
 * Consistent empty states across the application
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Inbox,
    Wallet,
    TrendingUp,
    Users,
    FileText,
    AlertCircle,
    Search,
    Clock,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * Generic Empty State Component
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {icon || <Inbox className="h-8 w-8" />}
                    </div>
                </motion.div>

                <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="text-lg font-semibold mb-2"
                >
                    {title}
                </motion.h3>

                {description && (
                    <motion.p
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="text-sm text-muted-foreground max-w-md mb-6"
                    >
                        {description}
                    </motion.p>
                )}

                {action && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    >
                        <Button onClick={action.onClick}>
                            {action.label}
                        </Button>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Specific Empty State Variants
 */

export function EmptyWallet({ onDeposit }: { onDeposit: () => void }) {
    return (
        <EmptyState
            icon={<Wallet className="h-8 w-8" />}
            title="No funds yet"
            description="Get started by making your first deposit to unlock all features"
            action={{
                label: 'Make a Deposit',
                onClick: onDeposit,
            }}
        />
    );
}

export function EmptyStakes({ onCreateStake }: { onCreateStake: () => void }) {
    return (
        <EmptyState
            icon={<TrendingUp className="h-8 w-8" />}
            title="No active stakes"
            description="Start earning passive income by creating your first stake"
            action={{
                label: 'Create Stake',
                onClick: onCreateStake,
            }}
        />
    );
}

export function EmptyReferrals() {
    return (
        <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No referrals yet"
            description="Share your referral code with friends and family to start earning bonuses"
        />
    );
}

export function EmptyTransactions() {
    return (
        <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No transactions"
            description="Your transaction history will appear here once you start making deposits or withdrawals"
        />
    );
}

export function EmptySearch({ query }: { query?: string }) {
    return (
        <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No results found"
            description={query ? `No results found for "${query}". Try a different search term.` : 'Try adjusting your search criteria'}
        />
    );
}

export function ErrorState({
    onRetry,
    message = 'Something went wrong'
}: {
    onRetry?: () => void;
    message?: string;
}) {
    return (
        <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-destructive" />}
            title="Error"
            description={message}
            action={onRetry ? {
                label: 'Try Again',
                onClick: onRetry,
            } : undefined}
        />
    );
}

export function PendingState({ message = 'Processing...' }: { message?: string }) {
    return (
        <EmptyState
            icon={<Clock className="h-8 w-8 text-warning animate-pulse" />}
            title="Pending"
            description={message}
        />
    );
}

export function SuccessState({
    message = 'Success!',
    onContinue
}: {
    message?: string;
    onContinue?: () => void;
}) {
    return (
        <EmptyState
            icon={<CheckCircle className="h-8 w-8 text-success" />}
            title="Success"
            description={message}
            action={onContinue ? {
                label: 'Continue',
                onClick: onContinue,
            } : undefined}
        />
    );
}

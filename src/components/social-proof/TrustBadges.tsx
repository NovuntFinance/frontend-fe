/**
 * Trust Badges Component
 * Displays credibility indicators and social proof
 */

'use client';

import { Shield, Users, DollarSign, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

interface PlatformStats {
    totalUsers: number;
    totalPayouts: number;
    activeStakes: number;
    uptime: number;
}

// Mock API call (replace with real endpoint)
async function fetchPlatformStats(): Promise<PlatformStats> {
    // This should call your backend API
    return {
        totalUsers: 52847,
        totalPayouts: 12500000,
        activeStakes: 8432,
        uptime: 99.9,
    };
}

export function TrustBadges() {
    const { data: stats } = useQuery({
        queryKey: ['platform-stats'],
        queryFn: fetchPlatformStats,
        refetchInterval: 60000, // Refresh every minute
    });

    const badges = [
        {
            icon: Users,
            label: 'Verified Users',
            value: `${(stats?.totalUsers || 50000).toLocaleString()}+`,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
        },
        {
            icon: DollarSign,
            label: 'Total Payouts',
            value: `$${((stats?.totalPayouts || 10000000) / 1000000).toFixed(1)}M+`,
            color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
        },
        {
            icon: TrendingUp,
            label: 'Active Stakes',
            value: `${(stats?.activeStakes || 8000).toLocaleString()}+`,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
        },
        {
            icon: Shield,
            label: 'SSL Secured',
            value: '256-bit',
            color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((badge, index) => (
                <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${badge.color}`}>
                        <badge.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{badge.label}</p>
                        <p className="text-sm font-semibold truncate">{badge.value}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// Compact version for footer/header
export function TrustBadgesCompact() {
    return (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>50,000+ Users</span>
            </div>
            <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>99.9% Uptime</span>
            </div>
        </div>
    );
}

// Single badge for specific uses
interface SingleTrustBadgeProps {
    variant: 'users' | 'payouts' | 'uptime' | 'secure';
}

export function SingleTrustBadge({ variant }: SingleTrustBadgeProps) {
    const badges = {
        users: {
            icon: Users,
            text: '50,000+ Verified Users',
            color: 'text-blue-600',
        },
        payouts: {
            icon: DollarSign,
            text: '$10M+ Paid Out',
            color: 'text-green-600',
        },
        uptime: {
            icon: Clock,
            text: '99.9% Uptime Guarantee',
            color: 'text-purple-600',
        },
        secure: {
            icon: Shield,
            text: '256-bit SSL Encryption',
            color: 'text-orange-600',
        },
    };

    const badge = badges[variant];

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <badge.icon className={`h-4 w-4 ${badge.color}`} />
            <span className="text-sm font-medium">{badge.text}</span>
        </div>
    );
}

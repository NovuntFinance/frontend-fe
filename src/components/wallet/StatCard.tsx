/**
 * Wallet Stat Card Component
 * Displays wallet statistics with animated interactions
 */

'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/wallet';
import { prefersReducedMotion } from '@/lib/accessibility';

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    className?: string;
}

/**
 * Stat Card Component
 * Memoized for performance with hover animations
 */
export const StatCard = memo(function StatCard({
    label,
    value,
    icon,
    color,
    className,
}: StatCardProps) {
    const reducedMotion = prefersReducedMotion();

    return (
        <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={reducedMotion ? false : { opacity: 1, y: 0 }}
            whileHover={reducedMotion ? {} : { y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">{label}</p>
                            <motion.p
                                key={value}
                                initial={reducedMotion ? false : { scale: 0.9 }}
                                animate={reducedMotion ? false : { scale: 1 }}
                                className={`text-lg font-bold ${color}`}
                            >
                                {formatCurrency(value, { showCurrency: false })}
                            </motion.p>
                        </div>
                        <motion.div
                            className={`p-2 rounded-lg bg-muted ${color}`}
                            whileHover={reducedMotion ? {} : { rotate: 5, scale: 1.1 }}
                        >
                            {icon}
                        </motion.div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
});

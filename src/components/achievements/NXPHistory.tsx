/**
 * NXP History Component
 * Displays NXP transaction history with pagination
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  TrendingUp,
  Target,
  Gift,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import { NovuntPremiumCard } from '@/components/ui/NovuntPremiumCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useNXPHistory } from '@/lib/queries/achievementQueries';
import { ShimmerCard } from '@/components/ui/shimmer';
import type { NXPSource } from '@/types/achievements';

/**
 * Get icon for NXP source
 */
function getSourceIcon(source: NXPSource) {
  switch (source) {
    case 'badge':
      return Award;
    case 'rank':
      return TrendingUp;
    case 'milestone':
      return Target;
    case 'activity':
      return Clock;
    case 'bonus':
      return Gift;
    default:
      return Gift;
  }
}

/**
 * Get color class for source badge
 */
function getSourceColor(source: NXPSource): string {
  switch (source) {
    case 'badge':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    case 'rank':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'milestone':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'activity':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    case 'bonus':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
  }
}

export function NXPHistory() {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const limit = 20;
  const INITIAL_DISPLAY_LIMIT = 5;
  const { data, isLoading, error } = useNXPHistory(page, limit);

  if (isLoading) {
    return (
      <NovuntPremiumCard
        title="NXP History"
        subtitle="Your NXP transaction history"
        icon={Gift}
        colorTheme="blue"
      >
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <ShimmerCard key={i} className="h-20" />
          ))}
        </div>
      </NovuntPremiumCard>
    );
  }

  if (error) {
    const isUnderDevelopment =
      (error as any)?.message?.toLowerCase().includes('under development') ||
      (error as any)?.message?.toLowerCase().includes('not implemented') ||
      (error as any)?.statusCode === 501;

    return (
      <NovuntPremiumCard
        title="NXP History"
        subtitle="Your NXP transaction history"
        icon={Gift}
        colorTheme="blue"
      >
        <div className="py-8 text-center">
          {isUnderDevelopment ? (
            <>
              <Gift className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-semibold">Coming Soon</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                NXP transaction history will be available soon.
              </p>
              <p className="text-muted-foreground text-xs">
                Track your NXP earnings as you unlock badges and progress!
              </p>
            </>
          ) : (
            <>
              <Gift className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground text-sm">
                Unable to load NXP history
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                Please try again later
              </p>
            </>
          )}
        </div>
      </NovuntPremiumCard>
    );
  }

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;
  const visibleTransactions = showAll
    ? transactions
    : transactions.slice(0, INITIAL_DISPLAY_LIMIT);
  const hasMoreTransactions = transactions.length > INITIAL_DISPLAY_LIMIT;

  return (
    <NovuntPremiumCard
      title="NXP History"
      subtitle="Your NXP transaction history"
      icon={Gift}
      colorTheme="blue"
    >
      <div className="space-y-4">
        {transactions.length > 0 ? (
          <>
            <div className="space-y-3">
              {visibleTransactions.map((tx, index) => {
                const Icon = getSourceIcon(tx.source);
                return (
                  <motion.div
                    key={tx._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-background/50 hover:bg-background/70 border-border/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div className="bg-muted rounded-lg p-2">
                        <Icon className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-semibold">
                            {tx.description}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', getSourceColor(tx.source))}
                          >
                            {tx.sourceName}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatDate(new Date(tx.createdAt))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-400">
                        +{tx.amount.toLocaleString()} NXP
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* View More Button */}
            {hasMoreTransactions && !showAll && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="gap-2"
                >
                  View More ({transactions.length - INITIAL_DISPLAY_LIMIT} more)
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Show Less Button */}
            {showAll && transactions.length > INITIAL_DISPLAY_LIMIT && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(false)}
                  className="gap-2"
                >
                  Show Less
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="border-border/50 flex items-center justify-between border-t pt-4">
                <div className="text-muted-foreground text-sm">
                  Showing {(page - 1) * limit + 1} to{' '}
                  {Math.min(page * limit, pagination.total)} of{' '}
                  {pagination.total} transactions
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page >= pagination.totalPages}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <Gift className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No NXP History Yet</h3>
            <p className="text-muted-foreground text-sm">
              Start earning NXP by unlocking badges, upgrading ranks, and
              reaching milestones!
            </p>
          </div>
        )}
      </div>
    </NovuntPremiumCard>
  );
}

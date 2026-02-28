/**
 * NXP History Component
 * Neumorphic transaction list: #0D162C + #009BF2 + #FFFFFF (opacity only).
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
import { formatDate, cn } from '@/lib/utils';
import { useNXPHistory } from '@/lib/queries/achievementQueries';
import { ShimmerCard } from '@/components/ui/shimmer';
import badgeStyles from '@/styles/badge-card.module.css';
import type { NXPSource } from '@/types/achievements';

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

const DASHBOARD_ICON_STYLE = {
  background: 'var(--neu-accent)',
  border: '1px solid var(--neu-border)',
  color: 'var(--neu-accent-foreground)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
} as const;

interface NXPHistoryProps {
  /** Use dashboard-style header (filled accent icon). Default false. */
  variant?: 'default' | 'dashboard';
}

export function NXPHistory({ variant = 'default' }: NXPHistoryProps) {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const limit = 20;
  const INITIAL_DISPLAY_LIMIT = 5;
  const { data, isLoading, error } = useNXPHistory(page, limit);

  const headerContent = (
    <header
      className={
        variant === 'dashboard'
          ? 'mb-4 flex items-center gap-3 sm:mb-5'
          : badgeStyles.badgeSectionHeader
      }
    >
      {variant === 'dashboard' ? (
        <>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
            style={DASHBOARD_ICON_STYLE}
            aria-hidden
          >
            <Gift className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={2} />
          </div>
          <div>
            <h2
              className="text-sm font-bold sm:text-base"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              NXP History
            </h2>
            <p
              className="text-xs"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              Your NXP transaction history
            </p>
          </div>
        </>
      ) : (
        <>
          <div className={badgeStyles.badgeSectionIcon} aria-hidden>
            <Gift className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
          </div>
          <div>
            <h2 className={badgeStyles.badgeSectionTitle}>NXP History</h2>
            <p className={badgeStyles.badgeSectionSubtitle}>
              Your NXP transaction history
            </p>
          </div>
        </>
      )}
    </header>
  );

  if (isLoading) {
    return (
      <section
        className={badgeStyles.badgeSectionRoot}
        aria-label="NXP History"
      >
        {headerContent}
        <div className={badgeStyles.nxpHistoryList}>
          {[...Array(3)].map((_, i) => (
            <ShimmerCard key={i} className="h-20 rounded-[16px]" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    const isUnderDevelopment =
      (error as any)?.message?.toLowerCase().includes('under development') ||
      (error as any)?.message?.toLowerCase().includes('not implemented') ||
      (error as any)?.statusCode === 501;

    return (
      <section
        className={badgeStyles.badgeSectionRoot}
        aria-label="NXP History"
      >
        {headerContent}
        <div className={badgeStyles.nxpHistoryEmpty}>
          <Gift className={cn(badgeStyles.nxpHistoryEmptyIcon, 'h-12 w-12')} />
          {isUnderDevelopment ? (
            <>
              <h3 className={badgeStyles.nxpHistoryErrorTitle}>Coming Soon</h3>
              <p className={badgeStyles.nxpHistoryErrorText}>
                NXP transaction history will be available soon.
              </p>
              <p
                className={cn(badgeStyles.nxpHistoryErrorText, 'mt-2 text-xs')}
              >
                Track your NXP earnings as you unlock badges and progress!
              </p>
            </>
          ) : (
            <>
              <p className={badgeStyles.nxpHistoryErrorText}>
                Unable to load NXP history
              </p>
              <p
                className={cn(badgeStyles.nxpHistoryErrorText, 'mt-2 text-xs')}
              >
                Please try again later
              </p>
            </>
          )}
        </div>
      </section>
    );
  }

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;
  const visibleTransactions = showAll
    ? transactions
    : transactions.slice(0, INITIAL_DISPLAY_LIMIT);
  const hasMoreTransactions = transactions.length > INITIAL_DISPLAY_LIMIT;

  return (
    <section className={badgeStyles.badgeSectionRoot} aria-label="NXP History">
      {headerContent}

      {transactions.length > 0 ? (
        <>
          <div className={badgeStyles.nxpHistoryList}>
            {visibleTransactions.map((tx, index) => {
              const Icon = getSourceIcon(tx.source);
              return (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={badgeStyles.nxpHistoryRow}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className={badgeStyles.nxpHistoryRowIcon}>
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div className={badgeStyles.nxpHistoryRowBody}>
                      <div className={badgeStyles.nxpHistoryRowDesc}>
                        <span>{tx.description}</span>
                        <span className={badgeStyles.nxpHistorySourcePill}>
                          {tx.sourceName}
                        </span>
                      </div>
                      <div className={badgeStyles.nxpHistoryRowDate}>
                        {formatDate(new Date(tx.createdAt))}
                      </div>
                    </div>
                  </div>
                  <p className={badgeStyles.nxpHistoryAmount}>
                    +{tx.amount.toLocaleString()} NXP
                  </p>
                </motion.div>
              );
            })}
          </div>

          {(hasMoreTransactions && !showAll) ||
          (showAll && hasMoreTransactions) ? (
            <div className={badgeStyles.nxpHistoryActions}>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className={badgeStyles.badgeSectionMoreBtn}
              >
                {showAll ? (
                  <>
                    Show Less
                    <ChevronDown className="h-4 w-4 rotate-180" />
                  </>
                ) : (
                  <>
                    View More ({transactions.length - INITIAL_DISPLAY_LIMIT}{' '}
                    more)
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ) : null}

          {pagination && pagination.totalPages > 1 && (
            <div className={badgeStyles.nxpHistoryPagination}>
              <p className={badgeStyles.nxpHistoryPaginationText}>
                Showing {(page - 1) * limit + 1} to{' '}
                {Math.min(page * limit, pagination.total)} of {pagination.total}{' '}
                transactions
              </p>
              <div className={badgeStyles.nxpHistoryPaginationBtns}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={badgeStyles.nxpHistoryPageBtn}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page >= pagination.totalPages}
                  className={badgeStyles.nxpHistoryPageBtn}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={badgeStyles.nxpHistoryEmpty}>
          <Gift className={cn(badgeStyles.nxpHistoryEmptyIcon, 'h-12 w-12')} />
          <h3 className={badgeStyles.nxpHistoryEmptyTitle}>
            No NXP History Yet
          </h3>
          <p className={badgeStyles.nxpHistoryEmptyText}>
            Start earning NXP by unlocking badges, upgrading ranks, and reaching
            milestones!
          </p>
        </div>
      )}
    </section>
  );
}

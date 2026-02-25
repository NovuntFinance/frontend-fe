/**
 * Staking Transaction History Component
 * Dedicated view for staking-related transactions with tabs for:
 * - Staking Activity (stake, stake_completion)
 * - Earnings (ros_payout, pool payouts)
 *
 * Based on the enhanced-transactions API with category filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TrendingUp,
  DollarSign,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Target,
  Star,
  Award,
  FileText,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useWallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingStates } from '@/components/ui/loading-states';
import { prefersReducedMotion } from '@/lib/accessibility';
import neuStyles from '@/styles/neumorphic.module.css';
import {
  formatCurrency,
  formatTransactionType,
  formatTransactionStatus,
  formatAmountWithDirection,
  formatTransactionDate,
} from '@/lib/utils/wallet';
import type { Transaction } from '@/types/enhanced-transaction';

type StakingTab = 'staking' | 'earnings' | 'all';

/**
 * Staking Transaction History Component
 */
export function StakingTransactionHistory() {
  const [activeTab, setActiveTab] = useState<StakingTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const reducedMotion = prefersReducedMotion();

  // Fetch staking category transactions
  const {
    data: stakingData,
    isLoading: isLoadingStaking,
    refetch: refetchStaking,
  } = useTransactionHistory({
    category: 'staking',
    page: 1,
    limit: 1000, // Fetch all for client-side filtering
  });

  // Fetch earnings category transactions
  const {
    data: earningsData,
    isLoading: isLoadingEarnings,
    refetch: refetchEarnings,
  } = useTransactionHistory({
    category: 'earnings',
    page: 1,
    limit: 1000, // Fetch all for client-side filtering
  });

  const isLoading = isLoadingStaking || isLoadingEarnings;

  // Combine transactions based on active tab
  const allTransactions = useMemo(() => {
    const stakingTxs = stakingData?.transactions || [];
    const earningsTxs = earningsData?.transactions || [];

    switch (activeTab) {
      case 'staking':
        return stakingTxs;
      case 'earnings':
        return earningsTxs;
      case 'all':
        // Merge, deduplicate by _id, and sort by timestamp (newest first)
        const allTxs = [...stakingTxs, ...earningsTxs];
        const uniqueTxsMap = new Map<string, Transaction>();
        const duplicateIds = new Set<string>();

        // Deduplicate: if a transaction appears in both arrays, keep only one
        allTxs.forEach((tx) => {
          if (!uniqueTxsMap.has(tx._id)) {
            uniqueTxsMap.set(tx._id, tx);
          } else {
            duplicateIds.add(tx._id);
          }
        });

        // Log duplicates in development mode for debugging
        if (process.env.NODE_ENV === 'development' && duplicateIds.size > 0) {
          console.warn(
            '[StakingTransactionHistory] ⚠️ Found duplicate transactions:',
            Array.from(duplicateIds)
          );
        }

        const uniqueTxs = Array.from(uniqueTxsMap.values());
        return uniqueTxs.sort((a, b) => {
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        });
      default:
        return [];
    }
  }, [activeTab, stakingData, earningsData]);

  // Pagination calculations
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const transactions = allTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of transaction list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    refetchStaking();
    refetchEarnings();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header – neumorphic */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-[18px] p-4 sm:p-6 ${neuStyles['neu-card']}`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
              style={{
                boxShadow: 'var(--neu-shadow-inset)',
                border: '1px solid var(--neu-border)',
                background: 'var(--neu-bg)',
                color: 'var(--wallet-accent)',
              }}
            >
              <TrendingUp className="h-5 w-5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2
                className="text-base font-bold sm:text-lg"
                style={{ color: 'var(--wallet-text)' }}
              >
                Staking Transaction History
              </h2>
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                View all your staking activities and earnings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${neuStyles['neu-icon-button']}`}
            style={{ color: 'var(--wallet-accent)' }}
            aria-label="Refresh transactions"
          >
            <RefreshCw
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as StakingTab)}
      >
        <TabsList
          className="grid w-full grid-cols-3 gap-1 rounded-[16px] p-1"
          style={{
            background: 'var(--neu-bg)',
            boxShadow: 'var(--neu-shadow-inset)',
            border: '1px solid var(--neu-border)',
          }}
        >
          <TabsTrigger
            value="all"
            className="rounded-[14px] border border-transparent bg-transparent text-xs text-[var(--wallet-text-muted)] transition-[box-shadow,border-color,color] duration-200 data-[state=active]:border-[var(--neu-border)] data-[state=active]:bg-[var(--neu-bg)] data-[state=active]:text-[var(--wallet-accent)] data-[state=active]:shadow-[var(--neu-shadow-inset)] sm:text-sm"
          >
            <ArrowDownRight className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">All Staking</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger
            value="staking"
            className="rounded-[14px] border border-transparent bg-transparent text-xs text-[var(--wallet-text-muted)] transition-[box-shadow,border-color,color] duration-200 data-[state=active]:border-[var(--neu-border)] data-[state=active]:bg-[var(--neu-bg)] data-[state=active]:text-[var(--wallet-accent)] data-[state=active]:shadow-[var(--neu-shadow-inset)] sm:text-sm"
          >
            <TrendingUp className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Staking Activity</span>
            <span className="sm:hidden">Staking</span>
          </TabsTrigger>
          <TabsTrigger
            value="earnings"
            className="rounded-[14px] border border-transparent bg-transparent text-xs text-[var(--wallet-text-muted)] transition-[box-shadow,border-color,color] duration-200 data-[state=active]:border-[var(--neu-border)] data-[state=active]:bg-[var(--neu-bg)] data-[state=active]:text-[var(--wallet-accent)] data-[state=active]:shadow-[var(--neu-shadow-inset)] sm:text-sm"
          >
            <DollarSign className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <LoadingStates.List lines={5} />
          ) : transactions.length > 0 ? (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className={`overflow-hidden rounded-[18px] ${neuStyles['neu-card']}`}
              >
                <div
                  className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4"
                  style={{ borderBottom: '1px solid var(--wallet-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      style={{ color: 'var(--wallet-accent)' }}
                    />
                    <span
                      className="text-sm font-semibold sm:text-base"
                      style={{ color: 'var(--wallet-text)' }}
                    >
                      {activeTab === 'staking' && 'Staking Activity'}
                      {activeTab === 'earnings' && 'Earnings'}
                      {activeTab === 'all' && 'All Staking Related'}
                    </span>
                  </div>
                  <span
                    className={`${neuStyles['neu-badge']} text-xs`}
                    style={{ color: 'var(--wallet-text-secondary)' }}
                  >
                    {transactions.length}
                  </span>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: 'var(--wallet-border)' }}
                >
                  {transactions.map(
                    (transaction: Transaction, index: number) => (
                      <StakingTransactionItem
                        key={transaction._id}
                        transaction={transaction}
                        index={index}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className={`mt-4 flex flex-col gap-3 rounded-[18px] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${neuStyles['neu-card']}`}
                >
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: 'var(--wallet-text-muted)' }}
                  >
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, allTransactions.length)} of{' '}
                    {allTransactions.length} transactions
                  </p>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm ${neuStyles['neu-button']} disabled:cursor-not-allowed disabled:opacity-50`}
                      style={{ color: 'var(--wallet-text)' }}
                    >
                      <ChevronLeft className="mr-1 inline h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <span
                      className="rounded-[14px] px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                      style={{
                        background: 'var(--neu-bg)',
                        boxShadow: 'var(--neu-shadow-inset)',
                        border: '1px solid var(--neu-border)',
                        color: 'var(--wallet-text-secondary)',
                      }}
                    >
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm ${neuStyles['neu-button']} disabled:cursor-not-allowed disabled:opacity-50`}
                      style={{ color: 'var(--wallet-text)' }}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="ml-1 inline h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-[18px] p-8 text-center sm:p-12 ${neuStyles['neu-card']}`}
            >
              <TrendingUp
                className="mx-auto mb-4 h-12 w-12 sm:h-16 sm:w-16"
                style={{ color: 'var(--wallet-text-muted)', opacity: 0.5 }}
              />
              <p
                className="mb-2 text-base font-medium sm:text-lg"
                style={{ color: 'var(--wallet-text)' }}
              >
                No transactions found
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: 'var(--wallet-text-muted)' }}
              >
                {activeTab === 'staking' &&
                  'Your staking activity will appear here'}
                {activeTab === 'earnings' && 'Your earnings will appear here'}
                {activeTab === 'all' &&
                  'Your staking transactions will appear here'}
              </p>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Staking Transaction Item Component
 */
function StakingTransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const reducedMotion = prefersReducedMotion();
  const statusInfo = formatTransactionStatus(transaction.status);
  const typeIcon = getStakingTransactionIcon(
    transaction.type,
    transaction.direction
  );
  const isPositive = transaction.direction === 'in';
  const isNeutral = transaction.direction === 'neutral';

  // Extract staking-specific metadata
  const stakeId = transaction.metadata?.stakeId;
  const weekNumber = transaction.metadata?.weekNumber;
  const rosPercentage = transaction.metadata?.rosPercentage;
  // stakeAmount removed - sanitized by backend

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={reducedMotion ? false : { opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="p-3 transition-colors hover:bg-[rgba(0,155,242,0.03)] sm:p-4"
      style={{ borderColor: 'var(--wallet-border)' }}
    >
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10"
            style={{
              boxShadow: 'var(--neu-shadow-inset)',
              border: '1px solid var(--neu-border)',
              background: 'var(--neu-bg)',
              color: 'var(--wallet-accent)',
            }}
          >
            <div className="h-4 w-4 sm:h-5 sm:w-5">{typeIcon}</div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p
                className="text-sm font-semibold sm:text-base"
                style={{ color: 'var(--wallet-text)' }}
              >
                {formatTransactionType(transaction.type, transaction.typeLabel)}
              </p>
              <span
                className={`${neuStyles['neu-badge']} text-[10px] sm:text-xs`}
                style={{ color: 'var(--wallet-text-secondary)' }}
              >
                {statusInfo.label}
              </span>
              {transaction.category && (
                <span
                  className={`${neuStyles['neu-badge']} text-[10px] sm:text-xs`}
                  style={{ color: 'var(--wallet-text-muted)' }}
                >
                  {transaction.category}
                </span>
              )}
            </div>
            <p
              className="mb-1 line-clamp-2 text-xs sm:line-clamp-1 sm:text-sm"
              style={{ color: 'var(--wallet-text-muted)' }}
            >
              {transaction.description}
            </p>

            <div
              className="flex flex-wrap items-center gap-2 text-[10px] sm:gap-3 sm:text-xs"
              style={{ color: 'var(--wallet-text-muted)' }}
            >
              <span>{formatTransactionDate(transaction.timestamp)}</span>
              {weekNumber && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Week {weekNumber}
                </span>
              )}
              {rosPercentage && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {rosPercentage}% ROS
                </span>
              )}
              {stakeId && (
                <span className="font-mono text-xs">
                  Stake ID: {stakeId.slice(0, 8)}...
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="ml-2 shrink-0 text-right sm:ml-4">
          <p
            className="text-sm font-bold sm:text-lg"
            style={{
              color: isPositive
                ? 'var(--wallet-accent)'
                : isNeutral
                  ? 'var(--wallet-text-muted)'
                  : 'var(--wallet-text-secondary)',
            }}
          >
            {formatAmountWithDirection(
              transaction.amount,
              transaction.direction
            )}
          </p>
          {transaction.fee > 0 && (
            <p
              className="text-[10px] sm:text-xs"
              style={{ color: 'var(--wallet-text-muted)' }}
            >
              Fee: {formatCurrency(transaction.fee, { showCurrency: false })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Get staking transaction icon based on type (neumorphic: single accent color)
 */
function getStakingTransactionIcon(
  type: string,
  direction: 'in' | 'out' | 'neutral'
): React.ReactNode {
  const iconClass = 'h-5 w-5';
  const style = { color: 'var(--wallet-accent)' };

  switch (type) {
    case 'stake':
      return <ArrowUpRight className={iconClass} style={style} />;
    case 'stake_completion':
      return <Target className={iconClass} style={style} />;
    case 'ros_payout':
      return <DollarSign className={iconClass} style={style} />;
    case 'stake_pool_payout':
    case 'performance_pool_payout':
    case 'premium_pool_payout':
      return <Award className={iconClass} style={style} />;
    default:
      if (direction === 'in') {
        return <ArrowDownRight className={iconClass} style={style} />;
      }
      if (direction === 'out') {
        return <ArrowUpRight className={iconClass} style={style} />;
      }
      return (
        <TrendingUp
          className={iconClass}
          style={{ color: 'var(--wallet-text-muted)' }}
        />
      );
  }
}

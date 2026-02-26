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
import { useTransactionHistory } from '@/hooks/useWallet';
import { LoadingStates } from '@/components/ui/loading-states';
import { prefersReducedMotion } from '@/lib/accessibility';
import neuStyles from '@/styles/neumorphic.module.css';
import {
  formatTransactionType,
  formatAmountWithDirection,
  formatTransactionDate,
} from '@/lib/utils/wallet';
import type { Transaction } from '@/types/enhanced-transaction';

/**
 * Staking Transaction History – title only, single list (no tabs, no icons).
 */
export function StakingTransactionHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const reducedMotion = prefersReducedMotion();

  const { data: stakingData, isLoading: isLoadingStaking } =
    useTransactionHistory({
      category: 'staking',
      page: 1,
      limit: 1000,
    });

  const { data: earningsData, isLoading: isLoadingEarnings } =
    useTransactionHistory({
      category: 'earnings',
      page: 1,
      limit: 1000,
    });

  const isLoading = isLoadingStaking || isLoadingEarnings;

  const allTransactions = useMemo(() => {
    const stakingTxs = stakingData?.transactions || [];
    const earningsTxs = earningsData?.transactions || [];
    const allTxs = [...stakingTxs, ...earningsTxs];
    const uniqueTxsMap = new Map<string, Transaction>();
    allTxs.forEach((tx) => {
      if (!uniqueTxsMap.has(tx._id)) uniqueTxsMap.set(tx._id, tx);
    });
    const uniqueTxs = Array.from(uniqueTxsMap.values());
    return uniqueTxs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [stakingData, earningsData]);

  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const transactions = allTransactions.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4">
      <h2
        className="text-base font-bold sm:text-lg"
        style={{ color: 'var(--neu-text-primary)' }}
      >
        Staking Transaction History
      </h2>

      {isLoading ? (
        <LoadingStates.List lines={5} />
      ) : transactions.length > 0 ? (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className={`overflow-hidden rounded-[18px] ${neuStyles['neu-card']}`}
          >
            <div
              className="divide-y"
              style={{ borderColor: 'var(--wallet-border)' }}
            >
              {transactions.map((transaction: Transaction, index: number) => (
                <StakingTransactionItem
                  key={transaction._id}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div
                className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                style={{ borderColor: 'var(--wallet-border)' }}
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
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-[18px] p-6 text-center sm:p-8 ${neuStyles['neu-card']}`}
        >
          <p
            className="text-sm sm:text-base"
            style={{ color: 'var(--wallet-text-muted)' }}
          >
            No transactions found
          </p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Staking Transaction Item – minimal: max 2 lines, no icons.
 */
function StakingTransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const reducedMotion = prefersReducedMotion();
  const isPositive = transaction.direction === 'in';
  const isNeutral = transaction.direction === 'neutral';
  const typeLabel = formatTransactionType(
    transaction.type,
    transaction.typeLabel
  );
  const amountStr = formatAmountWithDirection(
    transaction.amount,
    transaction.direction
  );
  const dateStr = formatTransactionDate(transaction.timestamp);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={reducedMotion ? false : { opacity: 1 }}
      transition={{ delay: index * 0.02 }}
      className="px-3 py-2.5 transition-colors hover:bg-[rgba(0,155,242,0.03)] sm:px-4 sm:py-3"
      style={{ borderColor: 'var(--wallet-border)' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className="min-w-0 truncate text-sm font-medium sm:text-base"
          style={{ color: 'var(--wallet-text)' }}
        >
          {typeLabel}
        </p>
        <p
          className="shrink-0 text-sm font-medium sm:text-base"
          style={{
            color: isPositive
              ? 'var(--wallet-accent)'
              : isNeutral
                ? 'var(--wallet-text-muted)'
                : 'var(--wallet-text)',
          }}
        >
          {amountStr}
        </p>
      </div>
      <p className="text-xs" style={{ color: 'var(--wallet-text-muted)' }}>
        {dateStr}
      </p>
    </motion.div>
  );
}

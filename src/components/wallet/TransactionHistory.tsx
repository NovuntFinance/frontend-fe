/**
 * Transaction History Component
 * Enhanced transaction list with filtering, pagination, summary, and category breakdown
 * Based on TransactionHistory API-FrontendIntegrationGuide.md
 */

'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Gift,
  RefreshCw,
  X,
  DollarSign,
  Wallet,
  CreditCard,
  Search,
  Calendar,
  Download,
  FileText,
  Copy,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useWallet';
import { useUser } from '@/hooks/useUser';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';
import { EmptyStates } from '@/components/EmptyStates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  formatCurrency,
  formatTransactionType,
  formatTransactionStatus,
  maskWalletAddress,
  formatAmountWithDirection,
  formatTransactionDate,
} from '@/lib/utils/wallet';
import { prefersReducedMotion } from '@/lib/accessibility';
import { listItemAnimation } from '@/design-system/animations';
import type {
  TransactionHistoryParams,
  Transaction,
  CategoryBreakdown,
} from '@/types/enhanced-transaction';

/**
 * Transaction History Component
 */
export function TransactionHistory() {
  const { user } = useUser();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<TransactionHistoryParams>({
    page: 1,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Separate filters: backend filters (search, date) vs client-side filters (category)
  // We don't send category to backend because backend uses stored category which might be wrong
  // When filtering by category, we fetch more transactions to ensure we get all matches
  const backendFilters = useMemo(() => {
    const { category, ...rest } = filters;
    // If filtering by category, increase limit to get all transactions for client-side filtering
    // Otherwise use normal pagination
    if (category) {
      return {
        ...rest,
        limit: 1000, // Fetch a large number to get all transactions
        page: 1, // Always start from page 1 when category filtering
      };
    }
    return rest;
  }, [filters]);

  const { data, isLoading, error, refetch } =
    useTransactionHistory(backendFilters);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Apply debounced search to filters
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === (debouncedSearch || undefined)) return prev;
      return {
        ...prev,
        search: debouncedSearch || undefined,
        page: 1, // Reset to first page when search changes
      };
    });
  }, [debouncedSearch]);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[TransactionHistory] 📊 Component Data Debug:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        transactionsCount: data?.transactions?.length || 0,
        firstTransaction: data?.transactions?.[0],
        pagination: data?.pagination,
        summary: data?.summary,
        categoryBreakdown: data?.categoryBreakdown,
        availableFilters: data?.availableFilters,
        currentFilters: filters,
      });
    }
  }, [data, filters]);

  // Shared categorization function - used by both breakdown computation and filtering
  // This ensures consistency between the breakdown counts and filtered results
  // Based on backend API documentation: transactions have proper category field
  // IMPORTANT: Only registration_bonus should be categorized as "bonus"
  // All other earnings (referral_bonus, ros_payout, pool payouts) should be "earnings"
  const categorizeTransaction = useCallback((tx: Transaction): string => {
    const typeLower = (tx.type || '').toLowerCase();
    const descLower = (tx.description || '').toLowerCase();
    const txIdUpper = (tx.txId || '').toUpperCase();

    // PRIORITY 1: Use backend category if it's valid (backend properly categorizes transactions)
    // Backend now correctly returns category: "earnings" for referral_bonus transactions
    // Backend sets category correctly: "staking" for stake/stake_completion, "earnings" for payouts
    // IMPORTANT: Override backend category for referral_bonus if it's incorrectly set as "bonus"
    // Only registration_bonus should be categorized as "bonus"
    if (
      tx.category &&
      tx.category !== 'system' &&
      [
        'deposit',
        'withdrawal',
        'staking',
        'earnings',
        'transfer',
        'bonus',
        'fee',
      ].includes(tx.category.toLowerCase())
    ) {
      let backendCategory = tx.category.toLowerCase();

      // CRITICAL FIX: referral_bonus should ALWAYS be "earnings", not "bonus"
      // Override backend category if it's incorrectly set
      if (typeLower === 'referral_bonus' && backendCategory === 'bonus') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[TransactionHistory] ⚠️ Overriding backend category for referral_bonus:',
            {
              id: tx._id,
              type: tx.type,
              backendCategory: 'bonus',
              correctedCategory: 'earnings',
            }
          );
        }
        backendCategory = 'earnings';
      }

      if (
        process.env.NODE_ENV === 'development' &&
        (typeLower.includes('stake') || backendCategory === 'staking')
      ) {
        console.log('[TransactionHistory] 🎯 Using backend category:', {
          id: tx._id,
          type: tx.type,
          backendCategory,
          txCategory: tx.category,
        });
      }
      return backendCategory;
    }

    // PRIORITY 2: Check transaction TYPE first (before checking fromUser/toUser)
    // This ensures stake transactions are categorized correctly even if they have fromUser/toUser
    // According to backend docs, these types have specific categories
    if (typeLower === 'deposit') return 'deposit';
    if (typeLower === 'withdrawal') return 'withdrawal';

    // Staking types (as per backend documentation)
    // "stake" - When user stakes funds (category: "staking", direction: "out")
    // "stake_completion" - When stake reaches 200% (category: "staking", direction: "in")
    // IMPORTANT: Check this BEFORE checking for transfers based on fromUser/toUser
    // because stake transactions may have fromUser/toUser set but should still be "staking"
    if (
      typeLower === 'stake' ||
      typeLower === 'staked' || // Handle past tense "Staked" (from typeLabel)
      typeLower === 'stake_completion' || // When stake reaches 200% - belongs to staking category
      typeLower === 'stake_completed' ||
      typeLower === 'unstake' ||
      typeLower === 'stake_created' ||
      typeLower === 'stake_withdrawn_early' ||
      (typeLower.includes('stake') &&
        !typeLower.includes('payout') &&
        !typeLower.includes('roi') &&
        !typeLower.includes('earned') &&
        typeLower !== 'ros_payout')
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TransactionHistory] 🎯 Identified as STAKING by type:', {
          id: tx._id,
          type: tx.type,
          typeLower,
          hasFromUser: !!tx.fromUser,
          hasToUser: !!tx.toUser,
        });
      }
      return 'staking';
    }

    // PRIORITY 3: Check if it's a transfer (P2P or wallet transfer)
    // Only check for transfers AFTER we've ruled out staking/deposit/withdrawal types
    const isTransfer =
      typeLower === 'transfer' ||
      typeLower === 'transfer_in' ||
      typeLower === 'transfer_out' ||
      typeLower.includes('transfer');

    if (isTransfer) return 'transfer';

    // Earnings types (as per backend documentation)
    // All payout types are category "earnings"
    // Note: referral_bonus is now correctly categorized as "earnings" by backend
    // This fallback is for old transactions or edge cases where category might be missing
    if (
      typeLower === 'ros_payout' ||
      typeLower === 'stake_pool_payout' ||
      typeLower === 'performance_pool_payout' ||
      typeLower === 'premium_pool_payout' ||
      typeLower === 'stake_roi' ||
      typeLower === 'pool_distribution' ||
      typeLower === 'referral_bonus'
    )
      return 'earnings';

    if (
      typeLower === 'registration_bonus' ||
      typeLower === 'bonus_activation' ||
      typeLower === 'ranking_bonus'
    )
      return 'bonus';
    if (typeLower === 'fee') return 'fee';
    if (typeLower === 'adjustment' || typeLower === 'refund') return 'system';

    // PRIORITY 4: Check for P2P transfers based on fromUser/toUser
    // Only check this AFTER we've ruled out all transaction types
    // This catches actual P2P transfers, not stake transactions that happen to have fromUser/toUser
    if (tx.fromUser || tx.toUser) {
      // Double-check it's not a stake transaction that has fromUser/toUser set
      if (
        !typeLower.includes('stake') &&
        !typeLower.includes('ros') &&
        !typeLower.includes('payout')
      ) {
        return 'transfer';
      }
    }
    if (tx.direction === 'in' && !typeLower.includes('transfer'))
      return 'deposit';
    if (
      tx.direction === 'out' &&
      !typeLower.includes('transfer') &&
      typeLower !== 'withdrawal'
    )
      return 'withdrawal';

    // PRIORITY 5: Check description for keywords
    // Check for staking FIRST before other keywords to ensure stake transactions are prioritized
    if (
      descLower.includes('stake') &&
      !descLower.includes('payout') &&
      !descLower.includes('roi') &&
      !descLower.includes('earned')
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[TransactionHistory] 🎯 Identified as STAKING by description:',
          {
            id: tx._id,
            type: tx.type,
            description: tx.description,
            descLower,
          }
        );
      }
      return 'staking';
    }
    // Then check for transfers, deposits, withdrawals
    if (
      descLower.includes('transfer') ||
      descLower.includes('sent to') ||
      descLower.includes('received from')
    )
      return 'transfer';
    if (descLower.includes('deposit') || descLower.includes('funded'))
      return 'deposit';
    if (descLower.includes('withdrawal') || descLower.includes('withdraw'))
      return 'withdrawal';

    // PRIORITY 6: Check transaction ID for stake indicators
    if (txIdUpper.includes('STAKE')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TransactionHistory] 🎯 Identified as STAKING by TX ID:', {
          id: tx._id,
          type: tx.type,
          txId: tx.txId,
          txIdUpper,
        });
      }
      return 'staking';
    }

    return 'system';
  }, []);

  // Compute category breakdown from summary if not provided
  const computedCategoryBreakdown = useMemo((): CategoryBreakdown => {
    // Initialize with all main categories to ensure they always show
    const breakdown: CategoryBreakdown = {
      deposit: { count: 0, totalAmount: 0 },
      withdrawal: { count: 0, totalAmount: 0 },
      earnings: { count: 0, totalAmount: 0 },
      staking: { count: 0, totalAmount: 0 },
      transfer: { count: 0, totalAmount: 0 },
    };

    // ALWAYS recompute from transactions if available - this is the source of truth
    // The API's categoryBreakdown might have incorrect categorizations
    if (data?.transactions && data.transactions.length > 0) {
      console.log(
        '[TransactionHistory] 🔄 ALWAYS recomputing breakdown from',
        data.transactions.length,
        'transactions (ignoring API categoryBreakdown)'
      );

      if (
        data?.categoryBreakdown &&
        Object.keys(data.categoryBreakdown).length > 0
      ) {
        console.log(
          '[TransactionHistory] API categoryBreakdown (will be ignored):',
          data.categoryBreakdown
        );
      }

      // Reset breakdown and recompute from transactions
      const recomputedBreakdown: CategoryBreakdown = {
        deposit: { count: 0, totalAmount: 0 },
        withdrawal: { count: 0, totalAmount: 0 },
        earnings: { count: 0, totalAmount: 0 },
        staking: { count: 0, totalAmount: 0 },
        transfer: { count: 0, totalAmount: 0 },
      };

      // Filter transactions the same way as filteredTransactions to ensure consistency
      // This ensures transfer_in transactions where user is sender are excluded from breakdown
      const transactionsForBreakdown = data.transactions.filter(
        (tx: Transaction) => {
          // Filter out transfer_in transactions where current user is the sender
          if (
            user?.username &&
            (tx.type === 'transfer_in' ||
              tx.type?.toLowerCase() === 'transfer_in') &&
            tx.fromUser?.username === user.username
          ) {
            return false;
          }
          return true;
        }
      );

      transactionsForBreakdown.forEach((tx: Transaction) => {
        // Use the shared categorization function for consistency
        const cat = categorizeTransaction(tx);

        // Debug logging for all transactions during breakdown computation
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[TransactionHistory] 🔍 Breakdown: Computing category for transaction:',
            {
              id: tx._id,
              type: tx.type,
              category: tx.category,
              description: tx.description,
              txId: tx.txId,
              amount: tx.amount,
              computedCategory: cat,
            }
          );
        }

        // Initialize category if it doesn't exist
        if (!recomputedBreakdown[cat]) {
          recomputedBreakdown[cat] = { count: 0, totalAmount: 0 };
        }
        recomputedBreakdown[cat].count += 1;
        recomputedBreakdown[cat].totalAmount += Math.abs(tx.amount);
      });

      // Debug logging for final breakdown
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[TransactionHistory] 📊 Final recomputed breakdown:',
          recomputedBreakdown
        );
      }

      // Use recomputed breakdown as the source of truth - it has the correct categorization
      // Merge with initialized breakdown to ensure main categories always show
      Object.keys(breakdown).forEach((key) => {
        if (recomputedBreakdown[key]) {
          breakdown[key] = recomputedBreakdown[key];
        }
      });

      // Add any additional categories from recomputed breakdown
      Object.entries(recomputedBreakdown).forEach(([cat, catData]) => {
        breakdown[cat] = catData; // Always use recomputed data, don't check if exists
      });

      console.log(
        '[TransactionHistory] ✅ Final merged breakdown after recomputation:',
        breakdown
      );
      return breakdown;
    }

    // Fallback: use API breakdown if no transactions available
    if (
      data?.categoryBreakdown &&
      Object.keys(data.categoryBreakdown).length > 0
    ) {
      console.log(
        '[TransactionHistory] ⚠️ No transactions available, using API categoryBreakdown:',
        data.categoryBreakdown
      );
      Object.entries(data.categoryBreakdown).forEach(([cat, catData]) => {
        const normalizedCat = cat.toLowerCase();
        if (normalizedCat !== 'other' && normalizedCat !== 'system') {
          breakdown[normalizedCat] = catData as {
            count: number;
            totalAmount: number;
          };
        }
      });
      return breakdown;
    }

    // Compute from summary if available
    if (data?.summary) {
      // Deposits
      if (data.summary.deposits) {
        breakdown.deposit = {
          count: data.summary.deposits.count || 0,
          totalAmount: data.summary.deposits.total || 0,
        };
      }

      // Withdrawals - always include
      if (data.summary.withdrawals) {
        breakdown.withdrawal = {
          count: data.summary.withdrawals.count || 0,
          totalAmount: data.summary.withdrawals.total || 0,
        };
      }

      // Staking
      if (data.summary.staking) {
        breakdown.staking = {
          count: data.summary.staking.stakeCount || 0,
          totalAmount: data.summary.staking.totalStaked || 0,
        };
      }

      // Earnings - always include
      if (data.summary.earnings) {
        const totalEarnings =
          (data.summary.earnings.rosPayouts || 0) +
          (data.summary.earnings.poolPayouts || 0);
        breakdown.earnings = {
          count: data.summary.earnings.rosCount || 0,
          totalAmount: totalEarnings,
        };
      }

      // Transfers
      if (data.summary.transfers) {
        breakdown.transfer = {
          count: 0, // We don't have exact count from summary
          totalAmount:
            (data.summary.transfers.sent || 0) +
            (data.summary.transfers.received || 0),
        };
      }

      // Additional categories
      if (data.summary.bonuses?.count > 0) {
        breakdown.bonus = {
          count: data.summary.bonuses.count,
          totalAmount: data.summary.bonuses.total,
        };
      }
      if (data.summary.fees > 0) {
        breakdown.fee = {
          count: 0,
          totalAmount: data.summary.fees,
        };
      }

      console.log(
        '[TransactionHistory] Computed breakdown from summary:',
        breakdown
      );
      return breakdown;
    }

    // Return breakdown with all main categories (even if empty)
    return breakdown;
  }, [
    data?.categoryBreakdown,
    data?.transactions,
    user?.username,
    categorizeTransaction,
    data?.summary,
  ]);

  const handleFilterChange = (
    key: keyof TransactionHistoryParams,
    value: any
  ) => {
    console.log('[TransactionHistory] 🔍 Filter change:', { key, value });
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' || value === '' ? undefined : value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    console.log('[TransactionHistory] 📄 Page change:', newPage);
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Smoothly scroll back to the transaction history section instead of the very top
    if (typeof window !== 'undefined' && sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      // Offset to account for any fixed headers / bottom nav (tuned for dashboard layout)
      const offset = 96;
      const targetTop = Math.max(rect.top + window.scrollY - offset, 0);
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    console.log('[TransactionHistory] 🗑️ Clearing all filters');
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    });
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const handleRefresh = () => {
    console.log('[TransactionHistory] 🔄 Refreshing data');
    refetch();
  };

  const hasActiveFilters = !!(
    filters.category ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo
  );

  // Helper function to get transaction category - uses the shared categorization function
  const getTransactionCategory = useCallback(
    (tx: Transaction): string => {
      return categorizeTransaction(tx);
    },
    [categorizeTransaction]
  );

  // Client-side filtering for transactions
  // We ALWAYS filter category client-side because backend uses stored category which might be wrong
  // Backend handles search and date filtering, but we also apply them client-side for consistency
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[TransactionHistory] 🔍 Filter: No transactions data available'
        );
      }
      return [];
    }

    if (!Array.isArray(data.transactions) || data.transactions.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[TransactionHistory] 🔍 Filter: Transactions array is empty or not an array'
        );
      }
      return [];
    }

    let filtered = [...data.transactions];

    // Filter out transfer_in transactions where current user is the sender
    // When a user sends money, they should only see the transfer_out transaction, not the transfer_in
    // The transfer_in transaction is for the receiver, not the sender
    if (user?.username) {
      const beforeTransferFilter = filtered.length;
      filtered = filtered.filter((tx) => {
        // If it's a transfer_in transaction and the current user is the sender (fromUser),
        // filter it out because this is the receiver's transaction, not the sender's
        if (
          (tx.type === 'transfer_in' ||
            tx.type?.toLowerCase() === 'transfer_in') &&
          tx.fromUser?.username === user.username
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[TransactionHistory] 🚫 Filtering out transfer_in transaction where user is sender:',
              {
                id: tx._id,
                type: tx.type,
                fromUser: tx.fromUser?.username,
                toUser: tx.toUser?.username,
                currentUser: user.username,
              }
            );
          }
          return false;
        }
        return true;
      });

      if (
        process.env.NODE_ENV === 'development' &&
        beforeTransferFilter !== filtered.length
      ) {
        console.log(
          `[TransactionHistory] 🚫 Filtered out ${beforeTransferFilter - filtered.length} transfer_in transactions where user is sender`
        );
      }
    }

    // TEMPORARY WORKAROUND: Filter out referral_bonus transactions incorrectly created for downlines
    // STATUS: Backend has fixed this issue (see REFERRAL_BONUS_LEVEL_FIX_VERIFICATION.md)
    // KEEP THIS WORKAROUND temporarily until backend fix is verified in production
    // TODO: Remove this workaround after confirming backend fix works correctly
    // This filter removes referral_bonus transactions where the current user is the relatedUserId
    // (meaning they're the downline who staked, not the referrer who earned the bonus)
    if (user?._id) {
      const beforeReferralFilter = filtered.length;
      filtered = filtered.filter((tx) => {
        // If it's a referral_bonus transaction and the current user's ID matches the relatedUserId,
        // filter it out because this transaction was incorrectly created for the downline
        // Only the referrer should see referral_bonus transactions
        if (
          (tx.type === 'referral_bonus' ||
            tx.type?.toLowerCase() === 'referral_bonus') &&
          tx.metadata?.relatedUserId &&
          (tx.metadata.relatedUserId === user._id ||
            String(tx.metadata.relatedUserId) === String(user._id))
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              '[TransactionHistory] 🚫 Filtering out incorrectly created referral_bonus transaction for downline:',
              {
                id: tx._id,
                type: tx.type,
                relatedUserId: tx.metadata.relatedUserId,
                currentUserId: user._id,
                description: tx.description,
              }
            );
          }
          return false;
        }
        return true;
      });

      if (
        process.env.NODE_ENV === 'development' &&
        beforeReferralFilter !== filtered.length
      ) {
        console.warn(
          `[TransactionHistory] 🚫 Filtered out ${beforeReferralFilter - filtered.length} incorrectly created referral_bonus transactions for downlines. Backend fix required - see BACKEND_REFERRAL_BONUS_DUPLICATION_FIX.md`
        );
      }
    }

    if (process.env.NODE_ENV === 'development' && filters.category) {
      console.log(
        '[TransactionHistory] 🔍 Filter: Starting with',
        filtered.length,
        'transactions, filtering by category:',
        filters.category
      );
      console.log(
        '[TransactionHistory] 🔍 Filter: Transaction IDs:',
        filtered.map((tx) => tx._id)
      );
    }

    // ALWAYS filter by category client-side (using our categorization logic)
    // This ensures transfers, deposits, etc. are correctly identified
    if (filters.category) {
      const categoryFilter = filters.category.toLowerCase();
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[TransactionHistory] 🔍 Filter: Category filter active:',
          categoryFilter
        );
        console.log(
          '[TransactionHistory] 🔍 Filter: getTransactionCategory function:',
          typeof getTransactionCategory
        );
      }

      const beforeFilterCount = filtered.length;
      filtered = filtered.filter((tx) => {
        const txCategory = getTransactionCategory(tx);
        const matches = txCategory === categoryFilter;

        // Debug logging for category filtering - log ALL transactions when filtering by staking
        if (
          process.env.NODE_ENV === 'development' &&
          categoryFilter === 'staking'
        ) {
          console.log(
            `[TransactionHistory] 🔍 Filter: Checking transaction for staking filter:`,
            {
              id: tx._id,
              type: tx.type,
              category: tx.category,
              computedCategory: txCategory,
              filterCategory: categoryFilter,
              matches,
              description: tx.description,
              txId: tx.txId,
              direction: tx.direction,
              fromUser: tx.fromUser,
              toUser: tx.toUser,
              typeIncludesStake: tx.type?.toLowerCase().includes('stake'),
              descriptionIncludesStake: (tx.description || '')
                .toLowerCase()
                .includes('stake'),
              txIdIncludesStake: (tx.txId || '')
                .toUpperCase()
                .includes('STAKE'),
              // Also check what categorizeTransaction returns directly
              directCategorize: categorizeTransaction(tx),
            }
          );
        } else if (
          process.env.NODE_ENV === 'development' &&
          !matches &&
          categoryFilter === 'transfer'
        ) {
          console.log(
            `[TransactionHistory] Filter: Transaction not matching transfer filter:`,
            {
              id: tx._id,
              type: tx.type,
              category: tx.category,
              computedCategory: txCategory,
              filterCategory: categoryFilter,
              fromUser: tx.fromUser,
              toUser: tx.toUser,
              description: tx.description,
              direction: tx.direction,
            }
          );
        }

        return matches;
      });

      // Debug: Log filtering results
      if (
        process.env.NODE_ENV === 'development' &&
        categoryFilter === 'staking'
      ) {
        console.log(
          `[TransactionHistory] 🔍 Filter: After staking filter, ${filtered.length} transactions remain out of ${beforeFilterCount} total`
        );
        if (filtered.length === 0 && beforeFilterCount > 0) {
          console.warn(
            `[TransactionHistory] ⚠️ WARNING: Filter returned 0 results but started with ${beforeFilterCount} transactions!`
          );
          // Show what categories were actually computed
          const categoryMap = data.transactions.reduce(
            (acc: Record<string, any[]>, tx: Transaction) => {
              const cat = getTransactionCategory(tx);
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push({
                id: tx._id,
                type: tx.type,
                description: tx.description,
              });
              return acc;
            },
            {} as Record<string, any[]>
          );
          console.log(
            '[TransactionHistory] 🔍 Filter: Actual categories found:',
            categoryMap
          );
        }
      }
    }

    // Also apply search filter client-side (backend might have already filtered, but we ensure consistency)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((tx) => {
        // Search in multiple fields
        const searchableText = [
          tx.description,
          tx._id,
          tx.reference,
          tx.txId,
          tx.walletAddress,
          tx.fromUser?.username,
          tx.toUser?.username,
          tx.fromUser?.name,
          tx.toUser?.name,
          tx.typeLabel || formatTransactionType(tx.type),
          formatCurrency(tx.amount, { showCurrency: false }),
          String(tx.amount),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(searchLower);
      });
    }

    // Also apply date filter client-side for consistency
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((tx) => {
        const txDate = new Date(tx.timestamp).getTime();

        if (filters.dateFrom && filters.dateTo) {
          const fromDate = new Date(filters.dateFrom).getTime();
          const toDate = new Date(filters.dateTo).getTime() + 86400000; // Add one day to include end date
          return txDate >= fromDate && txDate <= toDate;
        } else if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom).getTime();
          return txDate >= fromDate;
        } else if (filters.dateTo) {
          const toDate = new Date(filters.dateTo).getTime() + 86400000;
          return txDate <= toDate;
        }

        return true;
      });
    }

    // Sort transactions
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'amount':
            comparison = Math.abs(a.amount) - Math.abs(b.amount);
            break;
          case 'type':
            comparison = (a.type || '').localeCompare(b.type || '');
            break;
          case 'timestamp':
          default:
            comparison =
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            break;
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    data?.transactions,
    filters,
    getTransactionCategory,
    categorizeTransaction,
    user?._id,
    user?.username,
  ]);

  // Debug logging for filters
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && data?.transactions) {
      // When filtering by staking, show detailed breakdown of all transactions
      if (filters.category === 'staking' && data.transactions.length > 0) {
        const categoryBreakdown = data.transactions.reduce(
          (acc: Record<string, any[]>, tx: Transaction) => {
            const cat = getTransactionCategory(tx);
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push({
              id: tx._id,
              type: tx.type,
              category: tx.category,
              description: tx.description,
              amount: tx.amount,
            });
            return acc;
          },
          {} as Record<string, any[]>
        );

        console.log(
          '[TransactionHistory] 📊 STAKING FILTER - All Transactions by Category:',
          categoryBreakdown
        );
        console.log(
          '[TransactionHistory] 📊 STAKING FILTER - Staking transactions found:',
          categoryBreakdown['staking'] || []
        );
      }

      console.log('[TransactionHistory] 🔍 Filter Debug:', {
        totalTransactions: data.transactions.length,
        filteredCount: filteredTransactions.length,
        filters,
        backendFilters,
        categoryFilter: filters.category,
        searchFilter: filters.search,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        isCategoryFiltering: !!filters.category,
        note: filters.category
          ? 'Category filtering is done CLIENT-SIDE (backend category might be wrong)'
          : 'No category filter - using backend filtering',
        sampleTransaction: data.transactions[0]
          ? {
              id: data.transactions[0]._id,
              type: data.transactions[0].type,
              category: data.transactions[0].category,
              computedCategory: getTransactionCategory(data.transactions[0]),
            }
          : null,
      });
    }
  }, [
    data?.transactions,
    filteredTransactions.length,
    filters,
    backendFilters,
    getTransactionCategory,
  ]);

  if (error) {
    return (
      <UserFriendlyError
        error={error}
        onRetry={handleRefresh}
        variant="card"
        className="mx-auto max-w-2xl"
      />
    );
  }

  const reducedMotion = prefersReducedMotion();

  return (
    <div ref={sectionRef} className="space-y-4 sm:space-y-6">
      {/* Header - Staking Streak Template */}
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={reducedMotion ? false : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent" />

          {/* Animated Floating Blob */}
          {!reducedMotion && (
            <motion.div
              animate={{
                x: [0, -15, 0],
                y: [0, 10, 0],
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-blue-500/30 blur-2xl"
            />
          )}

          <CardHeader className="relative p-4 sm:p-6">
            <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                >
                  <FileText className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                    Transaction History
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">
                    View all your deposits, withdrawals, and transfers
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* 🔍 DEBUG: Referral Bonus Verification Banner (development only) */}
          {process.env.NODE_ENV === 'development' &&
            (() => {
              const referralBonuses = filteredTransactions.filter(
                (tx) => tx.type === 'referral_bonus'
              );

              if (referralBonuses.length === 0) return null;

              const incorrect = referralBonuses.filter((tx) =>
                tx.description.toLowerCase().includes('earnings')
              );

              const correct = referralBonuses.filter((tx) =>
                tx.description.toLowerCase().includes('stake')
              );

              const allCorrect = incorrect.length === 0;

              return (
                <CardContent className="relative border-t border-amber-500/20 bg-amber-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 ${allCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                    >
                      {allCorrect ? '✅' : '⚠️'}
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1 text-sm font-semibold">
                        {allCorrect
                          ? '✅ Referral Bonus Verification: PASSED'
                          : '⚠️ Referral Bonus Verification: ISSUES FOUND'}
                      </h4>
                      <div className="text-muted-foreground space-y-1 text-xs">
                        <p>
                          Found {referralBonuses.length} referral bonus
                          transaction(s)
                        </p>
                        <p>
                          ✅ Correct (mentions &quot;stake&quot;):{' '}
                          {correct.length}
                        </p>
                        {incorrect.length > 0 && (
                          <>
                            <p className="font-semibold text-red-600">
                              ❌ Incorrect (mentions &quot;earnings&quot;):{' '}
                              {incorrect.length}
                            </p>
                            <p className="mt-2 text-xs text-red-600">
                              These transactions should say &quot;from X&apos;s
                              stake&quot; not &quot;from X&apos;s
                              earnings&quot;. Backend cleanup may not have
                              completed.
                            </p>
                          </>
                        )}
                        <p className="mt-2 text-xs opacity-70">
                          This banner is only visible in development mode. Check
                          browser console for detailed logs.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              );
            })()}

          {/* Search and Date Filters */}
          <CardContent className="relative p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Search Input */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Search by amount, username, wallet address, TX ID, description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pr-9 pl-9 ${searchQuery ? 'border-primary' : ''}`}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
                        onClick={() => {
                          setSearchQuery('');
                          setDebouncedSearch('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Date From */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="date"
                      placeholder="Date from"
                      value={filters.dateFrom || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'dateFrom',
                          e.target.value || undefined
                        )
                      }
                      className={`pl-9 ${filters.dateFrom ? 'border-primary' : ''}`}
                    />
                  </div>
                </div>

                {/* Date To */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <Calendar className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="date"
                      placeholder="Date to"
                      value={filters.dateTo || ''}
                      onChange={(e) =>
                        handleFilterChange(
                          'dateTo',
                          e.target.value || undefined
                        )
                      }
                      className={`pl-9 ${filters.dateTo ? 'border-primary' : ''}`}
                      min={filters.dateFrom || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters Badge and Clear Button */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {
                        [
                          filters.category && 'Category',
                          filters.search && 'Search',
                          filters.dateFrom && 'Date From',
                          filters.dateTo && 'Date To',
                        ].filter(Boolean).length
                      }{' '}
                      filter
                      {[
                        filters.category && 'Category',
                        filters.search && 'Search',
                        filters.dateFrom && 'Date From',
                        filters.dateTo && 'Date To',
                      ].filter(Boolean).length !== 1
                        ? 's'
                        : ''}{' '}
                      active
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction List - Staking Streak Template */}
      {isLoading ? (
        <LoadingStates.List lines={5} className="space-y-3" />
      ) : filteredTransactions.length > 0 ? (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent" />

            {/* Animated Floating Blob */}
            {!reducedMotion && (
              <motion.div
                animate={{
                  x: [0, -15, 0],
                  y: [0, 10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
              />
            )}

            <CardHeader className="relative p-4 sm:p-6">
              <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
                  >
                    <FileText className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                      Transactions
                    </CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                      {hasActiveFilters
                        ? `${filteredTransactions.length} of ${data?.transactions?.length || 0} filtered`
                        : `${data?.pagination?.totalItems || filteredTransactions.length} total transactions`}
                    </CardDescription>
                  </div>
                </div>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="text-xs">
                    Filtered
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative p-0 pt-0 sm:pt-0">
              <div className="divide-border/50 divide-y">
                {filteredTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction._id}
                    transaction={transaction}
                    index={index}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination - Mobile First */}
          {data.pagination &&
            data.pagination.totalPages > 1 &&
            !hasActiveFilters && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Showing{' '}
                  {(data.pagination.currentPage - 1) *
                    data.pagination.itemsPerPage +
                    1}{' '}
                  to{' '}
                  {Math.min(
                    data.pagination.currentPage * data.pagination.itemsPerPage,
                    data.pagination.totalItems
                  )}{' '}
                  of {data.pagination.totalItems} transactions
                </p>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(data.pagination.currentPage - 1)
                    }
                    disabled={!data.pagination.hasPrev}
                    className="h-8 text-xs sm:h-9 sm:text-sm"
                  >
                    <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <span className="bg-muted flex items-center rounded-md px-2 text-xs sm:px-4 sm:text-sm">
                    Page {data.pagination.currentPage} of{' '}
                    {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(data.pagination.currentPage + 1)
                    }
                    disabled={!data.pagination.hasNext}
                    className="h-8 text-xs sm:h-9 sm:text-sm"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            )}
        </motion.div>
      ) : (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={reducedMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-gray-500/10 to-transparent" />

            {/* Animated Floating Blob */}
            {!reducedMotion && (
              <motion.div
                animate={{
                  x: [0, -15, 0],
                  y: [0, 10, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -bottom-8 -left-12 h-24 w-24 rounded-full bg-slate-500/30 blur-2xl"
              />
            )}

            <CardContent className="relative p-0">
              <EmptyStates.EmptyTransactions
                action={
                  hasActiveFilters
                    ? {
                        label: 'Clear Filters',
                        onClick: clearFilters,
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Transaction Item Component
 */
function TransactionItem({
  transaction,
  index,
}: {
  transaction: Transaction;
  index: number;
}) {
  const statusInfo = formatTransactionStatus(transaction.status);
  const typeIcon = getTransactionIcon(transaction.type, transaction.direction);
  const isPositive = transaction.direction === 'in';
  const isNeutral = transaction.direction === 'neutral';
  const [showReceipt, setShowReceipt] = useState(false);

  // 🔍 DEBUG: Log referral bonus transactions for verification
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      transaction.type === 'referral_bonus'
    ) {
      console.group(`🎁 Referral Bonus Transaction #${index + 1}`);
      console.log('Description:', transaction.description);
      console.log('Expected: Contains "stake"');
      console.log(
        'Actual:',
        transaction.description.includes('stake')
          ? '✅ CORRECT'
          : '❌ INCORRECT'
      );
      console.log('Metadata:', {
        stakeId: transaction.metadata?.stakeId || '❌ MISSING',
        stakeAmount: transaction.metadata?.stakeAmount || '❌ MISSING',
        origin: transaction.metadata?.origin || '❌ MISSING',
        trigger: transaction.metadata?.trigger,
        level: transaction.metadata?.level,
        // Old incorrect fields (should NOT be present)
        earningsAmount:
          transaction.metadata?.earningsAmount || '✅ Not present',
      });
      console.groupEnd();
    }
  }, [transaction, index]);

  return (
    <motion.div
      {...listItemAnimation(index)}
      className="hover:bg-muted/50 group p-3 transition-colors sm:p-4"
    >
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-4">
        {/* Left: Icon & Details */}
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-4">
          {/* Icon */}
          <div
            className={`shrink-0 rounded-lg p-2 sm:rounded-xl sm:p-3 ${
              isPositive
                ? 'bg-emerald-500/10'
                : isNeutral
                  ? 'bg-muted'
                  : 'bg-red-500/10'
            }`}
          >
            <div className="h-4 w-4 sm:h-5 sm:w-5">{typeIcon}</div>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <p className="text-foreground text-sm font-semibold sm:text-base">
                {formatTransactionType(transaction.type, transaction.typeLabel)}
              </p>
              <Badge
                className={`${statusInfo.bgColor} ${statusInfo.color} text-[10px] sm:text-xs`}
              >
                {statusInfo.label}
              </Badge>
              {transaction.requiresAdminApproval && (
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  Pending Approval
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mb-1 line-clamp-2 text-xs sm:line-clamp-1 sm:text-sm">
              {transaction.description}
              {/* 🔍 DEBUG: Highlight incorrect referral bonus descriptions (remove after verification) */}
              {process.env.NODE_ENV === 'development' &&
                transaction.type === 'referral_bonus' &&
                transaction.description.toLowerCase().includes('earnings') && (
                  <Badge variant="destructive" className="ml-2 text-[10px]">
                    ⚠️ INCORRECT: Should say &quot;stake&quot; not
                    &quot;earnings&quot;
                  </Badge>
                )}
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[10px] sm:gap-3 sm:text-xs">
              <span>{formatTransactionDate(transaction.timestamp)}</span>
              {transaction.reference && (
                <span className="font-mono">
                  Ref: {maskWalletAddress(transaction.reference)}
                </span>
              )}
              {transaction.txId && (
                <span className="font-mono">
                  TX: {maskWalletAddress(transaction.txId)}
                </span>
              )}
              {transaction.metadata?.network && (
                <Badge variant="outline" className="text-xs">
                  {String(transaction.metadata.network)}
                </Badge>
              )}
              {/* Show P2P username for transfers */}
              {transaction.fromUser?.username && (
                <span className="text-xs">
                  From: @{transaction.fromUser.username}
                </span>
              )}
              {transaction.toUser?.username && (
                <span className="text-xs">
                  To: @{transaction.toUser.username}
                </span>
              )}
              {/* Show withdrawal-specific details */}
              {transaction.type === 'withdrawal' &&
                transaction.walletAddress && (
                  <>
                    <span className="font-mono text-xs">
                      To: {maskWalletAddress(transaction.walletAddress)}
                    </span>
                    {transaction.metadata?.network && (
                      <Badge variant="outline" className="text-xs">
                        {String(transaction.metadata.network)}
                      </Badge>
                    )}
                    {transaction.requiresAdminApproval && (
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-xs text-amber-600"
                      >
                        Requires Approval
                      </Badge>
                    )}
                  </>
                )}
              {/* Show earnings-specific metadata */}
              {transaction.category === 'earnings' && (
                <>
                  {transaction.metadata?.weekNumber && (
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      Week {transaction.metadata.weekNumber}
                    </span>
                  )}
                  {transaction.metadata?.rosPercentage && (
                    <span className="text-xs">
                      {transaction.metadata.rosPercentage}% ROS
                    </span>
                  )}
                  {transaction.metadata?.stakeAmount && (
                    <span className="text-xs">
                      Stake:{' '}
                      {formatCurrency(transaction.metadata.stakeAmount, {
                        showCurrency: false,
                      })}
                    </span>
                  )}
                  {transaction.metadata?.poolSharePercentage && (
                    <span className="text-xs">
                      Pool Share: {transaction.metadata.poolSharePercentage}%
                    </span>
                  )}
                  {transaction.metadata?.daysActive && (
                    <span className="text-xs">
                      {transaction.metadata.daysActive} day
                      {transaction.metadata.daysActive !== 1 ? 's' : ''} active
                    </span>
                  )}
                </>
              )}
              {/* Show staking-specific metadata */}
              {transaction.metadata?.stakeId && (
                <span className="font-mono text-xs">
                  Stake ID: {String(transaction.metadata.stakeId).slice(0, 8)}
                  ...
                </span>
              )}
              {/* Show bonus-specific metadata */}
              {transaction.category === 'bonus' &&
                transaction.metadata?.bonusType && (
                  <Badge variant="outline" className="text-xs">
                    {String(transaction.metadata.bonusType).replace('_', ' ')}
                  </Badge>
                )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="ml-2 flex shrink-0 items-center gap-2 sm:ml-4 sm:gap-3">
          <div className="text-right">
            <p
              className={`text-sm font-bold sm:text-lg ${
                isPositive
                  ? 'text-emerald-500'
                  : isNeutral
                    ? 'text-muted-foreground'
                    : 'text-red-500'
              }`}
            >
              {formatAmountWithDirection(
                transaction.amount,
                transaction.direction
              )}
            </p>
            {/* Show fee and net amount for withdrawals */}
            {transaction.type === 'withdrawal' && transaction.fee > 0 && (
              <>
                <p className="text-muted-foreground text-xs">
                  Fee:{' '}
                  {formatCurrency(transaction.fee, { showCurrency: false })}
                </p>
                {transaction.netAmount &&
                  transaction.netAmount !== transaction.amount && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Net:{' '}
                      {formatCurrency(transaction.netAmount, {
                        showCurrency: false,
                      })}
                    </p>
                  )}
              </>
            )}
            {/* Show fee for other transaction types */}
            {transaction.type !== 'withdrawal' && transaction.fee > 0 && (
              <p className="text-muted-foreground text-xs">
                Fee: {formatCurrency(transaction.fee, { showCurrency: false })}
              </p>
            )}
          </div>

          {/* Receipt Button */}
          <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity group-hover:opacity-100"
                title="Generate Receipt"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Transaction Receipt</DialogTitle>
                <DialogDescription>
                  Download or print this receipt for your records
                </DialogDescription>
              </DialogHeader>
              <TransactionReceipt transaction={transaction} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Get transaction type icon based on type and direction
 */
function getTransactionIcon(
  type: string,
  direction: 'in' | 'out' | 'neutral'
): React.ReactNode {
  const iconClass = 'h-full w-full';

  // Map by type first
  switch (type) {
    case 'deposit':
      return <ArrowDownRight className={`${iconClass} text-emerald-500`} />;
    case 'withdrawal':
      return <ArrowUpRight className={`${iconClass} text-red-500`} />;
    case 'transfer_out':
      return <ArrowUpRight className={`${iconClass} text-purple-500`} />;
    case 'transfer_in':
      return <ArrowDownRight className={`${iconClass} text-purple-500`} />;
    case 'stake':
      return <TrendingUp className={`${iconClass} text-blue-500`} />;
    case 'unstake':
      return <TrendingUp className={`${iconClass} text-orange-500`} />;
    case 'ros_payout':
    case 'stake_completion':
    case 'stake_pool_payout':
    case 'performance_pool_payout':
    case 'premium_pool_payout':
      return <DollarSign className={`${iconClass} text-amber-500`} />;
    case 'registration_bonus':
    case 'referral_bonus':
    case 'bonus_activation':
      return <Gift className={`${iconClass} text-pink-500`} />;
    case 'fee':
      return <CreditCard className={`${iconClass} text-orange-500`} />;
    case 'adjustment':
    case 'refund':
      return <RefreshCw className={`${iconClass} text-slate-500`} />;
  }

  // Fallback by direction
  if (direction === 'in') {
    return <ArrowDownRight className={`${iconClass} text-emerald-500`} />;
  }
  if (direction === 'out') {
    return <ArrowUpRight className={`${iconClass} text-red-500`} />;
  }
  return <RefreshCw className={`${iconClass} text-muted-foreground`} />;
}

/**
 * Transaction Receipt Component
 * Generates a printable/downloadable receipt for transactions
 */
function TransactionReceipt({ transaction }: { transaction: Transaction }) {
  const { user } = useUser();
  const statusInfo = formatTransactionStatus(transaction.status);
  const isPositive = transaction.direction === 'in';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (!receiptContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Receipt - ${transaction._id}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #1f2937;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .receipt-title {
              font-size: 18px;
              color: #6b7280;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .detail-label {
              color: #6b7280;
              font-size: 14px;
            }
            .detail-value {
              font-weight: 500;
              font-size: 14px;
              text-align: right;
            }
            .amount-section {
              background: ${isPositive ? '#f0fdf4' : '#fef2f2'};
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .amount-label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .amount-value {
              font-size: 32px;
              font-weight: bold;
              color: ${isPositive ? '#10b981' : '#ef4444'};
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div id="receipt-content" className="bg-background">
      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 border-b pb-4 text-center">
        <div className="text-primary mb-2 text-2xl font-bold">Novunt</div>
        <div className="text-muted-foreground text-sm">Transaction Receipt</div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-6">
        {/* Amount Section */}
        <div
          className={`rounded-lg p-6 ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
        >
          <div className="text-muted-foreground mb-2 text-sm">
            Transaction Amount
          </div>
          <div
            className={`text-4xl font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}
          >
            {formatAmountWithDirection(
              transaction.amount,
              transaction.direction
            )}
          </div>
          {transaction.fee > 0 && (
            <div className="text-muted-foreground mt-2 text-sm">
              Fee: {formatCurrency(transaction.fee, { showCurrency: true })} |
              Net:{' '}
              {formatCurrency(transaction.netAmount || transaction.amount, {
                showCurrency: true,
              })}
            </div>
          )}
        </div>

        {/* Transaction Information */}
        <div className="space-y-4">
          <div>
            <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
              Transaction Information
            </div>
            <div className="space-y-2">
              <DetailRow
                label="Type"
                value={formatTransactionType(
                  transaction.type,
                  transaction.typeLabel
                )}
              />
              <DetailRow
                label="Status"
                value={
                  <Badge
                    className={`${statusInfo.bgColor} ${statusInfo.color} text-xs`}
                  >
                    {statusInfo.label}
                  </Badge>
                }
              />
              <DetailRow label="Category" value={transaction.category} />
              <DetailRow
                label="Date & Time"
                value={formatTransactionDate(transaction.timestamp)}
              />
              <DetailRow label="Description" value={transaction.description} />
            </div>
          </div>

          {/* Transaction IDs */}
          <div>
            <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
              Transaction Identifiers
            </div>
            <div className="space-y-2">
              <DetailRow
                label="Transaction ID"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{transaction._id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction._id)}
                      title="Copy"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                }
              />
              {transaction.reference && (
                <DetailRow
                  label="Reference"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {transaction.reference}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(transaction.reference)}
                        title="Copy"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                />
              )}
              {transaction.txId && (
                <DetailRow
                  label="Transaction Hash"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {transaction.txId}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(transaction.txId!)}
                        title="Copy"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                />
              )}
            </div>
          </div>

          {/* Wallet Information */}
          {(transaction.sourceWallet ||
            transaction.destinationWallet ||
            transaction.walletAddress) && (
            <div>
              <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                Wallet Information
              </div>
              <div className="space-y-2">
                {transaction.sourceWallet && (
                  <DetailRow
                    label="Source Wallet"
                    value={transaction.sourceWallet}
                  />
                )}
                {transaction.destinationWallet && (
                  <DetailRow
                    label="Destination Wallet"
                    value={transaction.destinationWallet}
                  />
                )}
                {transaction.walletAddress && (
                  <DetailRow
                    label="Wallet Address"
                    value={
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {transaction.walletAddress}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            copyToClipboard(transaction.walletAddress!)
                          }
                          title="Copy"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    }
                  />
                )}
                {transaction.metadata?.network && (
                  <DetailRow
                    label="Network"
                    value={String(transaction.metadata.network)}
                  />
                )}
              </div>
            </div>
          )}

          {/* P2P Transfer Information */}
          {(transaction.fromUser || transaction.toUser) && (
            <div>
              <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                Transfer Information
              </div>
              <div className="space-y-2">
                {transaction.fromUser && (
                  <DetailRow
                    label="From User"
                    value={`${transaction.fromUser.name} (@${transaction.fromUser.username})`}
                  />
                )}
                {transaction.toUser && (
                  <DetailRow
                    label="To User"
                    value={`${transaction.toUser.name} (@${transaction.toUser.username})`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Balance Information */}
          {(transaction.balanceBefore !== undefined ||
            transaction.balanceAfter !== undefined) && (
            <div>
              <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                Balance Information
              </div>
              <div className="space-y-2">
                {transaction.balanceBefore !== undefined && (
                  <DetailRow
                    label="Balance Before"
                    value={formatCurrency(transaction.balanceBefore, {
                      showCurrency: true,
                    })}
                  />
                )}
                {transaction.balanceAfter !== undefined && (
                  <DetailRow
                    label="Balance After"
                    value={formatCurrency(transaction.balanceAfter, {
                      showCurrency: true,
                    })}
                  />
                )}
              </div>
            </div>
          )}

          {/* Withdrawal Details */}
          {transaction.type === 'withdrawal' && (
            <div>
              <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                Withdrawal Details
              </div>
              <div className="space-y-2">
                {transaction.walletAddress && (
                  <DetailRow
                    label="Recipient Address"
                    value={
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {transaction.walletAddress}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() =>
                            copyToClipboard(transaction.walletAddress!)
                          }
                          title="Copy"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    }
                  />
                )}
                {transaction.metadata?.network && (
                  <DetailRow
                    label="Network"
                    value={String(transaction.metadata.network)}
                  />
                )}
                {transaction.fee > 0 && (
                  <>
                    <DetailRow
                      label="Requested Amount"
                      value={formatCurrency(transaction.amount, {
                        showCurrency: true,
                      })}
                    />
                    <DetailRow
                      label="Withdrawal Fee"
                      value={formatCurrency(transaction.fee, {
                        showCurrency: true,
                      })}
                    />
                    {transaction.netAmount && (
                      <DetailRow
                        label="Net Amount (Received)"
                        value={
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(transaction.netAmount, {
                              showCurrency: true,
                            })}
                          </span>
                        }
                      />
                    )}
                  </>
                )}
                {transaction.requiresAdminApproval && (
                  <DetailRow
                    label="Approval Status"
                    value={
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-600"
                      >
                        Requires Admin Approval
                      </Badge>
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Earnings Details */}
          {transaction.category === 'earnings' && (
            <div>
              <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                Earnings Details
              </div>
              <div className="space-y-2">
                {transaction.metadata?.weekNumber && (
                  <DetailRow
                    label="Week Number"
                    value={`Week ${transaction.metadata.weekNumber}`}
                  />
                )}
                {transaction.metadata?.rosPercentage && (
                  <DetailRow
                    label="ROS Percentage"
                    value={`${transaction.metadata.rosPercentage}%`}
                  />
                )}
                {transaction.metadata?.stakeAmount && (
                  <DetailRow
                    label="Original Stake Amount"
                    value={formatCurrency(transaction.metadata.stakeAmount, {
                      showCurrency: true,
                    })}
                  />
                )}
                {transaction.metadata?.poolSharePercentage && (
                  <DetailRow
                    label="Pool Share"
                    value={`${transaction.metadata.poolSharePercentage}%`}
                  />
                )}
                {transaction.metadata?.daysActive && (
                  <DetailRow
                    label="Days Active"
                    value={`${transaction.metadata.daysActive} day${transaction.metadata.daysActive !== 1 ? 's' : ''}`}
                  />
                )}
                {/* Referral Bonus Metadata */}
                {transaction.type === 'referral_bonus' && (
                  <>
                    {transaction.metadata?.bonusType && (
                      <DetailRow
                        label="Bonus Type"
                        value={String(transaction.metadata.bonusType)
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      />
                    )}
                    {transaction.metadata?.relatedUserId && (
                      <DetailRow
                        label="Related User ID"
                        value={String(transaction.metadata.relatedUserId)}
                      />
                    )}
                  </>
                )}
                {(() => {
                  const stakeId = transaction.metadata?.stakeId;
                  return stakeId ? (
                    <DetailRow
                      label="Stake ID"
                      value={
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {String(stakeId)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(String(stakeId))}
                            title="Copy"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      }
                    />
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Bonus Details */}
          {transaction.category === 'bonus' && (
            <div>
              <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                Bonus Details
              </div>
              <div className="space-y-2">
                {transaction.metadata?.bonusType && (
                  <DetailRow
                    label="Bonus Type"
                    value={String(transaction.metadata.bonusType)
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  />
                )}
                {transaction.metadata?.relatedUserId && (
                  <DetailRow
                    label="Related User ID"
                    value={String(transaction.metadata.relatedUserId)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Additional Metadata */}
          {transaction.metadata &&
            Object.keys(transaction.metadata).length > 0 && (
              <div>
                <div className="text-muted-foreground mb-2 border-b pb-1 text-xs font-semibold uppercase">
                  Additional Information
                </div>
                <div className="space-y-2">
                  {Object.entries(transaction.metadata)
                    .filter(([key]) => {
                      // Filter out fields already shown in specific sections
                      const excludedKeys = [
                        'network',
                        'weekNumber',
                        'rosPercentage',
                        'stakeAmount',
                        'poolSharePercentage',
                        'daysActive',
                        'stakeId',
                        'bonusType',
                        'relatedUserId',
                      ];
                      return !excludedKeys.includes(key);
                    })
                    .map(([key, value]) => (
                      <DetailRow
                        key={key}
                        label={key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                        value={String(value)}
                      />
                    ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-muted-foreground mt-8 border-t pt-6 text-center text-sm">
        <p>This is an official receipt from Novunt</p>
        <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
        {user && <p className="mt-1">Account: {user.email}</p>}
      </div>

      {/* Action Buttons */}
      <div className="no-print mt-6 flex gap-2">
        <Button onClick={handlePrint} className="flex-1">
          <FileText className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

/**
 * Detail Row Component for Receipt
 */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="border-border/50 flex items-center justify-between border-b py-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <div className="text-right text-sm font-medium">{value}</div>
    </div>
  );
}

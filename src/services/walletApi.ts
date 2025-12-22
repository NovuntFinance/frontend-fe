/**
 * Wallet API Service
 * Handles all wallet-related API calls based on backend TRD
 *
 * Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

import { api } from '@/lib/api';

// ============================================
// TYPES (Based on Backend TRD)
// ============================================

export interface UserWallet {
  // Core Balances
  totalBalance: number;
  fundedWallet: number;
  earningWallet: number;

  // Capabilities
  canStake: boolean;
  canWithdraw: boolean;
  canTransfer: boolean;

  // Statistics
  statistics: {
    totalDeposited: number;
    totalWithdrawn: number;
    totalTransferReceived: number;
    totalTransferSent: number;
    totalStaked: number;
    totalStakeReturns: number;
    totalEarned: number; // Total of ALL earnings combined (ROS, pools, bonuses, referrals, stake returns)
  };

  // Metadata
  walletAddress: string | null;
  createdAt: string;

  // Withdrawal Address (from wallet info endpoint)
  defaultWithdrawalAddress?: string | null;
  hasDefaultAddress?: boolean;
  immutable?: boolean; // Address cannot be changed once set
}

export interface DetailedWallet extends UserWallet {
  // Detailed Breakdown
  breakdown: {
    fundedWallet: number;
    earningWallet: number;
    total: number;
    canStake: boolean;
    canWithdraw: boolean;
  };

  // Staking Options
  stakingOptions: {
    availableForStaking: number;
    canStakeAll: boolean;
    breakdown: {
      fromFundedWallet: number;
      fromEarningWallet: number;
    };
  };

  // Transfer Options
  transferOptions: {
    availableForTransfer: number;
    canTransferAll: boolean;
    breakdown: {
      fromFundedWallet: number;
      fromEarningWallet: number;
    };
  };

  // Withdrawal Options
  withdrawalOptions: {
    availableForWithdrawal: number;
    canWithdrawAll: boolean;
    breakdown: {
      fromEarningWallet: number;
    };
  };
}

export interface DepositRequest {
  amount: number; // Min: 10, Max: 100000
}

export interface DepositResponse {
  success: boolean;
  message: string;
  data: {
    depositId: string;
    invoiceId: string;
    amount: number;
    status: 'pending';
    paymentUrl: string;
    qrCode: string; // Base64 data URL
    expiresAt: string; // ISO 8601
    supportedNetworks: string[];
  };
}

export interface DepositStatus {
  success: boolean;
  data: {
    depositId: string;
    invoiceId: string;
    amount: number;
    status: 'pending' | 'confirmed' | 'failed';
    paymentUrl: string | null;
    qrCode: string | null;
    expiresAt: string;
    confirmedAt: string | null;
    txId: string | null;
    network: string | null;
  };
}

export interface WithdrawalLimits {
  success: boolean;
  data: {
    availableBalance: number;
    limits: {
      minimum: number;
      instantWithdrawalThreshold: number;
      enableInstantWithdrawals: boolean;
    };
    dailyLimits: {
      maxWithdrawalsPerDay: number;
      withdrawalsUsedToday: number;
      withdrawalsRemaining: number;
      canWithdrawToday: boolean;
      resetTime: string;
    };
    fees: {
      percentage: number;
      description: string;
    };
    supportedNetworks: string[];
    processingTimes: {
      instant: string;
      standard: string;
    };
  };
}

export interface MoratoriumStatus {
  active: boolean;
  canChange: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  canChangeAt: string | null;
  canChangeAtFormatted: string | null;
  moratoriumDurationHours: number;
}

export interface DefaultWithdrawalAddress {
  success: boolean;
  data: {
    address: string | null;
    hasDefaultAddress: boolean;
    canChange: boolean;
    moratorium: MoratoriumStatus;
    note?: string;
    isFirstTime?: boolean;
    // Legacy field for backward compatibility
    immutable?: boolean;
  };
}

export interface SetDefaultAddressRequest {
  address: string;
  network?: 'TRC20' | 'BEP20'; // Optional, backend may auto-detect
  twoFACode?: string; // Required for setting address
}

export interface WithdrawalRequest {
  amount: number;
  walletAddress?: string; // Optional - if not provided, backend uses user's default withdrawal address
  network?: 'TRC20' | 'BEP20'; // Optional, backend may use address's network
  twoFACode: string; // Required
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: string;
    reference: string;
    amount: number;
    fee: number;
    netAmount: number;
    walletAddress: string;
    network: string;
    status: 'pending' | 'requires_approval' | 'confirmed' | 'failed';
    requiresApproval: boolean;
    fraudScore?: number;
    ledgerEntries?: string[];
    estimatedProcessingTime: string;
  };
}

// Import enhanced transaction types
import type {
  TransactionHistoryResponse,
  TransactionHistoryParams,
} from '@/types/enhanced-transaction';

// Re-export for backward compatibility
export type TransactionFilters = TransactionHistoryParams;

// ============================================
// API SERVICE
// ============================================

export const walletApi = {
  /**
   * Get wallet info (overview)
   * GET /api/v1/wallets/info
   */
  async getWalletInfo(): Promise<{ success: boolean; wallet: UserWallet }> {
    const response = await api.get<{ success: boolean; wallet: UserWallet }>(
      '/wallets/info'
    );

    // Debug logging to check if statistics.totalEarned is in the response
    if (process.env.NODE_ENV === 'development') {
      console.log('[walletApi.getWalletInfo] 📥 Raw API response:', response);
      console.log(
        '[walletApi.getWalletInfo] 📊 Wallet statistics:',
        response?.wallet?.statistics
      );
      console.log('[walletApi.getWalletInfo] 🔍 totalEarned field:', {
        exists: response?.wallet?.statistics?.totalEarned !== undefined,
        value: response?.wallet?.statistics?.totalEarned,
        type: typeof response?.wallet?.statistics?.totalEarned,
      });
    }

    return response;
  },

  /**
   * Get detailed wallet (requires 2FA)
   * GET /api/v1/wallets/my-wallet
   */
  async getWalletDetailed(): Promise<{
    success: boolean;
    wallet: DetailedWallet;
  }> {
    const response = await api.get<{
      success: boolean;
      wallet: DetailedWallet;
    }>('/wallets/my-wallet');
    return response;
  },

  /**
   * Create deposit
   * POST /api/v1/enhanced-transactions/deposit/create
   */
  async createDeposit(amount: number): Promise<DepositResponse> {
    const response = await api.post<DepositResponse>(
      '/enhanced-transactions/deposit/create',
      {
        amount,
      }
    );

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[walletApi] Deposit creation response:', response);
      console.log('[walletApi] Response structure:', {
        success: response?.success,
        hasData: !!response?.data,
        invoiceId: response?.data?.invoiceId,
        paymentUrl: response?.data?.paymentUrl,
        fullResponse: response,
      });
    }

    return response;
  },

  /**
   * Get deposit status
   * GET /api/v1/enhanced-transactions/deposit/status/:invoiceId
   */
  async getDepositStatus(invoiceId: string): Promise<DepositStatus> {
    const response = await api.get<DepositStatus>(
      `/enhanced-transactions/deposit/status/${invoiceId}`
    );
    return response;
  },

  /**
   * Get withdrawal limits and available balance
   * GET /api/v1/enhanced-transactions/withdrawal/limits
   */
  async getWithdrawalLimits(): Promise<WithdrawalLimits> {
    const response = await api.get<WithdrawalLimits>(
      '/enhanced-transactions/withdrawal/limits'
    );
    return response;
  },

  /**
   * Get default withdrawal address
   * GET /api/v1/wallets/withdrawal/default-address
   */
  async getDefaultWithdrawalAddress(): Promise<DefaultWithdrawalAddress> {
    const response = await api.get<DefaultWithdrawalAddress>(
      '/wallets/withdrawal/default-address'
    );
    return response;
  },

  /**
   * Set default withdrawal address (requires 2FA)
   * POST /api/v1/wallets/withdrawal/default-address
   */
  async setDefaultWithdrawalAddress(
    payload: SetDefaultAddressRequest
  ): Promise<DefaultWithdrawalAddress> {
    const response = await api.post<DefaultWithdrawalAddress>(
      '/wallets/withdrawal/default-address',
      payload
    );
    return response;
  },

  /**
   * Create withdrawal request (requires 2FA)
   * POST /api/v1/enhanced-transactions/withdrawal/create
   */
  async createWithdrawal(
    payload: WithdrawalRequest
  ): Promise<WithdrawalResponse> {
    const response = await api.post<WithdrawalResponse>(
      '/enhanced-transactions/withdrawal/create',
      payload
    );
    return response;
  },

  /**
   * Get transaction history
   * GET /api/v1/enhanced-transactions/history
   *
   * Supports all query parameters from the API guide:
   * - page, limit, type, category, status, search
   * - dateFrom, dateTo, amountMin, amountMax
   * - sortBy, sortOrder
   */
  async getTransactionHistory(
    filters: TransactionHistoryParams = {}
  ): Promise<TransactionHistoryResponse> {
    // Build query params, excluding 'all' values and undefined/null
    const queryParams: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        queryParams[key] = String(value);
      }
    });

    try {
      console.log('[walletApi] 🔄 Fetching transaction history...');
      console.log('[walletApi] Filters:', filters);
      console.log('[walletApi] Query params:', queryParams);

      // Make the API call - the api client may unwrap the response
      const response = await api.get<any>('/enhanced-transactions/history', {
        params: queryParams,
      });

      console.log(
        '[walletApi] ✅ Raw response:',
        JSON.stringify(response, null, 2).slice(0, 500)
      );
      console.log(
        '[walletApi] Response keys:',
        response ? Object.keys(response) : 'null'
      );

      // Determine the actual data structure
      let data: TransactionHistoryResponse['data'];

      // Case 1: Response has 'transactions' directly (already unwrapped)
      if (response && 'transactions' in response) {
        console.log(
          '[walletApi] 📦 Case 1: Response has transactions directly'
        );
        data = response;
      }
      // Case 2: Response has 'data' with 'transactions'
      else if (response && response.data && 'transactions' in response.data) {
        console.log('[walletApi] 📦 Case 2: Response has data.transactions');
        data = response.data;
      }
      // Case 3: Response is the full { success, data } structure
      else if (response && response.success && response.data) {
        console.log('[walletApi] 📦 Case 3: Response is { success, data }');
        data = response.data;
      }
      // Fallback: assume response is the data
      else {
        console.log('[walletApi] 📦 Fallback: assuming response is data');
        data = response;
      }

      console.log('[walletApi] ✅ Final data structure:', {
        hasTransactions: !!data?.transactions,
        transactionsCount: data?.transactions?.length || 0,
        hasPagination: !!data?.pagination,
        hasSummary: !!data?.summary,
        hasCategoryBreakdown: !!data?.categoryBreakdown,
      });

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error(
        '[walletApi] ❌ Error fetching transaction history:',
        error
      );
      console.error('[walletApi] Error details:', {
        message: error?.message,
        status: error?.response?.status || error?.statusCode,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
      });
      throw error;
    }
  },
};

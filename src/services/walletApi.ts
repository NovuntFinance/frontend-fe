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
  };
  
  // Metadata
  walletAddress: string | null;
  createdAt: string;
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
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyLimit: number;
    dailyCount: number;
    resetTime: string;
    feePercentage: number;
    feeFixed: number;
    feeCalculation: string;
    availableBalance: number;
    canWithdraw: boolean;
    requiresKYC: boolean;
    requires2FA: boolean;
    supportedNetworks: string[];
  };
}

export interface WithdrawalRequest {
  amount: number; // Min: 20, Max: 10000
  walletAddress: string;
  network?: string; // "BEP20" | "TRC20" | "ERC20"
}

export interface WithdrawalResponse {
  success: boolean;
  message: string;
  data: {
    withdrawalId: string;
    amount: number;
    fee: number;
    netAmount: number;
    walletAddress: string;
    network: string;
    status: 'pending';
    requestedAt: string;
    estimatedProcessingTime: string;
  };
}

export interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'stake' | 'bonus';
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  reference: string;
  txId: string | null;
  fee: number | null;
  netAmount: number | null;
  walletAddress: string | null;
  network: string | null;
  metadata: Record<string, any>;
  timestamp: string;
  processedAt: string | null;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'deposit' | 'withdrawal' | 'transfer' | 'stake' | 'bonus';
  status?: 'pending' | 'confirmed' | 'failed';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================
// API SERVICE
// ============================================

export const walletApi = {
  /**
   * Get wallet info (overview)
   * GET /api/v1/wallets/info
   */
  async getWalletInfo(): Promise<{ success: boolean; wallet: UserWallet }> {
    const response = await api.get<{ success: boolean; wallet: UserWallet }>('/wallets/info');
    return response;
  },

  /**
   * Get detailed wallet (requires 2FA)
   * GET /api/v1/wallets/my-wallet
   */
  async getWalletDetailed(): Promise<{ success: boolean; wallet: DetailedWallet }> {
    const response = await api.get<{ success: boolean; wallet: DetailedWallet }>('/wallets/my-wallet');
    return response;
  },

  /**
   * Create deposit
   * POST /api/v1/enhanced-transactions/deposit/create
   */
  async createDeposit(amount: number): Promise<DepositResponse> {
    const response = await api.post<DepositResponse>('/enhanced-transactions/deposit/create', {
      amount,
    });
    
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
   * Get withdrawal limits
   * GET /api/v1/enhanced-transactions/withdrawal/limits
   */
  async getWithdrawalLimits(): Promise<WithdrawalLimits> {
    const response = await api.get<WithdrawalLimits>('/enhanced-transactions/withdrawal/limits');
    return response;
  },

  /**
   * Create withdrawal request (requires 2FA)
   * POST /api/v1/enhanced-transactions/withdrawal/create
   */
  async createWithdrawal(payload: WithdrawalRequest): Promise<WithdrawalResponse> {
    const response = await api.post<WithdrawalResponse>(
      '/enhanced-transactions/withdrawal/create',
      payload
    );
    return response;
  },

  /**
   * Get transaction history
   * GET /api/v1/enhanced-transactions/history
   */
  async getTransactionHistory(filters: TransactionFilters = {}): Promise<TransactionHistoryResponse> {
    const response = await api.get<TransactionHistoryResponse>(
      '/enhanced-transactions/history',
      {
        params: filters,
      }
    );
    return response;
  },
};


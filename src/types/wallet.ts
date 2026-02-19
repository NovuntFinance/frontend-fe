/**
 * Wallet Types
 * Updated to match Backend TRD: FRONTEND_WALLET_IMPLEMENTATION_PHASE1.md
 */

export type WalletType = 'funded' | 'earnings';
export type WalletStatus = 'active' | 'frozen' | 'closed';

// Legacy types (kept for backward compatibility)
export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  currency: 'USDT';
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  funded: {
    balance: number;
    availableBalance: number;
    lockedBalance: number;
  };
  earnings: {
    balance: number;
    availableBalance: number;
    lockedBalance: number;
  };
  total: number;
  availableForWithdrawal?: number;
  pendingWithdrawals?: number;
  lockedInStakes?: number;
}

// New types matching Backend TRD
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

export interface TransferBetweenWalletsPayload {
  fromWallet: WalletType;
  toWallet: WalletType;
  amount: number;
  description?: string;
}

export interface DepositAddress {
  address: string;
  network: 'BEP20'; // Only BEP20 is supported
  qrCode: string;
  minimumDeposit: number;
  instructions: string[];
}

export interface InitiateDepositPayload {
  amount: number;
  currency?: 'USDT';
}

export interface InitiateDepositResponse {
  depositId: string;
  address: string;
  amount: number;
  currency: 'USDT';
  network: 'BEP20'; // Only BEP20 is supported
  qrCode: string;
  expiresAt: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
}

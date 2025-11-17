/**
 * Withdrawal Types
 */

export type WithdrawalStatus = 
  | 'pending'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type WithdrawalNetwork = 'TRC20' | 'ERC20';

export interface Withdrawal {
  id: string;
  userId: string;
  walletId: string;
  walletType: 'funded' | 'earnings';
  amount: number;
  fee: number;
  netAmount: number;
  currency: 'USDT';
  network: WithdrawalNetwork;
  recipientAddress: string;
  status: WithdrawalStatus;
  txHash?: string;
  rejectionReason?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  estimatedCompletionTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  walletType: 'funded' | 'earnings';
  amount: number;
  network: WithdrawalNetwork;
  recipientAddress: string;
  twoFactorCode?: string;
}

export interface WithdrawalFees {
  network: WithdrawalNetwork;
  feePercentage: number;
  fixedFee: number;
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  estimatedTime: string;
}

export interface WithdrawalTimeline {
  status: WithdrawalStatus;
  message: string;
  timestamp: string;
  actor?: string;
}

export interface WithdrawalDetail extends Withdrawal {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  timeline: WithdrawalTimeline[];
}

export interface WithdrawalStats {
  totalWithdrawals: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  totalWithdrawn: number;
  totalFees: number;
}

// Saved addresses for quick withdrawal
export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  network: WithdrawalNetwork;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

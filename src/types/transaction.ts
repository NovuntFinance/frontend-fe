/**
 * Transaction Types
 */

export type TransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'stake_created'
  | 'stake_roi'
  | 'stake_completed'
  | 'stake_withdrawn_early'
  | 'transfer'
  | 'referral_bonus'
  | 'registration_bonus'
  | 'ranking_bonus'
  | 'pool_distribution';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: 'USDT';
  status: TransactionStatus;
  description: string;
  reference: string;
  walletType?: 'funded' | 'earnings';
  fromWallet?: string;
  toWallet?: string;
  relatedStakeId?: string;
  relatedWithdrawalId?: string;
  relatedReferralId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransactionDetail extends Transaction {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  relatedStake?: {
    id: string;
    amount: number;
    status: string;
  };
  timeline?: TransactionTimeline[];
}

export interface TransactionTimeline {
  status: TransactionStatus;
  message: string;
  timestamp: string;
}

export interface TransactionFilters {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  walletType?: 'funded' | 'earnings';
}

export interface TransactionSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  totalStakeROI: number;
  totalBonuses: number;
  netBalance: number;
  period: '7d' | '30d' | '90d' | 'all';
}

// Transaction type metadata
export const TRANSACTION_CONFIG: Record<TransactionType, {
  label: string;
  color: 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'pink';
  icon: string;
  description: string;
}> = {
  deposit: {
    label: 'Deposit',
    color: 'green',
    icon: 'ArrowDownCircle',
    description: 'Funds added to your wallet',
  },
  withdrawal: {
    label: 'Withdrawal',
    color: 'red',
    icon: 'ArrowUpCircle',
    description: 'Funds withdrawn from your wallet',
  },
  stake_created: {
    label: 'Stake Created',
    color: 'blue',
    icon: 'TrendingUp',
    description: 'New stake created',
  },
  stake_roi: {
    label: 'ROS Earned',
    color: 'green',
    icon: 'DollarSign',
    description: 'Return on stake earned',
  },
  stake_completed: {
    label: 'Stake Completed',
    color: 'purple',
    icon: 'CheckCircle',
    description: 'Stake reached 200% goal',
  },
  stake_withdrawn_early: {
    label: 'Early Withdrawal',
    color: 'amber',
    icon: 'AlertCircle',
    description: 'Stake withdrawn before completion',
  },
  transfer: {
    label: 'Transfer',
    color: 'blue',
    icon: 'ArrowRightLeft',
    description: 'Transfer between wallets',
  },
  referral_bonus: {
    label: 'Referral Bonus',
    color: 'pink',
    icon: 'Gift',
    description: 'Bonus from referral',
  },
  registration_bonus: {
    label: 'Registration Bonus',
    color: 'purple',
    icon: 'Star',
    description: '10% bonus on first stake',
  },
  ranking_bonus: {
    label: 'Ranking Bonus',
    color: 'amber',
    icon: 'Award',
    description: 'Bonus from rank advancement',
  },
  pool_distribution: {
    label: 'Pool Distribution',
    color: 'purple',
    icon: 'Coins',
    description: 'Share of pool profits',
  },
};

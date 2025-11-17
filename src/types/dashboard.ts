/**
 * Dashboard Overview Types
 */

export interface DashboardOverview {
  user: {
    fname: string;
    lname: string;
    rank: string;
    profilePicture?: string;
  };
  wallets: {
    depositWallet: number;
    earningsWallet: number;
    totalBalance: number;
    pendingWithdrawals: number;
    availableForWithdrawal?: number;
    lockedInStakes?: number;
  };
  staking: {
    activeStakes: number;
    totalStaked: number;
    totalEarnings: number;
    projectedEarnings: number;
    nextPayout?: string;
  };
  referrals: {
    totalReferrals: number;
    activeReferrals: number;
    referralEarnings: number;
    referralCode: string;
  };
  rank: {
    current: string;
    nextRank: string;
    progress: number;
    requirements?: {
      personalStake?: { current: number; required: number };
      teamStake?: { current: number; required: number };
      directDownlines?: { current: number; required: number };
    };
  };
}

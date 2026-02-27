/**
 * Stake Types
 */

export type StakeStatus =
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'withdrawn_early';
export type GoalStatus = 'in_progress' | 'achieved' | 'cancelled';

export interface Stake {
  id: string;
  userId: string;
  amount: number;
  currentValue: number;
  targetValue: number; // 200% of amount (2x)
  rosPercentage: number; // Current ROS percentage (0-100%)
  rosEarned: number; // Total ROS earned so far
  dailyROS: number; // Daily ROS rate
  status: StakeStatus;
  startDate: string;
  completionDate?: string;
  estimatedCompletionDate?: string;
  daysElapsed: number;
  isFirstStake: boolean; // For 10% registration bonus
  registrationBonus?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  stakeId: string;
  title: string;
  description?: string;
  targetAmount: number; // 200% of stake amount
  currentAmount: number;
  progress: number; // 0-100%
  status: GoalStatus;
  startDate: string;
  achievedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStakePayload {
  amount: number;
  walletType: 'funded'; // Only deposit wallet can be used for staking (API still uses 'funded')
  goalTitle?: string;
  goalDescription?: string;
}

export interface StakeWithGoal extends Stake {
  goal: Goal;
}

export interface StakeStats {
  totalStakes: number;
  activeStakes: number;
  completedStakes: number;
  totalInvested: number;
  totalROIEarned: number;
  averageROI: number;
  totalValueNow: number;
}

export interface ROIPayoutHistory {
  id: string;
  stakeId: string;
  amount: number;
  percentage: number;
  paidAt: string;
  balanceAfter: number;
}

export interface WithdrawEarlyPayload {
  stakeId: string;
  reason?: string;
}

export interface WithdrawEarlyResponse {
  penaltyAmount: number;
  penaltyPercentage: number;
  amountToReceive: number;
  warning: string;
}

// Motivational quotes based on progress
export const MOTIVATIONAL_QUOTES: Record<string, string[]> = {
  '0-25': [
    'Every journey begins with a single step! 🌱',
    'Great start! Your wealth is growing! 💪',
    'Consistency is the key to success! 🔑',
  ],
  '26-50': [
    "You're halfway there! Keep it up! 🚀",
    'Momentum is building! Stay focused! 🎯',
    'Your dedication is paying off! 💎',
  ],
  '51-75': [
    'Outstanding progress! Almost there! ⭐',
    "You're in the home stretch! 🏃‍♂️",
    'Success is within reach! 🎖️',
  ],
  '76-99': [
    'So close to your goal! Final push! 🔥',
    'Excellence is near! Keep going! 🏆',
    'Victory is just around the corner! 🎊',
  ],
  '100-199': [
    'Goal achieved! Doubling in progress! 🎉',
    "You've made it! Now let's double it! 💰",
    'Excellent work! Watch it grow to 200%! 📈',
  ],
  '200': [
    'CONGRATULATIONS! Goal achieved! 🎊🏆',
    "You've DOUBLED your stake! 🎉💎",
    'INCREDIBLE! 200% Accumulated ROS completed! 🚀✨',
  ],
};

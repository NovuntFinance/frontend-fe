/**
 * Platform Activity Types and Interfaces
 * Used for displaying live platform activities on dashboard
 */

export type PlatformActivityType =
  | 'deposit'
  | 'withdraw'
  | 'stake'
  | 'referral'
  | 'ros'
  | 'rank'
  | 'promotion'
  | 'transfer'
  | 'registration_bonus'
  | 'stake_completion'
  | 'bonus_activation'
  | 'new_signup';

export interface PlatformActivity {
  id: string;
  type: PlatformActivityType;
  user: string; // Anonymized (e.g., "J***n A.")
  action: string; // e.g., "deposited", "staked", "earned ROS"
  amount: number | null; // null for promotions and signups
  timestamp: string; // ISO 8601
  timeAgo: string; // e.g., "5 min ago"
}

export interface PlatformActivityResponse {
  success: boolean;
  data: PlatformActivity[];
  count: number;
}

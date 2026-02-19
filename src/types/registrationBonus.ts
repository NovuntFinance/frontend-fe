/**
 * Registration Bonus Types
 * Complete type definitions for the 5-step registration bonus feature
 *
 * Backend V2 Steps (20% each):
 *   1. Registration    — automatic on email verification
 *   2. 2FA Setup       — user enables Google Authenticator
 *   3. Withdrawal Addr — user adds BEP20 wallet
 *   4. Social Media    — user verifies ALL 5 platforms
 *   5. First Stake     — user stakes >= 20 USDT
 */

// ============================================
// Enums
// ============================================

export enum RegistrationBonusStatus {
  PENDING = 'PENDING',
  REQUIREMENTS_MET = 'REQUIREMENTS_MET',
  BONUS_ACTIVE = 'BONUS_ACTIVE',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SocialMediaPlatform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  TELEGRAM = 'telegram',
}

export type ProfileFieldName =
  | 'dateOfBirth'
  | 'gender'
  | 'profilePhoto'
  | 'address';

// ============================================
// API Response Types
// ============================================

export interface RegistrationBonusStatusResponse {
  success: boolean;
  data?: RegistrationBonusData;
  message?: string;
}

export interface RegistrationBonusData {
  // Status
  status: RegistrationBonusStatus;
  bonusPercentage: number;
  bonusAmount?: number | null;

  // Progress
  progressPercentage: number;
  allRequirementsMet: boolean;

  // Deadline
  deadline?: string;
  daysRemaining: number;

  // Bonus payout info (populated when status is bonus_active / completed)
  bonus?: {
    totalAmount: number;
    paidOut: number;
    remaining: number;
    activatedAt?: string | null;
    completedAt?: string | null;
    // Legacy aliases — kept for backward compat with older backend versions
    amount?: number;
    total?: number;
    remainingBonus?: number;
    bonusPaidOut?: number;
    weeklyPayoutCount?: number;
    payouts?: unknown[];
  };

  // Requirements breakdown (V2 — 5 steps)
  requirements: {
    twoFASetup: {
      isCompleted: boolean;
      completedAt?: string | null;
    };
    withdrawalAddressWhitelist: {
      isCompleted: boolean;
      address?: string | null;
      network?: 'BEP20' | null; // Only BEP20 is supported
      completedAt?: string | null;
    };
    socialMediaVerifications: Array<{
      platform: SocialMediaPlatform | string;
      isVerified: boolean;
      verifiedAt?: string | null;
    }>;
    firstStakeCompleted: boolean;

    // Legacy fields (for backward compat — will be removed eventually)
    profileCompletion?: {
      isCompleted: boolean;
      completionPercentage?: number;
      percentage?: number;
      details?: unknown[];
    };
    socialMediaVerification?: {
      completed: number;
      total: number;
      verifiedCount?: number;
      totalRequired?: number;
      minimumRequired?: number;
      platforms?: unknown[];
      details?: unknown[];
    };
    firstStake?: {
      completed: boolean;
      amount: number | null;
      stakeId: string | null;
    };
  };

  // IDs for cross-referencing
  firstStakeId?: string | null;
  bonusStakeId?: string | null;

  // Computed helpers added by the API service
  timeRemaining?: number;
  currentStep?: number;
  nextStepDescription?: string;

  // Legacy fields (kept for backward compat during migration)
  expiresAt?: string;
  profile?: {
    completionPercentage?: number;
    percentage?: number;
    details?: unknown[];
  };
  profileCompletion?: {
    isCompleted: boolean;
    completionPercentage?: number;
    percentage?: number;
    details?: unknown[];
  };
  socialMedia?: {
    completed: number;
    total: number;
    verifiedCount?: number;
    totalRequired?: number;
    minimumRequired?: number;
    platforms?: unknown[];
    details?: unknown[];
  };
  firstStake?: {
    completed: boolean;
    amount: number | null;
    stakeId: string | null;
  };
}

// ============================================
// Bonus Payout History Types
// ============================================

export interface BonusPayout {
  _id: string;
  userId: string;
  registrationBonusId: string;
  weekNumber: number;
  paidAt: string;
  rosPercentage: number;
  amountPaid: number;
  remainingBalance: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface BonusPayoutHistoryData {
  payouts: BonusPayout[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  totalPaidOut: number;
  totalRemaining: number;
}

export interface BonusPayoutHistoryResponse {
  success: boolean;
  data?: BonusPayoutHistoryData;
  message?: string;
}

export interface SocialMediaVerification {
  platform: SocialMediaPlatform;
  isVerified: boolean;
  verifiedAt: string | null;
  accountHandle: string | null;
}

export interface ProfileCompletionField {
  fieldName: ProfileFieldName;
  isCompleted: boolean;
  completedAt: string | null;
  value?: string;
}

export interface ProcessStakeRequest {
  stakeId: string;
  stakeAmount: number;
}

export interface ProcessStakeResponse {
  success: boolean;
  message: string;
  bonusAmount?: number;
  bonusActivated?: boolean;
  progressPercentage?: number;
}

// ============================================
// Component Props Types
// ============================================

export interface RegistrationBonusBannerProps {
  bonusData: RegistrationBonusData;
  onRefresh: () => void;
  onDismiss?: () => void;
}

export interface ProgressStepperProps {
  currentStep: number;
  progressPercentage: number;
  steps: Step[];
}

export interface Step {
  number: number;
  title: string;
  description: string;
  completed: boolean;
  icon?: React.ReactNode;
}

export interface CountdownTimerProps {
  deadline: string;
  timeRemaining: number;
  onExpire?: () => void;
}

export interface RequirementCardProps {
  title: string;
  description: string;
  completed: boolean;
  completionPercentage?: number;
  items?: RequirementItem[];
  onAction?: () => void;
}

export interface RequirementItem {
  label: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface SocialMediaRequirementProps {
  socialData: {
    completed: number;
    total: number;
    minimumRequired: number;
    details: SocialMediaVerification[];
  };
  onComplete: () => void;
}

export interface ProfileRequirementProps {
  profileData: {
    completionPercentage: number;
    details: ProfileCompletionField[];
  };
  onComplete: () => void;
}

export interface StakeRequirementProps {
  stakeData: {
    completed: boolean;
    amount: number | null;
    stakeId: string | null;
  };
  onComplete: () => void;
}

export interface TwoFARequirementProps {
  twoFAData: {
    isCompleted: boolean;
    completedAt?: string | null;
  };
  onComplete: () => void;
}

export interface WithdrawalAddressRequirementProps {
  addressData: {
    isCompleted: boolean;
    address?: string | null;
    network?: 'BEP20' | 'TRC20' | null;
    completedAt?: string | null;
  };
  onComplete: () => void;
}

// ============================================
// Component Props
// ============================================

export interface BonusActivatedCardProps {
  bonusData: RegistrationBonusData;
}

export interface BonusExpiredCardProps {
  bonusData: RegistrationBonusData;
}

export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

// ============================================
// Platform Configuration
// ============================================

// Platform configuration is now in @/config/socialMediaIcons.ts
// Import PLATFORM_CONFIG from '@/config/socialMediaIcons' instead

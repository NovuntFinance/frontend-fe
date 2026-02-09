/**
 * Registration Bonus Types
 * Complete type definitions for registration bonus feature
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
  // Status Information
  status: RegistrationBonusStatus;
  bonusPercentage: number; // e.g., 10

  // Progress Tracking
  progressPercentage: number; // 0, 20, 40, 60, 80, 100
  daysRemaining: number; // 7-day countdown

  // Requirements Breakdown (V2 - Matching Backend Structure)
  requirements: {
    twoFASetup: {
      isCompleted: boolean;
      completedAt: string | null;
    };
    withdrawalAddressWhitelist: {
      isCompleted: boolean;
      address: string | null;
      network: 'BEP20' | null;
    };
    socialMediaVerifications: Array<{
      platform: SocialMediaPlatform | string;
      isVerified: boolean;
    }>;
    firstStakeCompleted: boolean;
    // Legacy/alias names used by components
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

  // Metadata
  allRequirementsMet: boolean;

  // Legacy fields (for backward compatibility during migration)
  deadline?: string;
  timeRemaining?: number;
  currentStep?: number;
  nextStepDescription?: string;
  expiresAt?: string;
  bonusAmount?: number | null;
  bonus?: {
    amount?: number;
    total?: number;
    remaining?: number;
    remainingBonus?: number;
    bonusPaidOut?: number;
    weeklyPayoutCount?: number;
    completedAt?: string;
    payouts?: unknown[];
  };
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
// Bonus Payout History Types (NEW)
// ============================================

export interface BonusPayoutHistoryResponse {
  success: boolean;
  data?: BonusPayoutHistoryData;
  message?: string;
}

export interface BonusPayoutHistoryData {
  bonusAmount: number; // Total bonus earned
  totalPaidOut: number; // Total paid so far
  remainingBonus: number; // Remaining to be paid
  payouts: BonusPayout[]; // Individual payout records
}

export interface BonusPayout {
  week: number; // Week number since activation
  date: string; // ISO 8601 date of payout
  roiPercentage: number; // Declared ROI % for that week
  amount: number; // Bonus amount paid that week
  remainingAfter: number; // Remaining bonus after this payout
}

export interface SocialMediaVerification {
  platform: SocialMediaPlatform;
  isVerified: boolean;
  verifiedAt: string | null; // ISO 8601 date or null
  accountHandle: string | null;
}

export interface ProfileCompletionField {
  fieldName: ProfileFieldName;
  isCompleted: boolean;
  completedAt: string | null; // ISO 8601 date or null
  value?: string; // Optional field value
}

export interface ProcessStakeRequest {
  stakeId: string;
  stakeAmount: number;
}

export interface ProcessStakeResponse {
  success: boolean;
  message: string;
  bonusAmount?: number;
  bonusActivated?: boolean; // True when all requirements met and bonus is activated (100% progress)
  progressPercentage?: number; // Updated progress after processing stake
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

// ============================================
// Bonus Payout History Types (NEW)
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
// This allows runtime imports of React components
// Import PLATFORM_CONFIG from '@/config/socialMediaIcons' instead

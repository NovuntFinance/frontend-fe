/**
 * Registration Bonus Types
 * Complete type definitions for registration bonus feature
 */

// ============================================
// Enums
// ============================================

export enum RegistrationBonusStatus {
  PENDING = 'pending',
  REQUIREMENTS_MET = 'requirements_met',
  BONUS_ACTIVE = 'bonus_active',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
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
  bonusPercentage: number;        // e.g., 10
  
  // Bonus Credit Tracking (NEW - for gradual payout mechanism)
  bonus?: {
    bonusAmount: number;          // Total bonus earned (e.g., 1000 for 10% of $10k stake)
    bonusPaidOut: number;         // Amount already paid via weekly ROS (e.g., 350)
    remainingBonus: number;       // Amount still to be paid (e.g., 650)
    payoutPercentage: number;     // Percentage paid out (e.g., 35)
    activatedAt: string;          // ISO 8601 date when bonus was activated
    completedAt?: string | null;  // ISO 8601 date when fully paid out
    weeklyPayoutCount?: number;   // Number of payouts made
    lastPayoutDate?: string | null;  // Last payout date
    nextPayoutDate?: string | null;  // Next expected payout date
  } | null;                        // null if not yet activated
  
  // DEPRECATED: bonusAmount at root level (kept for backward compatibility)
  bonusAmount?: number | null;    // Use bonus.bonusAmount instead
  
  // Timeline (new API structure)
  daysRemaining: number;          // Days remaining until expiration
  expiresAt: string;              // ISO 8601 date string
  
  // Progress Tracking (calculated from requirements)
  progressPercentage?: number;    // 0, 25, 50, 75, 100 (calculated: 25% per requirement met)
  
  // First Stake Information (NEW)
  firstStake?: {
    stakeId: string;              // ID of the first stake
    amount: number;               // Amount staked (e.g., 10000)
    createdAt: string;            // ISO 8601 date
  } | null;
  
  // Requirements Breakdown (new API structure)
  requirements: {
    // Profile Completion Requirements
    profileCompletion: {
      completed: boolean;
      percentage: number;          // 0-100
    };
    
    // Social Media Verification Requirements
    socialMediaVerification: {
      completed: boolean;
      verifiedCount: number;       // Number of verified platforms
      totalRequired: number;       // Total platforms required (5)
      platforms?: string[];        // Array of verified platform names
    };
    
    // First Stake Requirement
    firstStake: {
      completed: boolean;
      stakeId: string | null;      // First stake ID
    };
  };
  
  // Overall status
  allRequirementsMet: boolean;
  
  // Legacy fields (for backward compatibility with existing components)
  deadline?: string;              // ISO 8601 date string (same as expiresAt)
  timeRemaining?: number;         // Milliseconds remaining (calculated from daysRemaining)
  currentStep?: number;           // 1, 2, 3, 4 (calculated from progress)
  nextStepDescription?: string;   // Human-readable CTA (calculated)
  
  // Legacy nested structure (for backward compatibility)
  socialMedia?: {
    completed: number;
    total: number;
    minimumRequired: number;
    details: SocialMediaVerification[];
  };
  
  profile?: {
    completionPercentage: number;
    details: ProfileCompletionField[];
  };
  
  // DEPRECATED: Use requirements.firstStake and firstStake at root instead
  firstStakeOld?: {
    completed: boolean;
    amount: number | null;
    stakeId: string | null;
  };
  
  // Fraud Analysis (may not be in new API, kept for compatibility)
  fraudAnalysis?: {
    suspicionScore: number;
    isApproved: boolean;
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
  bonusAmount: number;            // Total bonus earned
  totalPaidOut: number;           // Total paid so far
  remainingBonus: number;         // Remaining to be paid
  payouts: BonusPayout[];         // Individual payout records
}

export interface BonusPayout {
  week: number;                   // Week number since activation
  date: string;                   // ISO 8601 date of payout
  roiPercentage: number;          // Declared ROI % for that week
  amount: number;                 // Bonus amount paid that week
  remainingAfter: number;         // Remaining bonus after this payout
}

export interface SocialMediaVerification {
  platform: SocialMediaPlatform;
  isVerified: boolean;
  verifiedAt: string | null;      // ISO 8601 date or null
  accountHandle: string | null;
}

export interface ProfileCompletionField {
  fieldName: ProfileFieldName;
  isCompleted: boolean;
  completedAt: string | null;      // ISO 8601 date or null
  value?: string;                  // Optional field value
}

export interface ProcessStakeRequest {
  stakeId: string;
  stakeAmount: number;
}

export interface ProcessStakeResponse {
  success: boolean;
  message: string;
  bonusAmount?: number;
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


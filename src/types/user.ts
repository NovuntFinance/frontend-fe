/**
 * User Types - Aligned with Novunt API BetterAuth
 */

export type UserRole = 'user' | 'admin' | 'superAdmin';
export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification';
export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';
export type Rank =
  | 'Stakeholder'
  | 'Investor'
  | 'Wealth Builder'
  | 'Finance Pro'
  | 'Money Master'
  | 'Finance Titan';

export interface User {
  _id: string;
  id?: string; // Computed property for compatibility
  email: string;
  username: string;
  fname: string; // First name (API uses fname)
  lname: string; // Last name (API uses lname)
  firstName?: string; // Computed property for compatibility
  lastName?: string; // Computed property for compatibility
  fullName?: string; // Computed property
  phoneNumber?: string;
  countryCode?: string;
  avatar?: string;
  role: UserRole;
  status?: UserStatus;
  rank: Rank;
  kycStatus?: KYCStatus;
  emailVerified: boolean;
  phoneVerified?: boolean;
  twoFAEnabled?: boolean; // API uses twoFAEnabled
  twoFactorEnabled?: boolean; // Computed property for compatibility
  referralCode: string;
  referredBy?: string;
  totalInvested?: number;
  totalEarned?: number;
  activeStakes?: number;
  totalReferrals?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  wallets: {
    funded: {
      id: string;
      balance: number;
    };
    earnings: {
      id: string;
      balance: number;
    };
  };
  statistics: {
    totalDeposits: number;
    totalWithdrawals: number;
    totalStakeROI: number;
    totalReferralEarnings: number;
    totalBonuses: number;
  };
}

// UpdateProfilePayload - Only includes fields supported by backend
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatar?: string;
  // Note: address, city, country not yet supported by backend
  // TODO: Add these fields when backend User schema is updated
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill';
  documentNumber?: string;
  frontImage: string;
  backImage?: string;
  selfieImage?: string;
  status: KYCStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  ipAddress: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

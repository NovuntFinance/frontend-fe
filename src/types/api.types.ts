/**
 * API Response TypeScript Types
 * Comprehensive type definitions for all API responses
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    statusCode?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
    id: string;
    email: string;
    username: string;
    fname: string;
    lname: string;
    phoneNumber: string;
    countryCode: string;
    referralCode: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface RegisterResponse {
    user: User;
    tokens: AuthTokens;
    message: string;
}

// ============================================================================
// Wallet Types
// ============================================================================

export interface WalletBalance {
    totalBalance: number;
    fundedWalletBalance: number;
    earningWalletBalance: number;
    canStake: boolean;
    canWithdraw: boolean;
    canTransfer: boolean;
}

export interface WalletStatistics {
    totalDeposited: number;
    totalWithdrawn: number;
    totalStaked: number;
    totalEarned: number;
}

export interface WalletDashboard extends WalletBalance {
    statistics: WalletStatistics;
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'stake' | 'unstake' | 'reward';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    description: string;
    reference?: string;
    createdAt: string;
    updatedAt: string;
}

export type TransactionsResponse = PaginatedResponse<Transaction>;

// ============================================================================
// Staking Types
// ============================================================================

export interface StakePlan {
    id: string;
    name: string;
    duration: number; // days
    interestRate: number; // percentage
    minAmount: number;
    maxAmount: number;
    isActive: boolean;
}

export interface Stake {
    id: string;
    planId: string;
    plan: StakePlan;
    amount: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'cancelled';
    earnedInterest: number;
    source: 'earning_wallet' | 'funded_wallet';
    canCancel: boolean;
    remainingDays: number;
    createdAt: string;
    updatedAt: string;
}

export interface StakeDashboard {
    totalStaked: number;
    activeStakes: number;
    totalEarnings: number;
    projectedEarnings: number;
    stakes: Stake[];
}

export interface CreateStakeRequest {
    planId: string;
    amount: number;
    source: 'earning_wallet' | 'funded_wallet';
}

export interface CreateStakeResponse {
    stake: Stake;
    message: string;
}

// ============================================================================
// Registration Bonus Types
// ============================================================================

export interface BonusTask {
    id: number;
    name: string;
    description: string;
    reward: number;
    completed: boolean;
    completedAt?: string;
}

export interface RegistrationBonus {
    totalTasks: number;
    completedTasks: number;
    progress: number; // percentage
    availableBonus: number;
    tasks: BonusTask[];
}

export interface BonusHistory {
    id: string;
    type: 'registration' | 'referral' | 'task' | 'promotion';
    amount: number;
    description: string;
    awardedAt: string;
}

export type BonusHistoryResponse = PaginatedResponse<BonusHistory>;

// ============================================================================
// Referral Types
// ============================================================================

export interface Referral {
    id: string;
    referredUserId: string;
    referredUser: {
        username: string;
        email: string;
        joinedAt: string;
    };
    status: 'pending' | 'active' | 'rewarded';
    bonusEarned: number;
    createdAt: string;
}

export interface ReferralStats {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
    referralCode: string;
    referrals: Referral[];
}

export interface ReferralTree {
    user: User;
    level: number;
    children: ReferralTree[];
    earnings: number;
}

// ============================================================================
// Deposit & Withdrawal Types
// ============================================================================

export interface DepositMethod {
    id: string;
    name: string;
    type: 'bank_transfer' | 'card' | 'crypto';
    minAmount: number;
    maxAmount: number;
    fee: number; // percentage
    processingTime: string;
    isActive: boolean;
}

export interface InitiateDepositRequest {
    amount: number;
    methodId: string;
}

export interface InitiateDepositResponse {
    transactionId: string;
    paymentUrl?: string;
    reference: string;
    instructions?: string;
}

export interface WithdrawalRequest {
    amount: number;
    destinationType: 'bank' | 'crypto';
    destination: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
        walletAddress?: string;
        network?: string;
    };
}

export interface WithdrawalResponse {
    transactionId: string;
    reference: string;
    estimatedProcessingTime: string;
}

// ============================================================================
// Notifications Types
// ============================================================================

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export type NotificationsResponse = PaginatedResponse<Notification>;

// ============================================================================
// Profile Types
// ============================================================================

export interface UserProfile extends User {
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    kyc?: {
        status: 'not_started' | 'pending' | 'approved' | 'rejected';
        submittedAt?: string;
        approvedAt?: string;
    };
}

export interface UpdateProfileRequest {
    fname?: string;
    lname?: string;
    phoneNumber?: string;
    avatar?: string;
    bio?: string;
    dateOfBirth?: string;
    address?: UserProfile['address'];
}

// ============================================================================
// Dashboard Stats Types
// ============================================================================

export interface DashboardStats {
    totalBalance: number;
    totalEarned: number;
    activeStakes: number;
    pendingWithdrawals: number;
    recentTransactions: Transaction[];
    recentNotifications: Notification[];
}

// ============================================================================
// Rank & Achievement Types
// ============================================================================

export interface Rank {
    id: string;
    name: string;
    level: number;
    minStakeAmount: number;
    benefits: string[];
    icon?: string;
}

export interface UserRank {
    currentRank: Rank;
    nextRank?: Rank;
    progress: number; // percentage to next rank
    currentStake: number;
    requiredStake: number;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(response: unknown): response is ApiError {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false
    );
}

export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
    return (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === true &&
        'data' in response
    );
}

/**
 * TypeScript Types for Novunt Authentication API
 *
 * Based on: FRONTEND_HANDOFF_PACKAGE.md and frontend-auth-types.ts
 * Backend API: https://api.novunt.com/api/v1/better-auth
 *
 * All authentication-related type definitions for the Novunt platform
 */

// ============================================================================
// REQUEST TYPES
// ============================================================================

// BetterAuth Registration Request - uses firstName/lastName
export interface RegisterRequest {
  firstName: string; // ✅ Changed from fname to firstName
  lastName: string; // ✅ Changed from lname to lastName
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string; // ✅ REQUIRED (was optional before)
  countryCode: string; // ✅ REQUIRED (was optional before)
  referralCode?: string; // ✅ Optional (only optional field)
}

export interface LoginRequest {
  email?: string; // Can use email OR username
  username?: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  // Used for resending verification code
}

export interface CompleteRegistrationRequest {
  email: string;
  verificationCode: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Phase 1 2FA verification - uses userID instead of mfaToken
export interface Verify2FARequest {
  userID: string;
  token: string; // 6-digit TOTP code
}

// Backend uses authenticated user from token, no email needed
export interface Generate2FASecretRequest {
  // Empty - user ID is extracted from Authorization token
}

export interface Enable2FARequest {
  verificationToken: string; // Token from /mfa/setup response
  verificationCode: string; // 6-digit TOTP code from authenticator app
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

// Phase 1 password reset uses OTP code, not token
export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Backend User Model
 * IMPORTANT: Backend uses `fname` and `lname` internally
 * Frontend should map these to `firstName` and `lastName` for display
 */
export interface BackendUser {
  _id: string;
  email: string;
  username: string;
  fname: string; // Backend field name
  lname: string; // Backend field name
  phoneNumber?: string;
  countryCode?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'superAdmin';
  twoFAEnabled?: boolean;
  referralCode?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Frontend User Model
 * Normalized version with firstName/lastName for consistency
 */
export interface User extends Omit<BackendUser, 'fname' | 'lname'> {
  firstName: string;
  lastName: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  statusCode?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
}

// Phase 1 Registration Response
export interface RegisterResponse {
  message: string;
  nextStep: string; // "/verify-email"
}

export interface LoginResponse {
  message: string;
  token: string;
  user: BackendUser;
}

export interface MFARequiredResponse {
  message: string;
  mfaRequired: true;
  mfaToken: string;
  user: {
    _id: string;
    email: string;
  };
}

export interface VerifyEmailResponse {
  message: string; // "New verification code sent to your email."
}

// Phase 1 Complete Registration Response
// Updated: Backend now requires login after registration (no auto-login)
export interface CompleteRegistrationResponse {
  success: boolean;
  message: string;
  // Note: Token is NOT included - user must login manually
  user: {
    fname: string;
    lname: string;
    email: string;
    username: string;
    emailVerified: boolean;
    referralCode: string;
    referralLink?: string;
  };
  nextStep: string; // "/login" (changed from "/dashboard")
  requiresLogin: boolean; // Always true - user must login after verification
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// 2FA Setup Response - Actual backend structure
export interface Generate2FASecretResponse {
  message: string;
  setupDetails: {
    qrCode: string; // Base64 data URL: data:image/png;base64,...
    secret: string; // Base32 secret: JBSWY3DPEHPK3PXP
  };
  verificationToken: string; // Token to use when verifying the setup
}

export interface Enable2FAResponse {
  message: string; // "MFA setup completed successfully"
  backupCodes?: string[]; // Optional backup codes from backend
}

export interface ReferralInfoResponse {
  success: boolean;
  data: {
    referralCode: string;
    referralLink: string;
    totalReferrals?: number;
    totalEarnings?: number;
  };
}

// ============================================================================
// ERROR CODES - Aligned with Backend
// ============================================================================

export enum AuthErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Registration Errors
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USERNAME_EXISTS = 'USERNAME_EXISTS',
  INVALID_REFERRAL_CODE = 'INVALID_REFERRAL_CODE',

  // Verification Errors
  INVALID_CODE = 'INVALID_CODE',
  CODE_EXPIRED = 'CODE_EXPIRED',

  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // User Status Errors
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // MFA Errors
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_VERIFICATION_FAILED = 'MFA_VERIFICATION_FAILED',

  // Token Errors
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Password Errors
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  CURRENT_PASSWORD_INCORRECT = 'CURRENT_PASSWORD_INCORRECT',

  // Server Errors
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR',
}

// ============================================================================
// AUTH STATE MANAGEMENT
// ============================================================================

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiError | null;
}

export interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export interface AuthStore extends AuthState, AuthActions {
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
  isVerified: () => boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number; // Issued at
  exp: number; // Expiration
  mfaCompleted?: boolean;
}

export interface AuthHeaders {
  Authorization: string;
  'Content-Type': string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Password Requirements (from backend specification)
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 digit (0-9)
 * - At least 1 special character (@, _, $, !, %, *, ?, &)
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&])[A-Za-z\d@_$!%*?&]{8,}$/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VERIFICATION_CODE_REGEX = /^[0-9]{6}$/;

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '@_$!%*?&',
  regex: PASSWORD_REGEX,
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** LocalStorage keys for token management */
export const TOKEN_STORAGE_KEY = 'authToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
export const USER_STORAGE_KEY = 'user';

/** Token expiration times (in seconds) */
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 24 * 60 * 60, // 24 hours
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
};

/** Rate limiting configuration (from backend) */
export const RATE_LIMITS = {
  REGISTRATION: { window: 3600, maxAttempts: 3 }, // 1 hour, 3 attempts
  LOGIN: { window: 900, maxAttempts: 5 }, // 15 minutes, 5 attempts
  PASSWORD_RESET: { window: 3600, maxAttempts: 3 }, // 1 hour, 3 attempts
  VERIFICATION_RESEND: { window: 60, maxAttempts: 1 }, // 60 seconds, 1 attempt
};

/** Account lockout configuration (from backend) */
export const ACCOUNT_LOCKOUT = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60, // 15 minutes in seconds
};

/** Verification code configuration */
export const VERIFICATION = {
  CODE_LENGTH: 6,
  CODE_EXPIRY: 60 * 60, // 1 hour in seconds
  RESEND_COOLDOWN: 60, // 60 seconds
};

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES: Record<string, string> = {
  // Validation
  VALIDATION_ERROR: 'Please check your input and try again',

  // Registration
  EMAIL_EXISTS: 'This email is already registered. Try logging in instead.',
  USERNAME_EXISTS: 'This username is already taken. Please choose another.',
  INVALID_REFERRAL_CODE: 'Invalid referral code. Please check and try again.',

  // Verification
  INVALID_CODE: 'Invalid or expired verification code',
  CODE_EXPIRED: 'Verification code has expired. Please request a new one.',

  // Authentication
  INVALID_CREDENTIALS:
    'Invalid email or password. Please check your credentials and try again.',
  EMAIL_NOT_VERIFIED:
    'Please verify your email before logging in. Check your inbox!',
  AUTH_REQUIRED: 'Please log in to continue',
  INVALID_TOKEN: 'Your session has expired. Please log in again.',

  // User Status
  USER_NOT_FOUND:
    'No account found with this email address. Please check your email or sign up.',
  ACCOUNT_INACTIVE:
    'Your account has been deactivated. Please contact support.',
  ACCOUNT_LOCKED:
    'Account locked due to too many failed attempts. Try again in 15 minutes.',

  // MFA
  MFA_REQUIRED: 'Two-factor authentication is required',
  MFA_VERIFICATION_FAILED: 'Invalid MFA code. Please try again.',

  // Tokens
  TOKEN_REFRESH_FAILED: 'Session expired. Please log in again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',

  // Password
  PASSWORD_RESET_FAILED: 'Failed to reset password. Please try again.',
  PASSWORD_CHANGE_FAILED:
    'Failed to change password. Please verify your current password.',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',

  // Server
  SERVER_ERROR: 'Server error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  CORS_ERROR: 'Unable to connect to the server. Please contact support.',
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Helper function to normalize backend user to frontend user
 * Converts fname/lname to firstName/lastName
 */
export const normalizeUser = (backendUser: BackendUser): User => ({
  ...backendUser,
  firstName: backendUser.fname,
  lastName: backendUser.lname,
});

/**
 * Helper function to convert frontend user to backend format
 */
export const toBackendUser = (user: User): BackendUser => ({
  ...user,
  fname: user.firstName,
  lname: user.lastName,
});

/**
 * Type guard to check if response has MFA required
 */
export const isMFARequired = (
  response: LoginResponse | MFARequiredResponse
): response is MFARequiredResponse => {
  return 'mfaRequired' in response && response.mfaRequired === true;
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: User | BackendUser): string => {
  const u = user as User & BackendUser;

  if ('firstName' in user && 'lastName' in user) {
    return `${u.firstName} ${u.lastName}`;
  }
  if ('fname' in user && 'lname' in user) {
    return `${u.fname} ${u.lname}`;
  }
  return u.username || u.email;
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User | BackendUser): string => {
  const u = user as User & BackendUser;

  if ('firstName' in user && 'lastName' in user) {
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }
  if ('fname' in user && 'lname' in user) {
    return `${u.fname[0]}${u.lname[0]}`.toUpperCase();
  }
  return u.username[0]?.toUpperCase() || '';
};

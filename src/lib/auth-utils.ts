/**
 * Authentication Utilities
 * Helper functions for authentication operations
 *
 * Based on: FRONTEND_IMPLEMENTATION_EXAMPLES.md
 */

import {
  PASSWORD_REGEX,
  EMAIL_REGEX,
  VERIFICATION_CODE_REGEX,
  BackendUser,
  User,
  TokenPayload,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '@/types/auth';

// ============================================================================
// USER NORMALIZATION
// ============================================================================

/**
 * Normalize backend user to frontend format
 * Converts fname/lname to firstName/lastName
 * Maps profilePicture to avatar
 */
export const normalizeUser = (backendUser: BackendUser): User => {
  // Backend may return profilePicture, frontend uses avatar
  const backendUserWithAvatar = backendUser as BackendUser & {
    profilePicture?: string;
    avatar?: string;
    rank?: string;
  };
  const avatar =
    backendUserWithAvatar.profilePicture || backendUserWithAvatar.avatar;

  return {
    _id: backendUser._id,
    email: backendUser.email,
    username: backendUser.username,
    firstName: backendUser.fname,
    lastName: backendUser.lname,
    phoneNumber: backendUser.phoneNumber,
    countryCode: backendUser.countryCode,
    ...(avatar ? { avatar } : {}),
    emailVerified: backendUser.emailVerified,
    role: backendUser.role,
    twoFAEnabled: backendUser.twoFAEnabled,
    referralCode: backendUser.referralCode,
    isActive: backendUser.isActive,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    rank: backendUserWithAvatar.rank || 'Stakeholder',
    fname: backendUser.fname,
    lname: backendUser.lname,
    id: backendUser._id,
    fullName: `${backendUser.fname} ${backendUser.lname}`.trim(),
    twoFactorEnabled: backendUser.twoFAEnabled,
  } as User;
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user: User | BackendUser): string => {
  if (
    'firstName' in user &&
    'lastName' in user &&
    user.firstName &&
    user.lastName
  ) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
  if ('fname' in user && 'lname' in user && user.fname && user.lname) {
    return `${user.fname} ${user.lname}`.trim();
  }
  // TypeScript needs help understanding user still has username/email
  const anyUser = user as User & BackendUser;
  return anyUser.username || anyUser.email;
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (user: User | BackendUser): string => {
  if (
    'firstName' in user &&
    'lastName' in user &&
    user.firstName &&
    user.lastName
  ) {
    const first = user.firstName[0] || '';
    const last = user.lastName[0] || '';
    return `${first}${last}`.toUpperCase();
  }
  if ('fname' in user && 'lname' in user && user.fname && user.lname) {
    const first = user.fname[0] || '';
    const last = user.lname[0] || '';
    return `${first}${last}`.toUpperCase();
  }
  // TypeScript needs help understanding user still has username/email
  const anyUser = user as User & BackendUser;
  return (
    anyUser.username?.[0]?.toUpperCase() ||
    anyUser.email?.[0]?.toUpperCase() ||
    '?'
  );
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export const validateEmail = (
  email: string
): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 * Requirements from backend:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (@_$!%*?&)
 */
export const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  // Trim whitespace for validation (but note: passwords with leading/trailing spaces are usually invalid)
  const trimmedPassword = password?.trim();

  if (!password || !trimmedPassword) {
    return { valid: false, message: 'Password is required' };
  }

  // Check for leading/trailing spaces (common user mistake)
  if (password !== trimmedPassword) {
    return {
      valid: false,
      message: 'Password cannot have leading or trailing spaces',
    };
  }

  if (trimmedPassword.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[a-z]/.test(trimmedPassword)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[A-Z]/.test(trimmedPassword)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/\d/.test(trimmedPassword)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  // Phase 1: Accept any special character (not restricted to @_$!%*?&)
  // Special characters include: !@#$%^&*()_+-=[]{}|;:,.<>?/~`
  if (!/[^A-Za-z0-9]/.test(trimmedPassword)) {
    return {
      valid: false,
      message:
        'Password must contain at least one special character (e.g., !@#$%^&*)',
    };
  }

  // All checks passed
  return { valid: true };
};

/**
 * Get password strength (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 */
export const getPasswordStrength = (
  password: string
): {
  strength: number;
  label: string;
  color: string;
} => {
  if (!password) {
    return { strength: 0, label: 'Very Weak', color: 'red' };
  }

  let strength = 0;

  // Length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character types
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@_$!%*?&]/.test(password)) strength++;

  // Cap at 4
  strength = Math.min(strength, 4);

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['red', 'orange', 'yellow', 'blue', 'green'];

  return {
    strength,
    label: labels[strength],
    color: colors[strength],
  };
};

/**
 * Validate 6-digit verification code
 */
export const validateVerificationCode = (
  code: string
): { valid: boolean; message?: string } => {
  if (!code) {
    return { valid: false, message: 'Verification code is required' };
  }

  if (!VERIFICATION_CODE_REGEX.test(code)) {
    return { valid: false, message: 'Verification code must be 6 digits' };
  }

  return { valid: true };
};

/**
 * Validate username
 */
export const validateUsername = (
  username: string
): { valid: boolean; message?: string } => {
  if (!username) {
    return { valid: false, message: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return {
      valid: false,
      message: 'Username must be less than 20 characters',
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      message: 'Username can only contain letters, numbers, and underscores',
    };
  }

  return { valid: true };
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get stored authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

/**
 * Store authentication tokens
 */
export const storeTokens = (token: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

/**
 * Clear authentication tokens
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

/**
 * Decode JWT token (without verification)
 * Note: This only decodes the payload, does NOT verify the signature
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload as TokenPayload;
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};

/**
 * Check if user is authenticated
 * Checks for token existence and validity
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;

  return !isTokenExpired(token);
};

/**
 * Get stored user data
 */
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;

    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
};

/**
 * Store user data
 */
export const storeUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode?: string
): string => {
  if (!phoneNumber) return '';

  if (countryCode) {
    return `${countryCode} ${phoneNumber}`;
  }

  return phoneNumber;
};

/**
 * Mask email for privacy
 * Example: john.doe@example.com -> j***e@example.com
 */
export const maskEmail = (email: string): string => {
  if (!email) return '';

  const [local, domain] = email.split('@');
  if (!domain) return email;

  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }

  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// ============================================================================
// ROLE & PERMISSION UTILITIES
// ============================================================================

/**
 * Check if user has specific role
 */
export const hasRole = (
  user: User | BackendUser | null,
  role: string | string[]
): boolean => {
  if (!user) return false;

  const userRole = user.role.toLowerCase();

  if (Array.isArray(role)) {
    return role.some((r) => r.toLowerCase() === userRole);
  }

  return role.toLowerCase() === userRole;
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: User | BackendUser | null): boolean => {
  return hasRole(user, ['admin', 'superAdmin', 'superadmin']);
};

/**
 * Check if user email is verified
 */
export const isEmailVerified = (user: User | BackendUser | null): boolean => {
  return user?.emailVerified === true;
};

/**
 * Check if user has MFA enabled
 */
export const hasMFAEnabled = (user: User | BackendUser | null): boolean => {
  return user?.twoFAEnabled === true;
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Check if error is network/CORS related
 */
export const isNetworkError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; statusCode?: number };
    return (
      err.code === 'NETWORK_ERROR' ||
      err.code === 'CORS_ERROR' ||
      err.code === 'ERR_NETWORK' ||
      err.statusCode === 0
    );
  }
  return false;
};

/**
 * Check if error requires re-authentication
 */
export const requiresReauth = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; statusCode?: number };
    return (
      err.code === 'AUTH_REQUIRED' ||
      err.code === 'INVALID_TOKEN' ||
      err.code === 'TOKEN_EXPIRED' ||
      err.statusCode === 401
    );
  }
  return false;
};

// ============================================================================
// DEBUGGING UTILITIES (Development Only)
// ============================================================================

/**
 * Log authentication state (development only)
 */
export const logAuthState = (): void => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🔐 Auth State');
  console.log('Token:', getAuthToken() ? '✅ Present' : '❌ Missing');
  console.log(
    'Refresh Token:',
    getRefreshToken() ? '✅ Present' : '❌ Missing'
  );
  console.log('User:', getStoredUser());
  console.log('Authenticated:', isAuthenticated());

  const token = getAuthToken();
  if (token) {
    const payload = decodeToken(token);
    if (payload) {
      const expiresIn = payload.exp * 1000 - Date.now();
      console.log(
        'Token expires in:',
        Math.floor(expiresIn / 1000 / 60),
        'minutes'
      );
    }
  }

  console.groupEnd();
};

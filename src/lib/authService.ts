/**
 * Authentication Service - BetterAuth Implementation
 * Handles all authentication-related API calls
 *
 * Backend API: /api/v1/better-auth
 * Based on: AUTHENTICATION_COMPLETE_OVERVIEW.md
 *
 * BetterAuth Authentication Endpoints:
 * 1. POST /better-auth/register - Initiate registration (creates temp user)
 * 2. POST /better-auth/verify-email - Verify email with code
 * 3. POST /better-auth/resend-verification - Resend verification code
 * 4. POST /better-auth/complete-registration - Complete registration with verification code
 * 5. POST /better-auth/login - Authenticate user (returns token or mfaRequired)
 * 6. POST /better-auth/verify-mfa - Verify MFA code during login
 * 7. POST /better-auth/mfa/setup - Setup MFA (generate secret/QR code) [Protected]
 * 8. POST /better-auth/mfa/verify - Complete MFA setup [Protected]
 * 9. POST /better-auth/change-password - Change password (requires auth)
 * 10. POST /better-auth/request-password-reset - Request password reset
 * 11. POST /better-auth/reset-password - Reset password with token
 * 12. POST /better-auth/refresh-token - Refresh access token
 * 13. POST /better-auth/revoke-token - Revoke single refresh token [Protected]
 * 14. POST /better-auth/logout-all-devices - Revoke all refresh tokens [Protected]
 * 15. POST /better-auth/logout - Logout user (requires auth) [Protected]
 * 16. GET /better-auth/referral-info - Get referral code and link (requires auth) [Protected]
 */

import { api } from './api';
import type {
  RegisterRequest,
  LoginRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  CompleteRegistrationRequest,
  Verify2FARequest,
  Generate2FASecretRequest,
  Enable2FARequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
  ChangePasswordRequest,
  RevokeTokenRequest,
  RegisterResponse,
  LoginResponse,
  MFARequiredResponse,
  VerifyEmailResponse,
  CompleteRegistrationResponse,
  RefreshTokenResponse,
  Generate2FASecretResponse,
  Enable2FAResponse,
  ReferralInfoResponse,
  ApiResponse,
} from '@/types/auth';

// ============================================
// TYPE ALIASES (for backward compatibility)
// ============================================

export type RegisterPayload = RegisterRequest;
export type LoginPayload = LoginRequest;
export type VerifyEmailPayload = VerifyEmailRequest;
export type ResendVerificationPayload = ResendVerificationRequest;
export type CompleteRegistrationPayload = CompleteRegistrationRequest;
export type Verify2FAPayload = Verify2FARequest;
export type Generate2FASecretPayload = Generate2FASecretRequest;
export type Enable2FAPayload = Enable2FARequest;
export type RequestPasswordResetPayload = RequestPasswordResetRequest;
export type ResetPasswordPayload = ResetPasswordRequest;
export type RefreshTokenPayload = RefreshTokenRequest;
export type ChangePasswordPayload = ChangePasswordRequest;
export type RevokeTokenPayload = RevokeTokenRequest;

// Response type aliases
type InternalRegisterResponse =
  | RegisterResponse
  | ApiResponse<RegisterResponse>;
type InternalLoginResponse =
  | LoginResponse
  | MFARequiredResponse
  | ApiResponse<LoginResponse>;
type InternalVerifyEmailResponse =
  | VerifyEmailResponse
  | ApiResponse<VerifyEmailResponse>;
type InternalCompleteRegistrationResponse =
  | CompleteRegistrationResponse
  | ApiResponse<CompleteRegistrationResponse>;
type InternalRefreshTokenResponse =
  | RefreshTokenResponse
  | ApiResponse<RefreshTokenResponse>;
type InternalGenerate2FASecretResponse =
  | Generate2FASecretResponse
  | ApiResponse<Generate2FASecretResponse>;
type InternalEnable2FAResponse =
  | Enable2FAResponse
  | ApiResponse<Enable2FAResponse>;
type InternalReferralInfoResponse =
  | ReferralInfoResponse
  | ApiResponse<ReferralInfoResponse>;
type InternalGenericResponse = ApiResponse<{ message?: string }>;

// Exported response types
export type {
  RegisterResponse,
  LoginResponse,
  MFARequiredResponse,
  VerifyEmailResponse,
  CompleteRegistrationResponse,
  RefreshTokenResponse,
  Generate2FASecretResponse,
  Enable2FAResponse,
  ReferralInfoResponse,
} from '@/types/auth';

// ============================================
// AUTHENTICATION SERVICE
// ============================================

/**
 * Authentication Service
 * All authentication-related API calls aligned with BetterAuth backend
 */
export const authService = {
  /**
   * 1. Register - Initiate registration (creates temporary user)
   * POST /better-auth/register
   * @param payload - Registration data with fname/lname
   * @returns { message, nextStep: "/verify-email" }
   */
  register: async (
    payload: RegisterRequest
  ): Promise<InternalRegisterResponse> => {
    // Debug logging for registration requests
    if (process.env.NODE_ENV === 'development') {
      console.log('[authService.register] Sending registration request:', {
        ...payload,
        password: '***',
        confirmPassword: '***',
      });
    }
    return api.post<InternalRegisterResponse>('/better-auth/register', payload);
  },

  /**
   * 2. Verify email with code
   * POST /better-auth/verify-email
   * @param payload - Email and verification code
   * @returns Success message
   */
  verifyEmail: async (
    payload: VerifyEmailRequest
  ): Promise<InternalVerifyEmailResponse> => {
    return api.post<InternalVerifyEmailResponse>(
      '/better-auth/verify-email',
      payload
    );
  },

  /**
   * 3. Resend verification code
   * POST /better-auth/resend-verification
   * @param payload - Email address
   * @returns Success message
   */
  resendVerification: async (
    payload: ResendVerificationRequest
  ): Promise<InternalVerifyEmailResponse> => {
    return api.post<InternalVerifyEmailResponse>(
      '/better-auth/resend-verification',
      payload
    );
  },

  /**
   * 4. Complete registration with verification code
   * POST /better-auth/complete-registration
   * @param payload - Email and verification code
   * @returns Token, user data, and referral info
   */
  completeRegistration: async (
    payload: CompleteRegistrationRequest
  ): Promise<InternalCompleteRegistrationResponse> => {
    // Debug logging for complete registration requests
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[authService.completeRegistration] Sending complete registration request:',
        {
          email: payload.email,
          verificationCode: payload.verificationCode,
          codeLength: payload.verificationCode?.length,
        }
      );
    }

    // BetterAuth endpoint expects: { email, code }
    // Transform verificationCode to code for backend compatibility
    const requestPayload = {
      email: payload.email,
      code: payload.verificationCode,
    };

    return api.post<InternalCompleteRegistrationResponse>(
      '/better-auth/complete-registration',
      requestPayload
    );
  },

  /**
   * 5. Login with email/username and password
   * POST /better-auth/login
   * @param payload - Email OR username, and password
   * @returns Token and user data, OR mfaRequired response
   */
  login: async (payload: LoginRequest): Promise<InternalLoginResponse> => {
    // Debug logging for login requests
    if (process.env.NODE_ENV === 'development') {
      console.log('[authService.login] Sending login request:', {
        email: payload.email,
        username: payload.username,
        hasPassword: !!payload.password,
        passwordLength: payload.password?.length || 0,
      });
    }
    return api.post<InternalLoginResponse>('/better-auth/login', payload);
  },

  /**
   * 6. Verify MFA code during login
   * POST /better-auth/verify-mfa
   * @param payload - UserID and 6-digit TOTP code
   * @returns Token and user data
   */
  verify2FA: async (
    payload: Verify2FARequest
  ): Promise<InternalLoginResponse> => {
    return api.post<InternalLoginResponse>('/better-auth/verify-mfa', payload);
  },

  /**
   * 7. Setup MFA - Generate secret and QR code
   * POST /better-auth/mfa/setup [Protected]
   * @param payload - Empty object (user ID from auth token)
   * @returns QR code, secret, and verification token
   */
  generate2FASecret: async (): Promise<InternalGenerate2FASecretResponse> => {
    // Backend extracts user from Authorization token, so send empty body
    return api.post<InternalGenerate2FASecretResponse>(
      '/better-auth/mfa/setup',
      {}
    );
  },

  /**
   * 8. Complete MFA setup - Verify TOTP code to enable 2FA
   * POST /better-auth/mfa/verify [Protected]
   * Backend guide: userId is NOT required - backend extracts from auth token
   * @param payload - Verification token (from setup) and 6-digit TOTP code
   * @returns Success message and backup codes array
   */
  enable2FA: async (payload: Enable2FARequest): Promise<Enable2FAResponse> => {
    // Backend guide: Only send verificationToken and verificationCode
    // Backend extracts userId from Authorization token
    const requestPayload = {
      verificationToken: payload.verificationToken,
      verificationCode: payload.verificationCode,
    };

    const response = await api.post<InternalEnable2FAResponse>(
      '/better-auth/mfa/verify',
      requestPayload
    );

    // DEBUG: Log raw response from API
    console.log(
      '[authService.enable2FA] 🔍 Raw API Response:',
      JSON.stringify(response, null, 2)
    );
    console.log('[authService.enable2FA] 🔍 Response Type:', typeof response);

    // Map backend response structure per guide:
    // { success: true, data: { backupCodes: [...], user: {...} } }
    if (response && typeof response === 'object') {
      const responseData = response as any;
      console.log('[authService.enable2FA] 🔍 Response Data Structure:', {
        'responseData keys': Object.keys(responseData),
        'responseData.backupCodes': responseData.backupCodes,
        'responseData.data': responseData.data,
        'responseData.data?.backupCodes': responseData.data?.backupCodes,
        'responseData.data?.data': responseData.data?.data,
        'responseData.data?.data?.backupCodes':
          responseData.data?.data?.backupCodes,
      });

      // Extract backup codes from various possible locations
      const backupCodes =
        responseData.backupCodes ||
        responseData.data?.backupCodes ||
        responseData.data?.data?.backupCodes ||
        [];

      console.log(
        '[authService.enable2FA] 🔍 Extracted Backup Codes:',
        backupCodes
      );

      return {
        message: responseData.message || 'MFA setup completed successfully',
        backupCodes: backupCodes.length > 0 ? backupCodes : undefined,
      } as Enable2FAResponse;
    }

    return response as Enable2FAResponse;
  },

  /**
   * 8.5. Disable MFA/2FA
   * POST /better-auth/mfa/disable [Protected]
   * @returns Success message
   */
  disable2FA: async (): Promise<InternalGenericResponse> => {
    return api.post<InternalGenericResponse>('/better-auth/mfa/disable', {});
  },

  /**
   * 9. Change password (requires authentication)
   * POST /better-auth/change-password [Protected]
   * @param payload - Current password, new password, email OTP, 2FA (if enabled), Turnstile
   * @returns Success message
   */
  updatePassword: async (
    payload: ChangePasswordRequest
  ): Promise<InternalGenericResponse> => {
    const body: Record<string, unknown> = {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      emailOtp: payload.emailOtp,
      ...(payload.twoFACode && { twoFACode: payload.twoFACode }),
    };
    const turnstile =
      payload['cf-turnstile-response'] || payload.turnstileToken;
    if (turnstile) body['cf-turnstile-response'] = turnstile;
    return api.post<InternalGenericResponse>(
      '/better-auth/change-password',
      body
    );
  },

  /**
   * 10. Request password reset OTP
   * POST /better-auth/request-password-reset
   * @param payload - Email + Turnstile token
   * @returns Success message (same whether email exists or not, for security)
   */
  requestPasswordReset: async (
    payload: RequestPasswordResetRequest
  ): Promise<InternalGenericResponse> => {
    const body: Record<string, unknown> = { email: payload.email };
    const turnstile =
      payload['cf-turnstile-response'] || payload.turnstileToken;
    if (turnstile) body['cf-turnstile-response'] = turnstile;
    return api.post<InternalGenericResponse>(
      '/better-auth/request-password-reset',
      body
    );
  },

  /**
   * 11. Reset password with OTP (breaking change: no token from email link)
   * POST /better-auth/reset-password
   * @param payload - Email + OTP + new password + Turnstile
   * @returns Success message
   */
  resetPassword: async (
    payload: ResetPasswordRequest
  ): Promise<InternalGenericResponse> => {
    const body: Record<string, unknown> = {
      email: payload.email,
      otp: payload.otp,
      newPassword: payload.newPassword,
    };
    const turnstile =
      payload['cf-turnstile-response'] || payload.turnstileToken;
    if (turnstile) body['cf-turnstile-response'] = turnstile;
    return api.post<InternalGenericResponse>(
      '/better-auth/reset-password',
      body
    );
  },

  /**
   * Request change password OTP (user must be logged in)
   * POST /better-auth/change-password/request-otp
   */
  requestChangePasswordOtp: async (payload: {
    'cf-turnstile-response'?: string;
    turnstileToken?: string;
  }): Promise<{ success: boolean; message: string; expiresIn?: number }> => {
    const body: Record<string, unknown> = {};
    const turnstile =
      payload['cf-turnstile-response'] || payload.turnstileToken;
    if (turnstile) body['cf-turnstile-response'] = turnstile;
    return api.post<{ success: boolean; message: string; expiresIn?: number }>(
      '/better-auth/change-password/request-otp',
      body
    );
  },

  /**
   * 12. Refresh access token
   * POST /better-auth/refresh-token
   * @param payload - Refresh token
   * @returns New access token and refresh token
   */
  refreshToken: async (
    payload: RefreshTokenRequest
  ): Promise<InternalRefreshTokenResponse> => {
    return api.post<InternalRefreshTokenResponse>(
      '/better-auth/refresh-token',
      payload
    );
  },

  /**
   * 13. Revoke single refresh token
   * POST /better-auth/revoke-token [Protected]
   * @param payload - Refresh token to revoke
   * @returns Success message
   */
  revokeToken: async (
    payload: RevokeTokenRequest
  ): Promise<InternalGenericResponse> => {
    return api.post<InternalGenericResponse>(
      '/better-auth/revoke-token',
      payload
    );
  },

  /**
   * 14. Logout from all devices
   * POST /better-auth/logout-all-devices [Protected]
   * @returns Success message
   */
  logoutAllDevices: async (): Promise<InternalGenericResponse> => {
    return api.post<InternalGenericResponse>(
      '/better-auth/logout-all-devices',
      {}
    );
  },

  /**
   * 15. Logout current user
   * POST /better-auth/logout [Protected]
   * @returns Success message
   */
  logout: async (): Promise<InternalGenericResponse> => {
    return api.post<InternalGenericResponse>('/better-auth/logout', {});
  },

  /**
   * 16. Get referral information
   * GET /better-auth/referral-info [Protected]
   * @returns Referral code, link, and statistics
   */
  getReferralInfo: async (): Promise<InternalReferralInfoResponse> => {
    return api.get<InternalReferralInfoResponse>('/better-auth/referral-info');
  },
};

// ============================================
// RE-EXPORT UTILITIES
// ============================================

/**
 * All helper functions and utilities have been moved to auth-utils.ts
 * Import from there for better organization and reusability
 */
export {
  normalizeUser,
  validateEmail,
  validatePassword,
  validateVerificationCode,
  validateUsername,
  getPasswordStrength,
  getUserDisplayName,
  getUserInitials,
} from './auth-utils';

export { ERROR_MESSAGES } from '@/types/auth';

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Extract error message from API responses
 */
import { ERROR_MESSAGES } from '@/types/auth';

export const getErrorMessage = (errorCode: string): string => {
  return ERROR_MESSAGES[errorCode] || 'An unexpected error occurred';
};

export const extractErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred'
): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Network/CORS errors
    if (
      err.code === 'CORS_ERROR' ||
      err.code === 'ERR_NETWORK' ||
      err.statusCode === 0
    ) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Extract response data for better error detection
    let responseData: Record<string, unknown> | null = null;
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      if (response.data && typeof response.data === 'object') {
        responseData = response.data as Record<string, unknown>;
      }
    } else if (err.responseData && typeof err.responseData === 'object') {
      responseData = err.responseData as Record<string, unknown>;
    }

    // Check for specific error codes first
    if (responseData) {
      const errorCode = responseData.code || responseData.error;
      if (typeof errorCode === 'string' && errorCode in ERROR_MESSAGES) {
        return getErrorMessage(errorCode);
      }

      // Check for specific error messages that indicate email vs password issues
      const errorMessage = responseData.message || responseData.error;
      if (typeof errorMessage === 'string') {
        const lowerMessage = errorMessage.toLowerCase();

        // Email-related errors
        if (
          lowerMessage.includes('email not found') ||
          lowerMessage.includes('user not found') ||
          lowerMessage.includes('no account found') ||
          lowerMessage.includes('email does not exist') ||
          lowerMessage.includes('invalid email')
        ) {
          return 'No account found with this email address. Please check your email or sign up.';
        }

        // Password-related errors
        if (
          lowerMessage.includes('incorrect password') ||
          lowerMessage.includes('wrong password') ||
          lowerMessage.includes('invalid password') ||
          lowerMessage.includes('password mismatch') ||
          lowerMessage.includes('password is incorrect')
        ) {
          return 'Incorrect password. Please check your password and try again.';
        }

        // Use the backend message if it's clear
        if (
          errorMessage &&
          errorMessage !== 'Invalid credentials' &&
          errorMessage !== 'Authentication failed'
        ) {
          return errorMessage;
        }
      }
    }

    // Phase 1 error format
    if (err.error && typeof err.error === 'object') {
      const nestedError = err.error as Record<string, unknown>;
      if (typeof nestedError.code === 'string') {
        return getErrorMessage(nestedError.code);
      }
      if (typeof nestedError.message === 'string') {
        return nestedError.message;
      }
    }

    // Direct message
    if (typeof err.message === 'string') {
      const lowerMessage = err.message.toLowerCase();

      // Check for specific error patterns
      if (
        lowerMessage.includes('email not found') ||
        lowerMessage.includes('user not found') ||
        lowerMessage.includes('no account found')
      ) {
        return 'No account found with this email address. Please check your email or sign up.';
      }

      if (
        lowerMessage.includes('incorrect password') ||
        lowerMessage.includes('wrong password') ||
        lowerMessage.includes('invalid password')
      ) {
        return 'Incorrect password. Please check your password and try again.';
      }

      if (err.message in ERROR_MESSAGES) {
        return getErrorMessage(err.message);
      }
      return err.message;
    }

    // Status code based messages
    if (typeof err.statusCode === 'number') {
      const statusMessages: Record<number, string> = {
        400: 'Invalid request. Please check your input',
        401: 'Invalid email or password. Please check your credentials and try again.',
        403: 'Access denied',
        404: 'Resource not found',
        500: 'Server error. Please try again later',
        501: 'This feature is currently under development',
      };
      return statusMessages[err.statusCode] || fallback;
    }

    // Axios error format (fallback)
    if (err.response && typeof err.response === 'object') {
      const response = err.response as Record<string, unknown>;
      if (response.data && typeof response.data === 'object') {
        const data = response.data as Record<string, unknown>;
        if (typeof data.message === 'string') return data.message;

        if (data.error && typeof data.error === 'object') {
          const dataError = data.error as Record<string, unknown>;
          if (typeof dataError.code === 'string') {
            return getErrorMessage(dataError.code);
          }
        }
      }
    }
  }

  return fallback;
};

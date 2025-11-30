/**
 * React Query Mutations - Clean Version
 * Mutation functions for data modifications
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { authService, normalizeUser, extractErrorMessage } from './authService';
import { userService } from './userService';
import type {
  RegisterPayload,
  CompleteRegistrationPayload,
  ResendVerificationPayload,
  LoginPayload,
  Verify2FAPayload,
  Generate2FASecretPayload,
  Enable2FAPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from './authService';
import type { RegisterRequest } from '@/types/auth';
import type { UpdateProfilePayload, UploadKYCPayload } from './userService';
import { queryKeys } from './queries';
import { toast } from 'sonner';
import {
  UpdateProfilePayload as UserUpdateProfilePayload,
  type User,
} from '@/types/user';
import { CreateStakePayload, WithdrawEarlyPayload } from '@/types/stake';
import {
  TransferBetweenWalletsPayload,
  InitiateDepositPayload,
  InitiateDepositResponse,
} from '@/types/wallet';
import { WithdrawalRequest } from '@/types/withdrawal';
import { useAuthStore } from '@/store/authStore';
import type { BackendUser } from '@/types/auth';

// ============================================
// AUTH MUTATIONS - BetterAuth Implementation
// ============================================

/**
 * Login with email/username and password
 * BetterAuth: POST /better-auth/login
 * Returns: token + user OR mfaRequired response
 */
export function useLogin() {
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginPayload) => {
      console.log('[useLogin] Attempting login:', {
        email: credentials.email,
        username: credentials.username,
      });
      return authService.login(credentials);
    },
    onSuccess: (response) => {
      console.log('[useLogin] Login response:', response);
      console.log('[useLogin] Response type:', typeof response);
      console.log(
        '[useLogin] Response keys:',
        response && typeof response === 'object' ? Object.keys(response) : 'N/A'
      );

      // Unwrap response if nested
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = (response as any).data;
        console.log('[useLogin] Unwrapped nested response data');
      }

      console.log('[useLogin] Processing data:', {
        hasMfaRequired: 'mfaRequired' in data,
        mfaRequiredValue: (data as any)?.mfaRequired,
        hasUserID: 'userID' in data || 'userId' in data,
        hasToken: 'token' in data,
        hasUser: 'user' in data,
        dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
      });

      // Check if 2FA is required (Phase 1 format - uses userID, not mfaToken)
      if (
        data &&
        typeof data === 'object' &&
        'mfaRequired' in data &&
        data.mfaRequired === true
      ) {
        console.log('[useLogin] 2FA required - Phase 1 format');
        const userId = (data as any).userID || (data as any).userId;
        if (userId) {
          console.log('[useLogin] 2FA required for userID:', userId);
          toast.info('2FA Required', {
            description: 'Please enter your two-factor authentication code',
          });
          // Don't set user/tokens yet, 2FA flow will handle it
          // The login page will handle showing the 2FA input
          return;
        } else {
          console.error(
            '[useLogin] 2FA required but userID not found in response:',
            data
          );
        }
      }

      // Normal login flow - Phase 1 returns token (not accessToken)
      if (
        data &&
        typeof data === 'object' &&
        'token' in data &&
        'user' in data
      ) {
        const { token, user } = data as {
          token: string;
          user: BackendUser;
        };

        console.log(
          '[useLogin] Normal login successful, setting user and tokens'
        );

        // Normalize user (fname/lname to firstName/lastName)
        const normalizedUser = normalizeUser(user);

        // Phase 1 login may not return refreshToken
        // Use empty string for now, will be populated by refresh endpoint if needed
        const refreshToken = (data as any).refreshToken || '';

        setUser(normalizedUser as User);
        setTokens(token, refreshToken);

        toast.success('Welcome back!', {
          description: `Logged in as ${user.fname} ${user.lname}`,
        });
      } else {
        console.error('[useLogin] Unexpected response structure:', data);
        console.error('[useLogin] Response structure details:', {
          isObject: typeof data === 'object',
          hasToken: data && typeof data === 'object' ? 'token' in data : false,
          hasUser: data && typeof data === 'object' ? 'user' in data : false,
          hasMfaRequired:
            data && typeof data === 'object' ? 'mfaRequired' in data : false,
          allKeys: data && typeof data === 'object' ? Object.keys(data) : [],
        });
        toast.error('Login error', {
          description: 'Received unexpected response from server',
        });
      }
    },
    onError: (error: unknown) => {
      console.error('[useLogin] Login failed:', error);

      // Extract user-friendly error message
      let userMessage =
        'Invalid email or password. Please check your credentials and try again.';
      let statusCode = 401;

      if (typeof error === 'object' && error !== null) {
        const err = error as any;

        // Extract status code
        statusCode =
          err.statusCode || err.response?.status || err.status || 401;

        // Extract backend message
        let backendMessage = '';
        if (err.message && typeof err.message === 'string') {
          backendMessage = err.message;
        }
        if (err.response?.data) {
          const responseData = err.response.data;
          if (typeof responseData === 'string') {
            backendMessage = responseData;
          } else if (
            typeof responseData === 'object' &&
            responseData !== null
          ) {
            backendMessage =
              responseData.message || responseData.error || backendMessage;
          }
        }

        // Parse backend message for more specific user messages
        if (
          backendMessage &&
          !backendMessage.includes('status code') &&
          !backendMessage.includes('failed with')
        ) {
          const lowerMessage = backendMessage.toLowerCase();

          if (
            lowerMessage.includes('email not found') ||
            lowerMessage.includes('user not found') ||
            lowerMessage.includes('no account found') ||
            lowerMessage.includes('email does not exist')
          ) {
            userMessage = 'No account found with this email address.';
          } else if (
            lowerMessage.includes('incorrect password') ||
            lowerMessage.includes('wrong password') ||
            lowerMessage.includes('invalid password') ||
            lowerMessage.includes('password mismatch') ||
            lowerMessage.includes('invalid credentials')
          ) {
            userMessage = 'Incorrect password. Please try again.';
          } else if (
            lowerMessage.includes('account locked') ||
            lowerMessage.includes('too many attempts')
          ) {
            userMessage = 'Too many failed attempts. Please try again later.';
          } else if (
            lowerMessage.includes('verify your email') ||
            lowerMessage.includes('email not verified')
          ) {
            userMessage = 'Please verify your email before logging in.';
          } else {
            // Use the backend message if it's descriptive
            userMessage = backendMessage;
          }
        } else {
          // Default message based on status code
          if (statusCode === 401) {
            userMessage =
              'Invalid email or password. Please check your credentials and try again.';
          } else if (statusCode === 403) {
            userMessage =
              'Access denied. Please verify your email or contact support.';
          } else if (statusCode === 404) {
            userMessage = 'No account found with this email address.';
          } else if (statusCode === 429) {
            userMessage = 'Too many login attempts. Please wait a few minutes.';
          } else if (statusCode >= 500) {
            userMessage = 'Server error. Please try again later.';
          }
        }
      }

      toast.error('Login failed', {
        description: userMessage,
      });
    },
  });
}

/**
 * Phase 1 Registration Flow:
 * 1. register() -> creates temp user, sends verification code
 * 2. resendVerification() -> resends code if needed
 * 3. completeRegistration() -> verifies code and creates permanent user
 */
export function useSignup() {
  return useMutation({
    mutationFn: async (credentials: RegisterPayload) => {
      console.log('[useSignup] Registering user:', {
        email: credentials.email,
        username: credentials.username,
      });

      // BetterAuth: Backend now expects firstName/lastName (not fname/lname)
      const creds = credentials as any;

      // Validate required fields are not empty
      const firstName = (creds.firstName || creds.fname || '').trim();
      const lastName = (creds.lastName || creds.lname || '').trim();
      const email = (credentials.email || '').trim();
      const username = (credentials.username || '').trim();
      const phoneNumber = (credentials.phoneNumber || '').trim();
      const countryCode = (credentials.countryCode || '').trim();

      // Validate all required fields (phoneNumber and countryCode are now REQUIRED)
      if (
        !firstName ||
        !lastName ||
        !email ||
        !username ||
        !phoneNumber ||
        !countryCode
      ) {
        const missingFields = [];
        if (!firstName) missingFields.push('firstName');
        if (!lastName) missingFields.push('lastName');
        if (!email) missingFields.push('email');
        if (!username) missingFields.push('username');
        if (!phoneNumber) missingFields.push('phoneNumber');
        if (!countryCode) missingFields.push('countryCode');

        console.error('[useSignup] Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // BetterAuth expects firstName/lastName directly (not fname/lname)
      // NOTE: Avatar/profilePicture is NOT included - backend should set it to null
      // Users must set their own avatar after registration via the profile page
      const payload: RegisterRequest = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        phoneNumber, // ✅ REQUIRED
        countryCode, // ✅ REQUIRED
        ...(credentials.referralCode?.trim()
          ? { referralCode: credentials.referralCode.trim() }
          : {}),
        // Avatar/profilePicture is intentionally NOT included - should be null in backend
      };

      console.log('[useSignup] BetterAuth registration payload:', {
        ...payload,
        password: '***',
        confirmPassword: '***',
      });

      // Log the exact payload structure for debugging
      console.log('[useSignup] Payload structure:', {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        username: payload.username,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
        hasReferralCode: !!payload.referralCode,
        passwordLength: payload.password.length,
        confirmPasswordLength: payload.confirmPassword.length,
      });

      return authService.register(payload);
    },
    onSuccess: (response) => {
      console.log('[useSignup] Registration initiated:', response);
      toast.success('Verification code sent!', {
        description:
          response.message || 'Please check your email to verify your account',
      });
    },
    onError: (error: unknown) => {
      // Better error serialization
      let errorDetails: Record<string, unknown> = {};

      if (error instanceof Error) {
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }

      if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        errorDetails = {
          ...errorDetails,
          message: err.message || err.errorMessage || 'Unknown error',
          statusCode: err.statusCode || err.status || 'N/A',
          errors: err.errors,
          code: err.code,
          responseData: err.responseData,
          responseMessage:
            typeof err.responseData === 'object' && err.responseData !== null
              ? (err.responseData as any).message ||
                (err.responseData as any).error
              : undefined,
        };

        // Try to extract nested error info
        if (err.fullError && typeof err.fullError === 'object') {
          const fullErr = err.fullError as Record<string, unknown>;
          errorDetails.fullErrorInfo = {
            message: fullErr.message,
            response: fullErr.response,
            request: fullErr.request,
          };
        }
      }

      console.error('[useSignup] Registration failed:', errorDetails);
      console.error('[useSignup] Raw error object:', error);
      console.error('[useSignup] Error type:', typeof error);
      console.error('[useSignup] Error constructor:', error?.constructor?.name);

      const errorMessage = extractErrorMessage(
        error,
        'Registration failed. Please try again.'
      );
      toast.error('Signup failed', {
        description: errorMessage,
      });
    },
    retry: false,
  });
}

export function useCompleteRegistration() {
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: CompleteRegistrationPayload) => {
      console.log(
        '[useCompleteRegistration] Completing registration:',
        payload.email
      );
      return authService.completeRegistration(payload);
    },
    onSuccess: (response) => {
      console.log('[useCompleteRegistration] Registration complete:', response);

      // Extract token and user from response
      let data = response;
      // Updated: Backend no longer returns token - requires manual login
      if (response && typeof response === 'object' && 'data' in response) {
        data = (response as any).data;
      }

      // Check for new response format (requiresLogin: true, no token)
      const responseData = data || response;
      const requiresLogin = (responseData as any)?.requiresLogin === true;
      const nextStep = (responseData as any)?.nextStep || '/login';

      // DO NOT auto-login - backend requires manual login after registration
      // User will be redirected to login page
      toast.success('Registration complete!', {
        description:
          responseData?.message ||
          'Please log in with your credentials to continue.',
      });

      console.log('[useCompleteRegistration] Registration completed:', {
        requiresLogin,
        nextStep,
        user: (responseData as any)?.user,
        emailVerified: (responseData as any)?.user?.emailVerified,
      });
    },
    onError: (error: unknown) => {
      // Better error serialization for complete registration
      let errorDetails: Record<string, unknown> = {};

      if (error instanceof Error) {
        errorDetails = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      }

      if (typeof error === 'object' && error !== null) {
        const err = error as Record<string, unknown>;
        errorDetails = {
          ...errorDetails,
          message: err.message || err.errorMessage || 'Unknown error',
          statusCode: err.statusCode || err.status || 'N/A',
          errors: err.errors,
          code: err.code,
          responseData: err.responseData,
          responseMessage:
            typeof err.responseData === 'object' && err.responseData !== null
              ? (err.responseData as any).message ||
                (err.responseData as any).error
              : undefined,
        };

        // Extract all properties
        const errorKeys = Object.keys(err);
        errorKeys.forEach((key) => {
          if (!errorDetails[key]) {
            try {
              errorDetails[key] = err[key];
            } catch (e) {
              errorDetails[key] = '[Unable to serialize]';
            }
          }
        });
      }

      console.error('[useCompleteRegistration] Failed:', errorDetails);
      console.error('[useCompleteRegistration] Raw error:', error);
      console.error('[useCompleteRegistration] Error type:', typeof error);
      console.error(
        '[useCompleteRegistration] Error keys:',
        typeof error === 'object' && error !== null ? Object.keys(error) : []
      );

      const errorMessage = extractErrorMessage(
        error,
        'Invalid or expired verification code'
      );
      toast.error('Verification failed', {
        description: errorMessage,
      });
    },
  });
}

/**
 * Resend verification code
 * BetterAuth: POST /better-auth/resend-verification
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: async (payload: ResendVerificationPayload) => {
      console.log(
        '[useResendVerification] Resending verification code:',
        payload.email
      );
      return authService.resendVerification(payload);
    },
    onSuccess: (response) => {
      console.log('[useResendVerification] Code resent successfully');
      toast.success('Code sent!', {
        description:
          response.message || 'Check your email for the verification code',
      });
    },
    onError: (error: unknown) => {
      console.error('[useResendVerification] Resend failed:', error);
      const errorMessage = extractErrorMessage(
        error,
        'Could not resend verification code'
      );

      toast.error('Resend failed', {
        description: errorMessage,
      });
    },
  });
}

/**
 * Verify MFA code during login
 * BetterAuth: POST /better-auth/verify-mfa
 * Note: Uses userID instead of mfaToken
 */
export function useVerify2FA() {
  const { setUser, setTokens } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: Verify2FAPayload) => {
      console.log('[useVerify2FA] Verifying 2FA code');
      return authService.verify2FA(payload);
    },
    onSuccess: (response) => {
      console.log('[useVerify2FA] 2FA verified successfully:', response);

      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = (response as any).data;
      }

      if ('token' in data && 'user' in data) {
        const { token, user } = data as {
          token: string;
          user: BackendUser;
        };

        const normalizedUser = normalizeUser(user);
        setUser(normalizedUser as User);

        // Phase 1 may not return refreshToken in verify-2fa
        // Try to get from response or use empty string
        const refreshToken = (data as any).refreshToken || '';
        setTokens(token, refreshToken);

        toast.success('Welcome back!', {
          description: `Logged in as ${user.fname} ${user.lname}`,
        });
      } else {
        console.error('[useVerify2FA] Unexpected response structure:', data);
        toast.error('2FA error', {
          description: 'Received unexpected response from server',
        });
      }
    },
    onError: (error: unknown) => {
      console.error('[useVerify2FA] 2FA verification failed:', error);
      toast.error('Verification failed', {
        description: extractErrorMessage(error, 'Invalid 2FA code'),
      });
    },
  });
}

/**
 * Request password reset OTP
 * BetterAuth: POST /better-auth/request-password-reset
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (payload: RequestPasswordResetPayload) => {
      console.log(
        '[useRequestPasswordReset] Requesting password reset:',
        payload.email
      );
      return authService.requestPasswordReset(payload);
    },
    onSuccess: (response) => {
      console.log('[useRequestPasswordReset] Reset OTP sent');
      toast.success('Reset code sent!', {
        description: response.message || 'Check your email for the OTP code',
      });
    },
    onError: (error: unknown) => {
      console.error('[useRequestPasswordReset] Request failed:', error);
      toast.error('Request failed', {
        description: extractErrorMessage(error, 'Could not send reset code'),
      });
    },
  });
}

/**
 * Reset password with OTP code
 * BetterAuth: POST /better-auth/reset-password (uses reset token)
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      console.log('[useResetPassword] Resetting password with OTP');
      return authService.resetPassword(payload);
    },
    onSuccess: (response) => {
      console.log('[useResetPassword] Password reset successful');
      toast.success('Password reset!', {
        description:
          response.message || 'You can now log in with your new password',
      });
    },
    onError: (error: unknown) => {
      console.error('[useResetPassword] Reset failed:', error);
      toast.error('Reset failed', {
        description: extractErrorMessage(error, 'Invalid or expired OTP code'),
      });
    },
  });
}

/**
 * Update password
 * Phase 1: PATCH /auth/password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      console.log('[useChangePassword] Updating password');
      return authService.updatePassword(payload);
    },
    onSuccess: (response) => {
      console.log('[useChangePassword] Password updated successfully');
      toast.success('Password changed!', {
        description: response.message || 'Your password has been updated',
      });
    },
    onError: (error: unknown) => {
      console.error('[useChangePassword] Update failed:', error);
      toast.error('Update failed', {
        description: extractErrorMessage(error, 'Could not update password'),
      });
    },
  });
}

/**
 * Generate 2FA secret and QR code
 * BetterAuth: POST /better-auth/mfa/setup
 */
export function useGenerate2FASecret() {
  return useMutation({
    mutationFn: async () => {
      console.log('[useGenerate2FASecret] Generating 2FA secret');
      return authService.generate2FASecret();
    },
    onSuccess: (response) => {
      console.log('[useGenerate2FASecret] 2FA secret generated:', response);
      toast.success('2FA Setup', {
        description: 'Scan the QR code or enter the secret manually',
      });
    },
    onError: (error: unknown) => {
      console.error('[useGenerate2FASecret] Setup failed:', error);
      toast.error('Setup failed', {
        description: extractErrorMessage(
          error,
          'Could not generate 2FA secret'
        ),
      });
    },
  });
}

/**
 * Enable 2FA with verification code
 * BetterAuth: POST /better-auth/mfa/verify
 */
export function useEnable2FA() {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: Enable2FAPayload) => {
      console.log('[useEnable2FA] Enabling 2FA');
      return authService.enable2FA(payload);
    },
    onSuccess: (response) => {
      console.log('[useEnable2FA] 2FA enabled successfully');
      updateUser({ twoFAEnabled: true } as Partial<User>);

      toast.success('2FA Enabled!', {
        description: 'Two-factor authentication is now active',
      });
    },
    onError: (error: unknown) => {
      console.error('[useEnable2FA] Enable failed:', error);
      toast.error('Enable failed', {
        description: extractErrorMessage(error, 'Invalid 2FA token'),
      });
    },
  });
}

/**
 * Disable 2FA
 * BetterAuth: POST /better-auth/mfa/disable
 */
export function useDisable2FA() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('[useDisable2FA] Disabling 2FA');
      return authService.disable2FA();
    },
    onSuccess: (response) => {
      console.log('[useDisable2FA] 2FA disabled successfully');
      updateUser({ twoFAEnabled: false } as Partial<User>);

      // Invalidate profile query to refresh user data
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });

      toast.success('2FA Disabled', {
        description: 'Two-factor authentication has been disabled',
      });
    },
    onError: (error: unknown) => {
      console.error('[useDisable2FA] Disable failed:', error);
      toast.error('Disable failed', {
        description: extractErrorMessage(error, 'Could not disable 2FA'),
      });
    },
  });
}

export function useLogout() {
  const { logout: clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      console.log('[useLogout] Logging out');
      return authService.logout();
    },
    onSuccess: () => {
      console.log('[useLogout] Logout successful');
      clearAuth();
      toast.success('Logged out', {
        description: 'You have been logged out successfully',
      });
    },
    onError: (error: unknown) => {
      console.error('[useLogout] Logout failed:', error);
      // Clear auth anyway on logout error
      clearAuth();
      toast.info('Logged out', {
        description: 'You have been logged out',
      });
    },
  });
}

/**
 * Update user profile
 * Phase 1: PUT /users/profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload | UserUpdateProfilePayload) => {
      console.log('[useUpdateProfile] Updating profile with payload:', payload);

      // Convert frontend field names to backend field names if needed
      const backendPayload: UpdateProfilePayload = {
        ...(payload as any),
        // Map firstName/lastName to fname/lname for backend if present
        fname: (payload as any).firstName || (payload as any).fname,
        lname: (payload as any).lastName || (payload as any).lname,
        // Ensure phoneNumber is in correct format (E.164 with +)
        phoneNumber: (payload as any).phoneNumber || (payload as any).phone,
        // Keep countryCode if provided
        countryCode: (payload as any).countryCode,
      };

      // Remove frontend-specific fields (but keep phoneNumber and countryCode)
      delete (backendPayload as any).firstName;
      delete (backendPayload as any).lastName;

      console.log(
        '[useUpdateProfile] Converted to backend payload:',
        backendPayload
      );
      return userService.updateProfile(backendPayload);
    },
    onSuccess: async (data) => {
      console.log('[useUpdateProfile] Profile updated successfully');

      // Normalize backend response (fname/lname) to frontend format
      let responseData = data;
      if (data && typeof data === 'object' && 'data' in data) {
        responseData = (data as any).data;
      }

      const backendData = responseData as any;
      if (backendData && (backendData.fname || backendData.lname)) {
        const normalizedData = {
          ...backendData,
          firstName: backendData.fname || backendData.firstName,
          lastName: backendData.lname || backendData.lastName,
        };
        updateUser(normalizedData as Partial<User>);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Invalidate registration bonus to refresh progress after profile update
      queryClient.invalidateQueries({ queryKey: queryKeys.registrationBonus });
      toast.success('Profile updated', {
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error) => {
      // Better error logging with serialization
      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        statusCode: (error as any)?.statusCode,
        response: (error as any)?.response
          ? {
              status: (error as any).response.status,
              statusText: (error as any).response.statusText,
              data: (error as any).response.data,
            }
          : undefined,
        request: (error as any)?.request
          ? {
              url: (error as any).request.responseURL,
              method: (error as any).config?.method,
            }
          : undefined,
      };

      console.error('[useUpdateProfile] Profile update failed:', errorDetails);
      console.error('[useUpdateProfile] Full error object:', error);

      const errorMessage = extractErrorMessage(
        error,
        'Could not update profile'
      );
      toast.error('Update failed', {
        description: errorMessage,
      });
    },
  });
}

/**
 * Upload KYC documents
 * Phase 1: POST /users/kyc/upload
 */
export function useUploadKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadKYCPayload) => {
      console.log('[useUploadKYC] Uploading KYC documents');
      return userService.uploadKYC(payload);
    },
    onSuccess: (response) => {
      console.log('[useUploadKYC] KYC documents uploaded');
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('Documents uploaded', {
        description: response.message || 'Your KYC submission is under review',
      });
    },
    onError: (error) => {
      console.error('[useUploadKYC] Upload failed:', error);
      toast.error('Upload failed', {
        description: extractErrorMessage(
          error,
          'Could not upload KYC documents'
        ),
      });
    },
  });
}

/**
 * Search users by username
 * Phase 1: GET /users/search?query=username
 */
export function useSearchUsers() {
  return useMutation({
    mutationFn: (query: string) => {
      console.log('[useSearchUsers] Searching users:', query);
      return userService.searchUsers(query);
    },
    onError: (error) => {
      console.error('[useSearchUsers] Search failed:', error);
      toast.error('Search failed', {
        description: extractErrorMessage(error, 'Could not search users'),
      });
    },
  });
}

// ============================================
// STAKE MUTATIONS
// ============================================

export function useCreateStake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStakePayload) =>
      api.post('/staking/create', payload),
    onSuccess: async (response: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeStakes });
      queryClient.invalidateQueries({ queryKey: queryKeys.stakeStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });

      // Process registration bonus if this is the first stake
      const stakeData = response?.data?.stake || response?.stake;
      const isFirstStake =
        response?.data?.isFirstStake || stakeData?.isFirstStake;
      const isBonusEligible =
        response?.data?.registrationBonusEligible || false;

      if (
        isFirstStake &&
        isBonusEligible &&
        stakeData?._id &&
        stakeData?.amount
      ) {
        try {
          // Dynamically import to avoid circular dependencies
          const { registrationBonusApi } = await import(
            '@/services/registrationBonusApi'
          );
          await registrationBonusApi.processStake(
            stakeData._id,
            stakeData.amount
          );

          // Invalidate registration bonus status to refresh banner
          queryClient.invalidateQueries({
            queryKey: queryKeys.registrationBonus,
          });
        } catch (bonusError) {
          // Don't fail the stake creation if bonus processing fails
          console.error(
            '[useCreateStake] Bonus processing failed:',
            bonusError
          );
          // Stake is still created successfully, bonus processing is optional
        }
      }

      toast.success('Stake created successfully! 🎉', {
        description: 'Your investment journey has begun!',
        duration: 5000,
      });
    },
    onError: (error: unknown) => {
      toast.error('Failed to create stake', {
        description: extractErrorMessage(error, 'Could not process your stake'),
      });
    },
  });
}

export function useWithdrawEarly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WithdrawEarlyPayload) =>
      api.post(`/staking/${payload.stakeId}/withdraw-early`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeStakes });
      queryClient.invalidateQueries({ queryKey: queryKeys.completedStakes });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });

      toast.success('Early withdrawal processed', {
        description: 'Funds have been returned to your wallet',
      });
    },
  });
}

// ============================================
// WALLET MUTATIONS
// ============================================

export function useTransferBetweenWallets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferBetweenWalletsPayload) =>
      api.post('/wallet/transfer', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions() });

      toast.success('Transfer successful', {
        description: 'Funds transferred between wallets',
      });
    },
  });
}

export function useInitiateDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitiateDepositPayload) =>
      api.post<InitiateDepositResponse>('/transactions/deposit', {
        amount: payload.amount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      toast.success('Deposit initialized', {
        description:
          'Send funds to the generated address to complete your deposit.',
      });
    },
    onError: (error: unknown) => {
      toast.error('Deposit initialization failed', {
        description: extractErrorMessage(
          error,
          'Unable to create deposit address'
        ),
      });
    },
  });
}

// ============================================
// WITHDRAWAL MUTATIONS
// ============================================

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WithdrawalRequest) =>
      api.post('/withdrawal/request', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawalStats });

      toast.success('Withdrawal requested', {
        description: 'Your withdrawal request is being processed',
      });
    },
  });
}

export function useCancelWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/withdrawal/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals });

      toast.success('Withdrawal cancelled', {
        description: 'Your withdrawal request has been cancelled',
      });
    },
  });
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export function useTerminateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      api.delete(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      toast.success('Session terminated');
    },
  });
}

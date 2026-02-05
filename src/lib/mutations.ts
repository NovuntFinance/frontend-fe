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
import type {
  DeclareProfitRequest,
  DeclareBulkProfitRequest,
  UpdateProfitRequest,
  DeleteProfitRequest,
  TestDistributionRequest,
} from '@/types/dailyProfit';
import type {
  DeclareReturnsRequest,
  DeclareReturnsResponse,
  UpdateDeclarationRequest,
  DeleteDeclarationRequest,
  DistributeDeclarationRequest,
} from '@/types/dailyDeclarationReturns';

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
      // Better error serialization
      let errorStr = '';
      let errorDetails: any = {};

      try {
        if (error instanceof Error) {
          errorStr = error.message;
          errorDetails = {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 200),
          };
        } else if (typeof error === 'object' && error !== null) {
          const err = error as any;
          errorStr = err.message || JSON.stringify(err);
          errorDetails = {
            ...err,
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            response: err.response
              ? {
                  status: err.response.status,
                  statusText: err.response.statusText,
                  data: err.response.data,
                }
              : undefined,
          };
        } else {
          errorStr = String(error);
          errorDetails = { raw: error };
        }
      } catch (e) {
        errorStr = 'Failed to serialize error';
        errorDetails = { serializationError: String(e) };
      }

      console.error('[useLogin] Login failed:', errorStr);
      console.error('[useLogin] Error type:', typeof error);
      console.error('[useLogin] Error details:', errorDetails);

      // Extract detailed error information
      let backendMessage = 'Invalid credentials';

      if (typeof error === 'object' && error !== null) {
        const err = error as any;

        // Get status code

        // Try to get backend error message from multiple possible locations
        if (err.message && typeof err.message === 'string') {
          backendMessage = err.message;
        } else if (err.response?.data) {
          const responseData = err.response.data;
          if (typeof responseData === 'string') {
            backendMessage = responseData;
          } else if (
            typeof responseData === 'object' &&
            responseData !== null
          ) {
            backendMessage =
              (responseData as any).message ||
              (responseData as any).error ||
              JSON.stringify(responseData);
          }
        } else if (err.responseData?.message) {
          backendMessage = err.responseData.message;
        }
      }

      const errorMessage = extractErrorMessage(error, backendMessage);
      console.error('[useLogin] Extracted error message:', errorMessage);

      // Try to serialize full error object with circular reference handling
      try {
        const seen = new WeakSet();
        const fullErrorStr = JSON.stringify(
          error,
          (key, value) => {
            // Handle circular references
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '[Circular]';
              }
              seen.add(value);
            }
            return value;
          },
          2
        );
        console.error('[useLogin] Full error object:', fullErrorStr);
      } catch (e) {
        console.error('[useLogin] Could not serialize full error object:', e);
        // Fallback: log error properties individually
        if (typeof error === 'object' && error !== null) {
          const err = error as any;
          console.error('[useLogin] Error properties:', {
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
            response: err.response
              ? {
                  status: err.response.status,
                  statusText: err.response.statusText,
                  data:
                    typeof err.response.data === 'string'
                      ? err.response.data
                      : JSON.stringify(err.response.data),
                }
              : undefined,
          });
        }
      }

      // Show specific error message - extractErrorMessage already provides clear messages
      toast.error('Login failed', {
        description:
          errorMessage ||
          'Invalid email or password. Please check your credentials and try again.',
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
        ...(credentials.turnstileToken
          ? { turnstileToken: credentials.turnstileToken }
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
  // const { setUser, setTokens } = useAuthStore();

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
            } catch {
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
      // Backend extracts user from auth token, so no payload is required
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
    onSuccess: () => {
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
    onSuccess: () => {
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

// ============================================
// ADMIN MUTATIONS
// ============================================

/**
 * Create a new user (Admin only)
 * POST /api/v1/admin/users
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      username: string;
      password: string;
      fname: string;
      lname: string;
      phoneNumber?: string;
      countryCode?: string;
      referralCode?: string;
    }) => {
      const { adminService } = await import('@/services/adminService');
      return adminService.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create user';
      toast.error(message);
    },
  });
}

/**
 * Create a new admin (Super Admin only)
 * POST /api/v1/admin/admins
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminData: {
      email: string;
      username: string;
      password: string;
      fname: string;
      lname: string;
      role: 'admin' | 'superAdmin';
      phoneNumber?: string;
      permissions?: string[]; // Optional array of permission keys
    }) => {
      const { adminService } = await import('@/services/adminService');
      return adminService.createAdmin(adminData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('Admin created successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create admin';
      const details = error?.response?.data?.error?.details;
      if (details?.permissions) {
        toast.error(`Invalid permissions: ${details.permissions}`);
      } else {
        toast.error(message);
      }
    },
  });
}

/**
 * Update user status (suspend/activate)
 * PATCH /api/v1/admin/users/:userId/status
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
      reason,
    }: {
      userId: string;
      status: 'active' | 'suspended' | 'inactive';
      reason: string;
    }) => {
      const { adminService } = await import('@/services/adminService');
      return adminService.updateUserStatus(userId, status, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success(
        `User ${variables.status === 'active' ? 'activated' : 'suspended'} successfully`
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update user status';
      toast.error(message);
    },
  });
}

/**
 * Force logout user
 * POST /api/v1/admin/users/:userId/force-logout
 */
export function useForceLogoutUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const { adminService } = await import('@/services/adminService');
      return adminService.forceLogoutUser(userId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('User logged out successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to force logout user';
      toast.error(message);
    },
  });
}

/**
 * Change user role
 * PATCH /api/v1/admin/users/:userId/role
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
      reason,
    }: {
      userId: string;
      role: string;
      reason: string;
    }) => {
      const { adminService } = await import('@/services/adminService');
      return adminService.changeUserRole(userId, role, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update user role';
      toast.error(message);
    },
  });
}

/**
 * Delete user (safe anonymize or hard delete)
 * DELETE /api/v1/admin/users/:userId
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
      mode,
    }: {
      userId: string;
      reason: string;
      mode: 'anonymize' | 'hard';
    }) => {
      const { adminService } = await import('@/services/adminService');
      return adminService.deleteUser(userId, { reason, mode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete user';
      toast.error(message);
    },
  });
}

// ============================================
// DAILY PROFIT MUTATIONS
// ============================================

// IMPORTANT:
// `queryKeys.declaredDailyProfits(filters)` includes the filters object as part of the key.
// When we mutate, we must invalidate by a *prefix* key (not by calling the queryKey factory
// with no filters), otherwise filtered queries (calendar range, status filter) won't refetch.
const ADMIN_DAILY_PROFIT_DECLARED_KEY = [
  'admin',
  'daily-profit',
  'declared',
] as const;
const USER_DAILY_PROFIT_KEY = ['daily-profit'] as const;

/**
 * Declare profit for a single day
 * POST /api/v1/admin/daily-profit/declare
 */
export function useDeclareDailyProfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeclareProfitRequest) => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      return dailyProfitService.declareProfit(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      // If admin declares/updates today's profit, user-facing widgets should update immediately.
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      toast.success('Daily profit declared successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to declare daily profit';
      toast.error(message);
    },
  });
}

/**
 * Declare profits for multiple days (bulk)
 * POST /api/v1/admin/daily-profit/declare-bulk
 */
export function useDeclareBulkDailyProfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeclareBulkProfitRequest) => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      return dailyProfitService.declareBulkProfit(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      const count =
        (data as any)?.declared?.length ||
        (data as any)?.data?.declared?.length ||
        0;
      toast.success(`Declared ${count} daily profit(s) successfully`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to declare bulk profits';
      toast.error(message);
    },
  });
}

/**
 * Update a future profit declaration
 * PATCH /api/v1/admin/daily-profit/:date
 */
export function useUpdateDailyProfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      data,
    }: {
      date: string;
      data: UpdateProfitRequest;
    }) => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      return dailyProfitService.updateProfit(date, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      toast.success('Daily profit updated successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update daily profit';
      toast.error(message);
    },
  });
}

/**
 * Delete a future profit declaration
 * DELETE /api/v1/admin/daily-profit/:date
 */
export function useDeleteDailyProfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      data,
    }: {
      date: string;
      data: DeleteProfitRequest;
    }) => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      return dailyProfitService.deleteProfit(date, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      toast.success('Daily profit deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete daily profit';
      toast.error(message);
    },
  });
}

/**
 * Test distribution for a specific date (manual trigger)
 * POST /api/v1/admin/daily-profit/test-distribute
 */
export function useTestDistributeDailyProfit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TestDistributionRequest) => {
      const { dailyProfitService } = await import(
        '@/services/dailyProfitService'
      );
      return dailyProfitService.testDistribute(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      const result = data?.data || data;
      toast.success(
        `Distribution completed: ${result.totalDistributed} USDT to ${result.processedStakes} stakes`
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to distribute profits';
      toast.error(message);
    },
  });
}

// ============================================
// DAILY DECLARATION RETURNS MUTATIONS (Unified)
// ============================================

// IMPORTANT:
// `queryKeys.declaredReturns(filters)` includes the filters object as part of the key.
// When we mutate, we must invalidate by a *prefix* key (not by calling the queryKey factory
// with no filters), otherwise filtered queries (calendar range, status filter) won't refetch.
const ADMIN_DECLARATION_RETURNS_KEY = [
  'admin',
  'daily-declaration-returns',
] as const;

/**
 * Declare pools + ROS for a specific date (unified endpoint)
 * POST /api/v1/admin/daily-declaration-returns/declare
 * Backend returns 202 Accepted when autoDistributeROS and rosPercentage > 0 (ROS runs in background).
 */
export function useDeclareReturns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeclareReturnsRequest) => {
      const { dailyDeclarationReturnsService } = await import(
        '@/services/dailyDeclarationReturnsService'
      );
      const { data: body, status } =
        await dailyDeclarationReturnsService.declareReturns(data);
      return { ...body, _httpStatus: status };
    },
    onSuccess: (
      response: DeclareReturnsResponse & { _httpStatus?: number }
    ) => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DECLARATION_RETURNS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      const is202 = response?._httpStatus === 202;
      if (is202) {
        toast.success('Declaration created', {
          description:
            'ROS distribution started in background. Usually completes within 1–2 minutes.',
        });
      } else {
        toast.success('Daily declaration returns declared successfully');
      }
    },
    onError: (error: any) => {
      const message = getDeclarationErrorMessage(
        error,
        'Failed to declare returns'
      );
      toast.error(message);
    },
  });
}

/** Extract user-facing message from API error (handles various backend shapes) */
function getDeclarationErrorMessage(error: any, fallback: string): string {
  if (!error) return fallback;
  const data = error?.response?.data;
  let message = fallback;
  if (data && typeof data === 'object') {
    const nested = (data as any).error;
    if (
      nested &&
      typeof nested === 'object' &&
      typeof nested.message === 'string'
    )
      message = nested.message;
    else if (typeof (data as any).message === 'string')
      message = (data as any).message;
    else if (typeof (data as any).error === 'string')
      message = (data as any).error;
  } else if (
    typeof error?.message === 'string' &&
    !error.message.startsWith('Request failed')
  ) {
    message = error.message;
  }
  // If backend still returns old 2.2% validation, add a hint so user knows it's a backend/deploy issue
  if (
    typeof message === 'string' &&
    message.includes('2.2') &&
    (message.toLowerCase().includes('ros') || message.includes('percentage'))
  ) {
    message +=
      " The server you're connected to has not been updated to allow 0–100% ROS yet. Use a backend that has the 0–100% validation deployed, or check NEXT_PUBLIC_API_URL.";
  }
  return message;
}

/**
 * Update a future declaration
 * PATCH /api/v1/admin/daily-declaration-returns/:date
 */
export function useUpdateDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      data,
    }: {
      date: string;
      data: UpdateDeclarationRequest;
    }) => {
      const { dailyDeclarationReturnsService } = await import(
        '@/services/dailyDeclarationReturnsService'
      );
      return dailyDeclarationReturnsService.updateDeclaration(date, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DECLARATION_RETURNS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      toast.success('Declaration updated successfully');
    },
    onError: (error: any) => {
      const message = getDeclarationErrorMessage(
        error,
        'Failed to update declaration'
      );
      toast.error(message);
    },
  });
}

/**
 * Delete a future declaration
 * DELETE /api/v1/admin/daily-declaration-returns/:date
 */
export function useDeleteDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      data,
    }: {
      date: string;
      data: DeleteDeclarationRequest;
    }) => {
      const { dailyDeclarationReturnsService } = await import(
        '@/services/dailyDeclarationReturnsService'
      );
      return dailyDeclarationReturnsService.deleteDeclaration(date, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ADMIN_DECLARATION_RETURNS_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
      });
      queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      toast.success('Declaration deleted successfully');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete declaration';
      toast.error(message);
    },
  });
}

/**
 * Distribute pools and/or ROS for a specific date
 * POST /api/v1/admin/daily-declaration-returns/:date/distribute
 * Returns 202 Accepted for async processing
 */
export function useDistributeDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      data,
    }: {
      date: string;
      data: DistributeDeclarationRequest;
    }) => {
      const { dailyDeclarationReturnsService } = await import(
        '@/services/dailyDeclarationReturnsService'
      );
      const { data: body, status } =
        await dailyDeclarationReturnsService.distributeDeclaration(date, data);
      return {
        ...body,
        _httpStatus: status,
        _isAsync: status === 202,
      };
    },
    onSuccess: (data) => {
      const result = data?.data ?? data;
      const isAsync = data?._isAsync === true;

      if (isAsync) {
        toast.success('Distribution started', {
          description:
            result?.rosDistribution?.message ||
            'ROS distribution is running in the background. Usually completes within 1–2 minutes.',
        });
        queryClient.invalidateQueries({
          queryKey: ADMIN_DECLARATION_RETURNS_KEY,
        });
        queryClient.invalidateQueries({
          queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
        });
        queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });
      } else {
        // Synchronous completion
        queryClient.invalidateQueries({
          queryKey: ADMIN_DECLARATION_RETURNS_KEY,
        });
        queryClient.invalidateQueries({
          queryKey: ADMIN_DAILY_PROFIT_DECLARED_KEY,
        });
        queryClient.invalidateQueries({ queryKey: USER_DAILY_PROFIT_KEY });

        const poolsDistributed = result.poolDistribution?.distributed;
        const rosDistributed = result.rosDistribution?.distributed;

        if (poolsDistributed && rosDistributed) {
          toast.success('Pools and ROS distributed successfully');
        } else if (poolsDistributed) {
          toast.success('Pools distributed successfully');
        } else if (rosDistributed) {
          toast.success('ROS distributed successfully');
        }
      }
    },
    onError: (error: any) => {
      // Check if it's a 202 response that axios might have treated as an error
      if (error?.response?.status === 202) {
        // This shouldn't happen as axios treats 2xx as success
        // But handle it just in case
        toast.info('Distribution started', {
          description: 'Processing in background...',
        });
        queryClient.invalidateQueries({
          queryKey: ADMIN_DECLARATION_RETURNS_KEY,
        });
        return;
      }

      const message =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to distribute';
      toast.error(message);
    },
  });
}

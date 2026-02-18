'use client';

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { useLogin, useVerify2FA } from '@/lib/mutations';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { checkBackendHealth } from '@/lib/backendHealthCheck';
import { NeuField, NeuPasswordField } from '@/components/auth/NeuField';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/auth/TurnstileWidget';
import Loading from '@/components/ui/loading';
import styles from '@/styles/auth.module.css';

/**
 * Login Page - BetterAuth Aligned
 * Features:
 * - Email/password authentication
 * - MFA support
 * - Error handling
 * - Loading states
 */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const loginMutation = useLogin();
  const verifyMFAMutation = useVerify2FA();
  const [backendStatus, setBackendStatus] = useState<{
    checked: boolean;
    healthy: boolean;
    message: string;
  } | null>(null);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth()
      .then((result) => {
        setBackendStatus({
          checked: true,
          healthy: result.isHealthy,
          message: result.message,
        });

        if (!result.isHealthy) {
          console.warn(
            '[Login Page] Backend health check failed:',
            result.message
          );
        }
      })
      .catch((error) => {
        setBackendStatus({
          checked: true,
          healthy: false,
          message: `Health check error: ${error.message}`,
        });
      });
  }, []);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (typeof error === 'string' && error) {
      return error;
    }

    return fallback;
  };

  const [showPassword, setShowPassword] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [userID, setUserID] = useState<string | null>(null); // Phase 1 uses userID instead of mfaToken
  const [loginData, setLoginData] = useState<LoginFormData | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] =
    useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  // Stable callbacks for Turnstile to prevent widget remounting
  const handleTurnstileToken = useCallback((token: string) => {
    setTurnstileToken(token);
    setTurnstileError(null);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setTurnstileError('Verification failed. Please try again.');
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');

  // Pre-fill email from URL parameter
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [searchParams, setValue]);

  // Redirect if already authenticated (handoff: never redirect while isLoading)
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || hasRedirected) return;

    // CRITICAL: Don't redirect if we just arrived from an auth redirect
    // This prevents login/dashboard redirect loops
    const reason = searchParams?.get('reason');
    if (reason === 'auth_required' || reason === 'session_expired') {
      const lastAuthRedirect = sessionStorage.getItem('auth_redirect_at');
      const now = Date.now();
      if (lastAuthRedirect) {
        const elapsed = now - parseInt(lastAuthRedirect, 10);
        if (elapsed < 2000) {
          // Within 2s of auth redirect - don't auto-redirect, let user re-login
          return;
        }
      }
      sessionStorage.setItem('auth_redirect_at', String(now));
    }

    const redirectTo = searchParams?.get('redirect') || '/dashboard';
    console.log(
      '[Login Page] useEffect detected authentication, redirecting to:',
      redirectTo
    );
    setHasRedirected(true);

    // Use full page nav so cookies are in request (production fix for login loop)
    const redirectTimer = setTimeout(() => {
      window.location.replace(redirectTo);
    }, 400);

    return () => clearTimeout(redirectTimer);
  }, [hasHydrated, isAuthenticated, hasRedirected, router, searchParams]);

  // Handle login submission
  const onSubmit = async (data: LoginFormData) => {
    console.log('[Login Page] Submitting login form:', { email: data.email });
    try {
      // Require Turnstile token when configured
      if (turnstileEnabled && !turnstileToken) {
        setTurnstileError(
          'Please complete the security verification and try again.'
        );
        return;
      }

      // Phase 1 API expects { email?, username?, password }
      // Strip out rememberMe since it's frontend-only
      const loginPayload = {
        email: data.email.trim().toLowerCase(), // Normalize email
        password: data.password,
        ...(turnstileToken ? { turnstileToken } : {}),
        // Don't send rememberMe - it's handled client-side
      };

      console.log('[Login Page] Sending login payload:', {
        email: loginPayload.email,
        hasPassword: !!loginPayload.password,
        passwordLength: loginPayload.password?.length || 0,
      });

      const result = await loginMutation.mutateAsync(loginPayload);
      console.log('[Login Page] Login mutation result:', result);
      console.log('[Login Page] Result type:', typeof result);
      console.log(
        '[Login Page] Result keys:',
        result ? Object.keys(result) : 'null/undefined'
      );

      // Check if 2FA is required (Phase 1 flow)
      // NOTE: The result is already unwrapped by apiRequest - no .data property!
      // Phase 1 returns mfaRequired: true and userID when 2FA is needed
      if (result && 'mfaRequired' in result && result.mfaRequired === true) {
        console.log('[Login Page] 2FA required, showing 2FA input');
        setRequiresMFA(true);
        // Phase 1 uses userID from login response
        const userIdFromResult =
          (result as any).userID || (result as any).userId;
        if (userIdFromResult) {
          setUserID(userIdFromResult);
        } else {
          console.error(
            '[Login Page] 2FA required but userID not found in response:',
            result
          );
          setError('root', {
            message: '2FA required but user ID missing from server response',
          });
          return;
        }
        setLoginData(data);
      } else {
        // Success - wait for auth state to update, then redirect
        console.log(
          '[Login Page] Login successful, waiting for auth state update...'
        );
        const redirectTo = searchParams?.get('redirect') || '/dashboard';
        console.log('[Login Page] Will redirect to:', redirectTo);

        // Wait for auth state to be fully updated before redirecting
        // Mutation onSuccess runs synchronously; allow time for React + persist to settle
        const checkAuthAndRedirect = (attempt = 0) => {
          const authState = useAuthStore.getState();
          if (authState.isAuthenticated && authState.token) {
            // CRITICAL: Use full page navigation so cookies are guaranteed in the request.
            // router.replace() does client-side nav - middleware may not receive cookies on first load.
            // window.location.replace forces a full request where browser sends all cookies.
            setTimeout(() => {
              window.location.replace(redirectTo);
            }, 500);
          } else if (attempt < 30) {
            setTimeout(() => checkAuthAndRedirect(attempt + 1), 100);
          }
        };

        // Start after delay - onSuccess sets state, allow React to process
        setTimeout(() => checkAuthAndRedirect(0), 300);
      }
    } catch (error: unknown) {
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

      console.error('[Login Page] Login error caught:', errorStr);
      console.error('[Login Page] Error type:', typeof error);
      console.error('[Login Page] Error details:', errorDetails);

      // Extract detailed error information
      let backendMessage = 'Invalid email or password';
      let statusCode = 401;
      let errorCode: string | undefined;
      let passwordResetRequired = false;

      if (typeof error === 'object' && error !== null) {
        const err = error as any;

        // Get status code
        statusCode = err.statusCode || err.response?.status || 401;

        // Check for Turnstile failure
        errorCode = err.code || err.response?.data?.code;
        if (statusCode === 400 && errorCode === 'TURNSTILE_FAILED') {
          backendMessage =
            err.message ||
            'Verification failed. Please complete the security check and try again.';
          // Reset Turnstile widget
          turnstileRef.current?.reset();
          setTurnstileToken(null);
          setTurnstileError(
            'Verification failed. Please complete the security check again.'
          );
        }

        // Try to get backend error message from multiple possible locations
        if (
          err.message &&
          typeof err.message === 'string' &&
          !err.message.includes('status code')
        ) {
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
              backendMessage;
            errorCode = (responseData as any).code;
            passwordResetRequired =
              (responseData as any).passwordResetRequired === true;
          }
        } else if (err.responseData?.message) {
          backendMessage = err.responseData.message;
          errorCode = err.responseData.code;
          passwordResetRequired =
            err.responseData.passwordResetRequired === true;
        }

        // Check for EMAIL_NOT_VERIFIED error code and passwordResetRequired
        const responseData = err.response?.data || err.responseData;
        if (responseData && typeof responseData === 'object') {
          errorCode = responseData.code || errorCode;
          passwordResetRequired =
            passwordResetRequired ||
            responseData.passwordResetRequired === true;
        }

        // Improve error message specificity
        const lowerMessage = backendMessage.toLowerCase();
        if (
          lowerMessage.includes('email not found') ||
          lowerMessage.includes('user not found') ||
          lowerMessage.includes('no account found') ||
          lowerMessage.includes('email does not exist')
        ) {
          backendMessage =
            'No account found with this email address. Please check your email or sign up.';
        } else if (
          lowerMessage.includes('incorrect password') ||
          lowerMessage.includes('wrong password') ||
          lowerMessage.includes('invalid password') ||
          lowerMessage.includes('password mismatch')
        ) {
          backendMessage =
            'Incorrect password. Please check your password and try again.';
        }

        console.error('[Login Page] Parsed error details:', {
          isError: error instanceof Error,
          statusCode,
          backendMessage,
          errorCode,
          passwordResetRequired,
          responseData: err.response?.data,
          code: err.code,
          message: err.message,
        });
      }

      // Try to serialize full error object with circular reference handling
      try {
        const seen = new WeakSet();
        const fullErrorStr = JSON.stringify(
          error,
          (key, value) => {
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
        console.error('[Login Page] Full error object:', fullErrorStr);
      } catch (e) {
        console.error('[Login Page] Could not serialize full error object:', e);
        // Fallback: log error properties individually
        if (typeof error === 'object' && error !== null) {
          const err = error as any;
          console.error('[Login Page] Error properties:', {
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

      // Priority 1: Check if password reset is required (double password hashing bug fix)
      if (
        passwordResetRequired ||
        backendMessage.toLowerCase().includes('password reset required')
      ) {
        setRequiresPasswordReset(true);
        setRequiresEmailVerification(false);
        setUnverifiedEmail(null);
        setError('root', {
          message:
            'For security reasons, please reset your password to continue.',
        });
      }
      // Priority 2: Check if error is EMAIL_NOT_VERIFIED
      // Backend returns 403 status with emailNotVerified: true flag
      // Check both the error code, status code, and emailNotVerified flag
      const emailNotVerified =
        statusCode === 403 || // Backend returns 403 for unverified email
        errorCode === 'EMAIL_NOT_VERIFIED' ||
        (typeof error === 'object' &&
          error !== null &&
          ((error as any).emailNotVerified === true ||
            (error as any).response?.data?.emailNotVerified === true)) ||
        backendMessage.toLowerCase().includes('verify your email') ||
        backendMessage.toLowerCase().includes('email not verified');

      if (emailNotVerified) {
        setUnverifiedEmail(emailValue || '');
        setRequiresEmailVerification(true);
        setRequiresPasswordReset(false);
        setError('root', {
          message: 'Please verify your email address before logging in.',
        });
      } else {
        // Generic error
        setRequiresEmailVerification(false);
        setRequiresPasswordReset(false);
        setUnverifiedEmail(null);
        const errorMessage = getErrorMessage(error, backendMessage);
        console.error('[Login Page] Extracted error message:', errorMessage);
        setError('root', {
          message: errorMessage,
        });
      }
    }
  };

  // Handle 2FA verification (Phase 1 format)
  const handleMFAVerification = async (code: string) => {
    if (!userID) return;

    try {
      await verifyMFAMutation.mutateAsync({
        userID,
        token: code, // Phase 1 expects 'token' not 'verificationCode'
      });
      const redirectTo = searchParams?.get('redirect') || '/dashboard';
      // Full page nav ensures cookies reach middleware (production login loop fix)
      setTimeout(() => window.location.replace(redirectTo), 400);
    } catch (error: unknown) {
      setError('root', {
        message: getErrorMessage(error, 'Invalid verification code'),
      });
    }
  };

  // Show MFA input if required
  if (requiresMFA) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--neu-text)' }}
          >
            Multi-Factor Authentication
          </h1>
          <p className={styles.neuTextSecondary}>
            Enter the 6-digit code from your authenticator app
            {loginData?.email ? ` for ${loginData.email}` : ''}
          </p>
        </div>

        <TwoFactorInput
          onComplete={handleMFAVerification}
          isLoading={verifyMFAMutation.isPending}
          error={errors.root?.message}
        />

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setRequiresMFA(false);
              setUserID(null);
              setLoginData(null);
            }}
            className={`${styles.neuBtnBack} rounded-xl px-6 py-3`}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Backend Status Alert */}
      {backendStatus && !backendStatus.healthy && (
        <div className={styles.neuErrorAlert}>
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-400" />
          <div>
            <strong>Backend connection issue:</strong> {backendStatus.message}
            <span className="mt-1 block text-sm opacity-90">
              If using Render free tier, wait 30-60 seconds and try again.
            </span>
          </div>
        </div>
      )}

      {/* Success message (if redirected from email verification) */}
      {searchParams?.get('verified') === 'true' && (
        <div
          className={`${styles.neuErrorAlert} border-green-500/30`}
          style={{ color: '#86efac' }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Email verified successfully! You can now login.</span>
        </div>
      )}

      {/* Error Alert */}
      {errors.root && (
        <div className={styles.neuErrorAlert}>
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <div>
            <span>{errors.root.message}</span>
            {requiresEmailVerification && unverifiedEmail && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className={styles.neuLink}
                >
                  Verify Email Now
                </Link>
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className={styles.neuLink}
                >
                  Or resend verification code →
                </Link>
              </div>
            )}
            {requiresPasswordReset && emailValue && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(emailValue)}`}
                  className={styles.neuLink}
                >
                  Reset Password Now
                </Link>
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(emailValue)}`}
                  className={styles.neuLink}
                >
                  Need help? Contact Support →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className={`${styles.neuAuthCard} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <NeuField
              id="email"
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
              register={register}
              registerName="email"
            />
            <div className="space-y-1.5">
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className={`text-sm ${styles.neuLink}`}
                >
                  Forgot password?
                </Link>
              </div>
              <NeuPasswordField
                id="password"
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password}
                register={register}
                registerName="password"
                showPassword={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                className={styles.neuCheckbox}
                {...register('rememberMe')}
              />
              <label
                htmlFor="rememberMe"
                className={`cursor-pointer text-sm ${styles.neuTextSecondary}`}
              >
                Remember me for 30 days
              </label>
            </div>

            {turnstileEnabled && (
              <>
                <TurnstileWidget
                  widgetRef={turnstileRef}
                  size="normal"
                  onToken={handleTurnstileToken}
                  onError={handleTurnstileError}
                />
                {turnstileError && (
                  <p className={styles.neuFieldError}>{turnstileError}</p>
                )}
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 py-3.5 ${isSubmitting || loginMutation.isPending ? styles.neuBtnDisabled : ''}`}
              disabled={isSubmitting || loginMutation.isPending}
            >
              {(isSubmitting || loginMutation.isPending) && (
                <NovuntSpinner size="sm" className="mr-2" />
              )}
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Sign In
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Sign Up Link */}
      <div className={`${styles.neuBottomLink} text-sm`}>
        <span className={styles.neuTextMuted}>
          Don&apos;t have an account?{' '}
        </span>
        <Link href="/signup" className={styles.neuLink}>
          Sign up for free
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<Loading label="Preparing secure login..." className="py-12" />}
    >
      <LoginPageContent />
    </Suspense>
  );
}

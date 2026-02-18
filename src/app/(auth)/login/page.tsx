'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import { useLogin, useVerify2FA } from '@/lib/mutations';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { checkBackendHealth } from '@/lib/backendHealthCheck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TwoFactorInput } from '@/components/auth/TwoFactorInput';
// Turnstile disabled for login - import removed
import Loading from '@/components/ui/loading';

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
  // Turnstile disabled for login - removed all Turnstile-related code

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
      // Turnstile disabled for login - removed token requirement
      // Phase 1 API expects { email?, username?, password }
      // Strip out rememberMe since it's frontend-only
      const loginPayload = {
        email: data.email.trim().toLowerCase(), // Normalize email
        password: data.password,
        // Turnstile token removed - disabled for login
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
        // Turnstile disabled for login - removed error handling

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
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 backdrop-blur-sm">
            <Lock className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Multi-Factor Authentication
          </h1>
          <p className="text-white/70">
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
          <Button
            variant="ghost"
            onClick={() => {
              setRequiresMFA(false);
              setUserID(null);
              setLoginData(null);
            }}
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-white/70">
          Sign in to your account to continue your staking journey
        </p>
      </div>

      {/* Backend Status Alert */}
      {backendStatus && !backendStatus.healthy && (
        <Alert className="border-orange-500/50 bg-orange-500/10 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-200">
            <strong>Backend Connection Issue:</strong> {backendStatus.message}
            <br />
            <span className="mt-1 block text-sm">
              If using Render free tier, the server might be sleeping. Please
              wait 30-60 seconds and try again.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Success message (if redirected from email verification) */}
      {searchParams?.get('verified') === 'true' && (
        <Alert className="border-green-500/50 bg-green-500/10 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            Email verified successfully! You can now login.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {errors.root && (
        <Alert
          variant={
            requiresEmailVerification || requiresPasswordReset
              ? 'default'
              : 'destructive'
          }
          className={
            requiresEmailVerification
              ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
              : requiresPasswordReset
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                : ''
          }
        >
          <AlertCircle
            className={`h-4 w-4 ${
              requiresEmailVerification
                ? 'text-yellow-600'
                : requiresPasswordReset
                  ? 'text-orange-600'
                  : ''
            }`}
          />
          <AlertDescription
            className={
              requiresEmailVerification
                ? 'text-yellow-800 dark:text-yellow-200'
                : requiresPasswordReset
                  ? 'text-orange-800 dark:text-orange-200'
                  : ''
            }
          >
            {errors.root.message}

            {/* Email Verification Actions */}
            {requiresEmailVerification && unverifiedEmail && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md bg-yellow-600 px-4 text-sm font-medium text-white transition-colors hover:bg-yellow-700 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Verify Email Now
                </Link>
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium text-yellow-700 transition-colors hover:underline dark:text-yellow-300"
                >
                  Or resend verification code →
                </Link>
              </div>
            )}

            {/* Password Reset Actions */}
            {requiresPasswordReset && emailValue && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(emailValue)}`}
                  className="focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Reset Password Now
                </Link>
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(emailValue)}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium text-orange-700 transition-colors hover:underline dark:text-orange-300"
                >
                  Need help? Contact Support →
                </Link>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
      <Card className="relative overflow-hidden border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        {/* Gradient Background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />

        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="relative z-10 space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                  autoComplete="current-password"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                {...register('rememberMe')}
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-normal text-white/90"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Turnstile disabled for login - removed widget */}
          </CardContent>

          <CardFooter className="relative z-10 flex flex-col space-y-4 pt-8">
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/70 active:scale-[0.98]"
              size="lg"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {(isSubmitting || loginMutation.isPending) && (
                <NovuntSpinner size="sm" className="mr-2" />
              )}
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Sign Up Link */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm backdrop-blur-sm">
        <span className="text-white/70">Don&apos;t have an account? </span>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          Sign up for free
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
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

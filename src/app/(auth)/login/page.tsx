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
import { BiometricButton } from '@/components/auth/BiometricButton';
import Loading from '@/components/ui/loading';

/**
 * Login Page - BetterAuth Aligned
 * Features:
 * - Email/password authentication
 * - MFA support
 * - Biometric login (future)
 * - Error handling
 * - Loading states
 */
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
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

  // Redirect if already authenticated (with loop prevention)
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      const redirectTo = searchParams?.get('redirect') || '/dashboard';
      console.log(
        '[Login Page] useEffect detected authentication, redirecting to:',
        redirectTo
      );
      console.log('[Login Page] Auth state:', {
        isAuthenticated,
        hasRedirected,
        redirectTo,
      });
      setHasRedirected(true);

      // Use replace instead of push to avoid back button issues
      // Small delay to ensure all state updates are complete
      const redirectTimer = setTimeout(() => {
        console.log(
          '[Login Page] Executing redirect via replace to:',
          redirectTo
        );
        router.replace(redirectTo);
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, hasRedirected, router, searchParams]);

  // Handle biometric login success
  const handleBiometricSuccess = (credentials: {
    email: string;
    password: string;
  }) => {
    setValue('email', credentials.email);
    setValue('password', credentials.password);
    // Auto-submit
    handleSubmit(onSubmit)();
  };

  // Handle login submission
  const onSubmit = async (data: LoginFormData) => {
    console.log('[Login Page] Submitting login form:', { email: data.email });
    try {
      // Phase 1 API expects { email?, username?, password }
      // Strip out rememberMe since it's frontend-only
      const loginPayload = {
        email: data.email.trim().toLowerCase(), // Normalize email
        password: data.password,
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
        // Check auth state in a loop to ensure it's updated
        const checkAuthAndRedirect = () => {
          const authState = useAuthStore.getState();
          if (authState.isAuthenticated && authState.token) {
            console.log(
              '[Login Page] Auth state confirmed, redirecting to:',
              redirectTo
            );
            router.replace(redirectTo);
          } else {
            console.log('[Login Page] Auth state not ready yet, retrying...', {
              isAuthenticated: authState.isAuthenticated,
              hasToken: !!authState.token,
            });
            // Retry after a short delay
            setTimeout(checkAuthAndRedirect, 100);
          }
        };

        // Start checking after a brief delay to allow state update
        setTimeout(checkAuthAndRedirect, 200);
      }
    } catch (error: unknown) {
      console.error('[Login Page] Login error:', error);

      // Extract user-friendly error message
      let userMessage =
        'Invalid email or password. Please check your credentials and try again.';
      let statusCode = 401;
      let errorCode: string | undefined;
      let passwordResetRequired = false;
      let emailNotVerified = false;

      if (typeof error === 'object' && error !== null) {
        const err = error as any;

        // Extract status code
        statusCode =
          err.statusCode || err.response?.status || err.status || 401;

        // Extract error code
        errorCode =
          err.code || err.response?.data?.code || err.responseData?.code;

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
            errorCode = responseData.code || errorCode;
            passwordResetRequired = responseData.passwordResetRequired === true;
            emailNotVerified = responseData.emailNotVerified === true;
          }
        }

        // Check for password reset requirement
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
          return;
        }

        // Check for email verification requirement
        if (
          statusCode === 403 ||
          errorCode === 'EMAIL_NOT_VERIFIED' ||
          emailNotVerified ||
          backendMessage.toLowerCase().includes('verify your email') ||
          backendMessage.toLowerCase().includes('email not verified')
        ) {
          setUnverifiedEmail(emailValue || '');
          setRequiresEmailVerification(true);
          setRequiresPasswordReset(false);
          setError('root', {
            message: 'Please verify your email address before logging in.',
          });
          return;
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
            userMessage =
              'No account found with this email address. Please check your email or sign up.';
          } else if (
            lowerMessage.includes('incorrect password') ||
            lowerMessage.includes('wrong password') ||
            lowerMessage.includes('invalid password') ||
            lowerMessage.includes('password mismatch') ||
            lowerMessage.includes('invalid credentials')
          ) {
            userMessage =
              'Incorrect password. Please check your password and try again.';
          } else if (
            lowerMessage.includes('account locked') ||
            lowerMessage.includes('too many attempts')
          ) {
            userMessage =
              'Your account has been temporarily locked due to too many failed login attempts. Please try again later or reset your password.';
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
              'Access denied. Please contact support if you believe this is an error.';
          } else if (statusCode === 404) {
            userMessage =
              'No account found with this email address. Please check your email or sign up.';
          } else if (statusCode === 429) {
            userMessage =
              'Too many login attempts. Please wait a few minutes and try again.';
          } else if (statusCode >= 500) {
            userMessage =
              'Server error. Please try again later or contact support if the issue persists.';
          }
        }
      }

      // Set the error
      setRequiresEmailVerification(false);
      setRequiresPasswordReset(false);
      setUnverifiedEmail(null);
      setError('root', {
        message: userMessage,
      });
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
      router.push(redirectTo);
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
          <div className="bg-primary/10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full">
            <Lock className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Multi-Factor Authentication
          </h1>
          <p className="text-muted-foreground">
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
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue your staking journey
        </p>
      </div>

      {/* Backend Status Alert */}
      {backendStatus && !backendStatus.healthy && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
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
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
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
      <Card className="border-border/50 relative overflow-hidden shadow-2xl">
        {/* Gradient Background */}
        <div className="from-primary/5 to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="relative z-10 space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
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
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-primary text-sm hover:underline"
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
                  className="pr-10 pl-10"
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                {...register('rememberMe')}
              />
              <Label
                htmlFor="rememberMe"
                className="cursor-pointer text-sm font-normal"
              >
                Remember me for 30 days
              </Label>
            </div>
          </CardContent>

          <CardFooter className="relative z-10 flex flex-col space-y-4 pt-8">
            {/* Submit Button */}
            <Button
              type="submit"
              className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
              size="lg"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {(isSubmitting || loginMutation.isPending) && (
                <NovuntSpinner size="sm" className="mr-2" />
              )}
              Sign In
            </Button>

            {/* Biometric Login */}
            <BiometricButton
              onSuccess={handleBiometricSuccess}
              disabled={isSubmitting || loginMutation.isPending}
            />
          </CardFooter>
        </form>
      </Card>

      {/* Sign Up Link */}
      <div className="bg-muted/50 border-border/50 rounded-xl border p-6 text-center text-sm">
        <span className="text-muted-foreground">
          Don&apos;t have an account?{' '}
        </span>
        <Link
          href="/signup"
          className="text-primary group inline-flex items-center gap-1 font-semibold hover:underline"
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

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
  calculatePasswordStrength,
} from '@/lib/validation';
import { useResetPassword } from '@/lib/mutations';
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
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email'); // Email might be in URL

  const resetPasswordMutation = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const passwordStrength = password
    ? calculatePasswordStrength(password)
    : null;

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      // Transform form data to match API payload
      // Backend expects email, otpCode (token), newPassword, confirmPassword
      if (!email) {
        setError('root', {
          message: 'Email is required. Please use the link from your email.',
        });
        return;
      }

      await resetPasswordMutation.mutateAsync({
        email: email,
        otpCode: data.token, // Token from URL is the OTP code
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?reset=true');
      }, 2000);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to reset password';
      setError('root', {
        message,
      });
    }
  };

  // If token is missing or invalid
  if (tokenError) {
    return (
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 backdrop-blur-sm">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Invalid Reset Link
            </h1>
            <p className="text-white/70">
              This password reset link is invalid or has expired
            </p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">What can you do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/70">
            <p>• Password reset links expire after 1 hour</p>
            <p>• The link can only be used once</p>
            <p>• Make sure you&apos;re using the latest email</p>
          </CardContent>
          <CardFooter>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70"
              size="lg"
            >
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If password reset is successful
  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 backdrop-blur-sm"
          >
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Password Reset!
            </h1>
            <p className="text-white/70">
              Your password has been successfully reset
              <br />
              Redirecting to login...
            </p>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Taking you to the login page...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 backdrop-blur-sm">
          <Lock className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Set new password
        </h1>
        <p className="text-white/70">
          Create a strong password to secure your account
        </p>
      </div>

      {/* Error Alert */}
      {errors.root && (
        <Alert className="mb-6 border-red-500/50 bg-red-500/10 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            {errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Card */}
      <Card className="relative overflow-hidden border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
        {/* Gradient Background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />

        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl font-bold text-white">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-white/70">
            Your new password must be different from previously used passwords
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="relative z-10 space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/50" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                  autoComplete="new-password"
                  autoFocus
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white/80"
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
              {password && passwordStrength && (
                <PasswordStrengthIndicator strength={passwordStrength} />
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/90">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-white/50" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <p className="mb-2 text-sm font-medium text-white/90">
                Password must contain:
              </p>
              <ul className="space-y-1 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  At least 8 characters
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  At least one uppercase letter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  At least one lowercase letter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  At least one number
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400">•</span>
                  At least one special character
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="relative z-10 flex flex-col space-y-3 pt-8">
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/70 active:scale-[0.98]"
              size="lg"
              disabled={isSubmitting || resetPasswordMutation.isPending}
            >
              {(isSubmitting || resetPasswordMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reset Password
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {/* Back to Login Link */}
            <Button
              asChild
              variant="ghost"
              className="w-full border-white/20 bg-white/5 text-white/90 backdrop-blur-sm hover:border-white/30 hover:bg-white/10"
            >
              <Link href="/login">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Security Note */}
      <div className="text-center text-sm text-white/60">
        <p>🔒 Your password is encrypted and secure</p>
      </div>
    </div>
  );
}

/**
 * Reset Password Page
 * Set new password using reset token
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

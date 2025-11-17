'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData, calculatePasswordStrength } from '@/lib/validation';
import { useResetPassword } from '@/lib/mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  const passwordStrength = password ? calculatePasswordStrength(password) : null;

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
        error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string'
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
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Invalid Reset Link</h1>
            <p className="text-muted-foreground">
              This password reset link is invalid or has expired
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What can you do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Password reset links expire after 1 hour</p>
            <p>• The link can only be used once</p>
            <p>• Make sure you&apos;re using the latest email</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" size="lg">
              <Link href="/forgot-password">
                Request New Reset Link
              </Link>
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
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Password Reset!</h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset
              <br />
              Redirecting to login...
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
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
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
        <p className="text-muted-foreground">
          Create a strong password to secure your account
        </p>
      </div>

      {/* Error Alert */}
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}

      {/* Form Card */}
      <Card className="shadow-2xl border-border/50 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Your new password must be different from previously used passwords
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 relative z-10">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  autoFocus
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              {password && passwordStrength && (
                <PasswordStrengthIndicator strength={passwordStrength} />
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Password must contain:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  At least 8 characters
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  At least one uppercase letter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  At least one lowercase letter
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  At least one number
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  At least one special character
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 relative z-10 pt-8">
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success shadow-lg hover:shadow-xl transition-all duration-300"
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
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                Cancel
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Security Note */}
      <div className="text-center text-sm text-muted-foreground">
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

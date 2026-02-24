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
  ArrowRight,
} from 'lucide-react';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
  calculatePasswordStrength,
} from '@/lib/validation';
import { useResetPassword } from '@/lib/mutations';
import { NeuPasswordField } from '@/components/auth/NeuField';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import styles from '@/styles/auth.module.css';

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
        <div className="space-y-2 text-center">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--neu-text)' }}
          >
            Invalid Reset Link
          </h1>
          <p className={styles.neuTextSecondary}>
            This password reset link is invalid or has expired
          </p>
        </div>

        <div className={`${styles.neuAuthCard} p-6`}>
          <p className={`mb-3 text-sm font-medium ${styles.neuLabel}`}>
            What can you do?
          </p>
          <p className={`text-sm ${styles.neuTextSecondary}`}>
            • Password reset links expire after 1 hour
          </p>
          <p className={`text-sm ${styles.neuTextSecondary}`}>
            • The link can only be used once
          </p>
          <p className={`text-sm ${styles.neuTextSecondary}`}>
            • Make sure you&apos;re using the latest email
          </p>
          <div className="mt-6">
            <Link
              href="/forgot-password"
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 rounded-xl py-3.5 no-underline`}
            >
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Request New Reset Link
              </span>
            </Link>
          </div>
        </div>
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
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
          >
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </motion.div>
          <div className="space-y-2">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--neu-text)' }}
            >
              Password Reset!
            </h1>
            <p className={styles.neuTextSecondary}>
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </div>
        <div className={`${styles.neuAuthCard} p-6`}>
          <div
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Taking you to the login page...</span>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="space-y-5">
      {errors.root && (
        <div className={styles.neuErrorAlert}>
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
          <span>{errors.root.message}</span>
        </div>
      )}

      <div className={`${styles.neuAuthCard} p-6 sm:p-8`}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('token')} />
          <div className="space-y-4">
            <NeuPasswordField
              id="password"
              label="New Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password}
              register={register}
              registerName="password"
              showPassword={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              strengthIndicator={
                password && passwordStrength ? (
                  <PasswordStrengthIndicator strength={passwordStrength} />
                ) : null
              }
            />
            <NeuPasswordField
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              register={register}
              registerName="confirmPassword"
              showPassword={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <div className={styles.neuTermsSurface}>
              <p className={`mb-2 text-sm font-medium ${styles.neuLabel}`}>
                Password must contain:
              </p>
              <ul className={`space-y-1 text-sm ${styles.neuTextSecondary}`}>
                <li>• At least 8 characters</li>
                <li>• Uppercase and lowercase letters</li>
                <li>• At least one number</li>
                <li>• At least one special character</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              className={`${styles.neuBtnSuccess} flex w-full items-center justify-center gap-2 py-3.5 ${isSubmitting || resetPasswordMutation.isPending ? styles.neuBtnDisabled : ''}`}
              disabled={isSubmitting || resetPasswordMutation.isPending}
            >
              {(isSubmitting || resetPasswordMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              )}
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Reset Password
              </span>
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
            <Link
              href="/login"
              className={`${styles.neuBtnBack} flex items-center justify-center rounded-xl py-3`}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: 'var(--neu-text)' }}
              >
                Cancel
              </span>
            </Link>
          </div>
        </form>
      </div>

      <p className={`text-center text-sm ${styles.neuTextMuted}`}>
        🔒 Your password is encrypted and secure
      </p>
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

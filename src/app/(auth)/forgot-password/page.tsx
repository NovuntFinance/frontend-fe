'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { z } from 'zod';
import { useRequestPasswordReset } from '@/lib/mutations';
import { NeuField } from '@/components/auth/NeuField';
import styles from '@/styles/auth.module.css';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Content Component
 * Request password reset email - BetterAuth Aligned
 */
function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const forgotPasswordMutation = useRequestPasswordReset();
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Pre-fill email from URL parameter
  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [searchParams, setValue]);

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setSubmittedEmail(data.email);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to send reset email';
      setError('root', {
        message,
      });
    }
  };

  // Success state
  if (forgotPasswordMutation.isSuccess && submittedEmail) {
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
              Check your email
            </h1>
            <p className={styles.neuTextSecondary}>
              We&apos;ve sent password reset instructions to
              <br />
              <span
                className="font-medium"
                style={{ color: 'var(--neu-text)' }}
              >
                {submittedEmail}
              </span>
            </p>
          </div>
        </div>

        <div className={`${styles.neuAuthCard} p-6`}>
          <p className={`mb-3 text-sm font-medium ${styles.neuLabel}`}>
            What&apos;s next?
          </p>
          <div className="space-y-3">
            <p className={`text-sm ${styles.neuTextSecondary}`}>
              1. Check your email inbox for a message from Novunt
            </p>
            <p className={`text-sm ${styles.neuTextSecondary}`}>
              2. Click the reset link in the email (valid for 1 hour)
            </p>
            <p className={`text-sm ${styles.neuTextSecondary}`}>
              3. Create a new strong password for your account
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 rounded-xl py-3.5 no-underline`}
            >
              <ArrowLeft className="h-4 w-4 text-white" />
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Back to Log In
              </span>
            </Link>
            <p className={`text-center text-xs ${styles.neuTextMuted}`}>
              Didn&apos;t receive the email? Check your spam folder or try again
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setSubmittedEmail('');
              forgotPasswordMutation.reset();
            }}
            className={styles.neuBtnBack}
          >
            Try a different email
          </button>
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
          <div className="space-y-4">
            <NeuField
              id="email"
              label="Email Address"
              icon={Mail}
              type="email"
              autoComplete="email"
              error={errors.email}
              register={register}
              registerName="email"
            />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 py-3.5 ${isSubmitting || forgotPasswordMutation.isPending ? styles.neuBtnDisabled : ''}`}
              disabled={isSubmitting || forgotPasswordMutation.isPending}
            >
              {(isSubmitting || forgotPasswordMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              )}
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Send Reset Link
              </span>
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </form>
      </div>

      <div className={`${styles.neuBottomLink} text-sm`}>
        <span className={styles.neuTextMuted}>Remember your password? </span>
        <Link href="/login" className={styles.neuLink}>
          Log in
        </Link>
      </div>
    </div>
  );
}

/**
 * Forgot Password Page
 * Wrapped in Suspense boundary for useSearchParams()
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

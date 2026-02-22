'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from '@/components/auth/TurnstileWidget';
import { useOtpCooldown } from '@/hooks/useOtpCooldown';
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
  const turnstileRef = useRef<TurnstileWidgetHandle | null>(null);
  const { cooldownSeconds, isOnCooldown, triggerCooldown } = useOtpCooldown();

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
    const turnstileToken = turnstileRef.current?.getToken();
    if (!turnstileToken) {
      setError('root', {
        message: 'Please complete the security verification',
      });
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync({
        ...data,
        'cf-turnstile-response': turnstileToken,
      });
      setSubmittedEmail(data.email);
      turnstileRef.current?.reset();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { code?: string; waitSeconds?: number } };
      };
      if (triggerCooldown(error)) {
        setError('root', {
          message: 'Please wait before requesting a new code',
        });
      } else if (err?.response?.data?.code === 'SUPPORT_REQUIRED') {
        setError('root', {
          message:
            'Too many attempts. Please contact support or try again later.',
        });
      } else {
        const message =
          error &&
          typeof error === 'object' &&
          'message' in error &&
          typeof (error as { message?: string }).message === 'string'
            ? (error as { message: string }).message
            : 'Failed to send reset email';
        setError('root', { message });
      }
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
              2. Enter the 6-digit code from the email on the reset page
            </p>
            <p className={`text-sm ${styles.neuTextSecondary}`}>
              3. Create a new strong password for your account
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 rounded-xl py-3.5 no-underline`}
            >
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Enter verification code & reset password
              </span>
            </Link>
            <Link
              href="/login"
              className={`${styles.neuBtnBack} flex w-full items-center justify-center gap-2 rounded-xl py-3.5 no-underline`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-bold tracking-wider uppercase">
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
            <TurnstileWidget widgetRef={turnstileRef} size="compact" />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 py-3.5 ${isSubmitting || forgotPasswordMutation.isPending || isOnCooldown ? styles.neuBtnDisabled : ''}`}
              disabled={
                isSubmitting || forgotPasswordMutation.isPending || isOnCooldown
              }
            >
              {(isSubmitting || forgotPasswordMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              )}
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                {isOnCooldown
                  ? `Resend in ${cooldownSeconds}s`
                  : 'Send verification code'}
              </span>
              {!isOnCooldown && <Send className="h-4 w-4 text-white" />}
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

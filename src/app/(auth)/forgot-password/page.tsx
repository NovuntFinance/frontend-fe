'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, AlertCircle, Send } from 'lucide-react';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgotPasswordMutation = useRequestPasswordReset();

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

  // Handle form submission — go straight to code entry, skip intermediate screen
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: string }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to send reset email';
      setError('root', { message });
    }
  };

  return (
    <div className="space-y-5">
      <h1
        className="w-full text-center font-semibold tracking-tight whitespace-nowrap"
        style={{
          color: 'var(--neu-text-primary)',
          fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
        }}
      >
        Need a Reset? — Get Back to Your Journey
      </h1>
      {errors.root && (
        <div className={styles.neuErrorAlert}>
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
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
              className={`${styles.neuBtnPrimary} flex w-full items-center justify-center gap-2 rounded-xl py-3 ${isSubmitting || forgotPasswordMutation.isPending ? styles.neuBtnDisabled : ''}`}
              disabled={isSubmitting || forgotPasswordMutation.isPending}
            >
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                Send Reset Code
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

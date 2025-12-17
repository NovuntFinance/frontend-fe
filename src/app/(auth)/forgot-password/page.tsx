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
        {/* Success Icon */}
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
              Check your email
            </h1>
            <p className="text-white/70">
              We&apos;ve sent password reset instructions to
              <br />
              <span className="font-medium text-white">{submittedEmail}</span>
            </p>
          </div>
        </div>

        {/* Instructions Card */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">What&apos;s next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                1
              </div>
              <p className="text-sm text-white/70">
                Check your email inbox for a message from Novunt
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                2
              </div>
              <p className="text-sm text-white/70">
                Click the reset link in the email (valid for 1 hour)
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-primary text-primary-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                3
              </div>
              <p className="text-sm text-white/70">
                Create a new strong password for your account
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70"
              size="lg"
            >
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              Didn&apos;t receive the email? Check your spam folder or try again
            </p>
          </CardFooter>
        </Card>

        {/* Resend Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              setSubmittedEmail('');
              forgotPasswordMutation.reset();
            }}
          >
            Try a different email
          </Button>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 backdrop-blur-sm">
          <Mail className="h-8 w-8 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Forgot your password?
        </h1>
        <p className="text-white/70">
          No worries! Enter your email and we&apos;ll send you reset
          instructions
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-white/70">
            Enter the email address associated with your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="relative z-10 space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email Address
              </Label>
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
          </CardContent>

          <CardFooter className="relative z-10 flex flex-col space-y-3 pt-8">
            {/* Submit Button */}
            <Button
              type="submit"
              className="from-primary to-primary/90 hover:from-primary/90 hover:to-primary w-full bg-gradient-to-r shadow-lg transition-all duration-300 hover:shadow-xl"
              size="lg"
              disabled={isSubmitting || forgotPasswordMutation.isPending}
            >
              {(isSubmitting || forgotPasswordMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Reset Link
              <Send className="ml-2 h-4 w-4" />
            </Button>

            {/* Back to Login Link */}
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Help Text */}
      <div className="text-muted-foreground text-center text-sm">
        <p>
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
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

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Gift,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  AtSign,
} from 'lucide-react';
import { NovuntSpinner } from '@/components/ui/novunt-spinner';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import { parsePhoneNumber } from 'libphonenumber-js';
import '@/styles/phone-input.css';
import {
  signupSchema,
  type SignupFormData,
  calculatePasswordStrength,
} from '@/lib/validation';
import { useSignup } from '@/lib/mutations';
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
import { EmailExistsDialog } from '@/components/auth/EmailExistsDialog';
// Turnstile disabled for signup - import removed
import { toast } from '@/components/ui/enhanced-toast';

// Disable static generation
export const dynamic = 'force-dynamic';

const STEPS = [
  { id: 1, title: 'Account Details', description: 'Create your account' },
  { id: 2, title: 'Personal Info', description: 'Tell us about yourself' },
  { id: 3, title: 'Referral & Terms', description: 'Almost done!' },
];

/**
 * Signup Page Component (wrapped in Suspense)
 * Multi-step registration form with validation
 */
function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupMutation = useSignup();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailExistsDialog, setEmailExistsDialog] = useState({
    open: false,
    email: '',
    canResetPassword: false,
  });
  // Turnstile disabled for signup - removed all Turnstile-related code

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      phoneNumber: '',
      referralCode: '',
      acceptedTerms: false,
    },
  });

  // Auto-populate referral code from URL parameter
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && refCode.trim()) {
      const trimmedCode = refCode.trim();
      const currentValue = watch('referralCode');

      // Only set if the field is empty or matches the URL parameter (user hasn't manually changed it)
      if (!currentValue || currentValue === trimmedCode) {
        console.log('[SignupPage] Found referral code in URL:', trimmedCode);
        setValue('referralCode', trimmedCode, { shouldValidate: false });

        // Show toast only once (check if we've already shown it)
        const hasShownToast = sessionStorage.getItem('referralCodeToastShown');
        if (!hasShownToast) {
          toast.success('Referral code applied!', {
            description: `The referrer will receive bonus rewards when you complete signup with code: ${trimmedCode}`,
          });
          sessionStorage.setItem('referralCodeToastShown', 'true');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setValue]);

  const password = watch('password');
  const passwordStrength = password
    ? calculatePasswordStrength(password)
    : null;

  // Handle next step
  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Get fields to validate for current step
  function getFieldsForStep(step: number): (keyof SignupFormData)[] {
    switch (step) {
      case 1:
        return ['email', 'password', 'confirmPassword'];
      case 2:
        return ['firstName', 'lastName', 'username', 'phoneNumber'];
      case 3:
        return ['referralCode', 'acceptedTerms'];
      default:
        return [];
    }
  }

  // Handle form submission
  const onSubmit = async (data: SignupFormData) => {
    try {
      // Parse phone number to extract country code
      let countryCode = '';
      let nationalNumber = '';

      try {
        const phoneNumberObj = parsePhoneNumber(data.phoneNumber);
        if (phoneNumberObj && phoneNumberObj.isValid()) {
          countryCode = phoneNumberObj.countryCallingCode;
          nationalNumber = phoneNumberObj.nationalNumber;
        } else {
          // If invalid, try manual extraction
          const match = data.phoneNumber.match(/^\+?(\d{1,3})(.+)$/);
          if (match) {
            countryCode = match[1];
            nationalNumber = match[2].replace(/\D/g, '');
          }
        }
      } catch (error) {
        console.error('Failed to parse phone number:', error);
        // If parsing fails, try to extract manually
        const match = data.phoneNumber.match(/^\+?(\d{1,3})(.+)$/);
        if (match) {
          countryCode = match[1];
          nationalNumber = match[2].replace(/\D/g, ''); // Remove non-digits
        }
      }

      // Validate phone number is not empty
      const finalPhoneNumber =
        nationalNumber || data.phoneNumber.replace(/\D/g, '');
      if (!finalPhoneNumber || finalPhoneNumber.length < 5) {
        setError('phoneNumber', {
          type: 'manual',
          message: 'Please enter a valid phone number',
        });
        return;
      }

      // Ensure country code is set
      const finalCountryCode = countryCode ? `+${countryCode}` : '+1';

      // Build cleaned payload: trim strings and omit empty optional fields
      const payload: {
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string;
        countryCode: string;
        referralCode?: string;
      } = {
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        username: data.username.trim().toLowerCase(),
        phoneNumber: finalPhoneNumber, // National number without country code
        countryCode: finalCountryCode, // Phase 1 expects "+1" format, not "1"
        ...(data.referralCode?.trim()
          ? { referralCode: data.referralCode.trim() }
          : {}),
      };

      // Final validation: ensure no empty required fields
      if (
        !payload.firstName ||
        !payload.lastName ||
        !payload.email ||
        !payload.username ||
        !payload.phoneNumber ||
        !payload.countryCode
      ) {
        console.error('[Signup] Missing required fields:', {
          hasFirstName: !!payload.firstName,
          hasLastName: !!payload.lastName,
          hasEmail: !!payload.email,
          hasUsername: !!payload.username,
          hasPhoneNumber: !!payload.phoneNumber,
          hasCountryCode: !!payload.countryCode,
        });
        toast.error('Validation Error', {
          description: 'Please fill in all required fields',
        });
        return;
      }

      // Turnstile disabled for signup - removed token
      console.log('[Signup] Sending payload:', {
        ...payload,
        password: '***',
        confirmPassword: '***',
      });

      await signupMutation.mutateAsync(payload);

      // Store user info for welcome modal after verification
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'novunt_new_user',
          JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            timestamp: Date.now(),
          })
        );
      }

      // Success - redirect to email verification
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      console.error('[Signup Error]', error);

      // Turnstile disabled for signup - removed error handling

      // Extract error response from backend
      // API client wraps errors in ApiError format, which includes field, action, canResetPassword
      let errorResponse: {
        message?: string;
        field?: string;
        action?: string;
        canResetPassword?: boolean;
      } = {};

      if (typeof error === 'object' && error !== null) {
        const err = error as {
          response?: { data?: unknown };
          message?: unknown;
          field?: string;
          action?: string;
          canResetPassword?: boolean;
        };

        // Check if error has direct fields (from ApiError wrapper)
        if (err.field || err.action) {
          errorResponse = {
            message: typeof err.message === 'string' ? err.message : undefined,
            field: err.field,
            action: err.action,
            canResetPassword: err.canResetPassword,
          };
        }
        // Try to get error data from nested response
        else if (err.response?.data && typeof err.response.data === 'object') {
          errorResponse = err.response.data as typeof errorResponse;
        }
        // Fallback to direct message
        else if (typeof err.message === 'string') {
          errorResponse.message = err.message;
        }
      }

      const message = errorResponse.message || 'Failed to create account';
      const field = errorResponse.field;
      const action = errorResponse.action;
      const canResetPassword = errorResponse.canResetPassword || false;

      // Handle email already exists - show dialog
      if (action === 'login' && field === 'email') {
        setEmailExistsDialog({
          open: true,
          email: data.email,
          canResetPassword,
        });
        return;
      }

      // Handle username already taken - highlight field
      if (
        (action === 'change_username' ||
          field === 'username' ||
          message.toLowerCase().includes('username')) &&
        (message.toLowerCase().includes('username') ||
          message.toLowerCase().includes('taken') ||
          message.toLowerCase().includes('exists'))
      ) {
        setError('username', {
          type: 'manual',
          message:
            'This username is already taken. Please choose a different one.',
        });
        toast.error('Username already taken', {
          description:
            'This username is already in use. Please choose another.',
        });
        return;
      }

      // Handle phone number already taken - highlight field
      if (
        (field === 'phoneNumber' || message.toLowerCase().includes('phone')) &&
        (message.toLowerCase().includes('phone') ||
          message.toLowerCase().includes('taken') ||
          message.toLowerCase().includes('exists'))
      ) {
        setError('phoneNumber', {
          type: 'manual',
          message:
            'This phone number is already registered. Please use a different number.',
        });
        toast.error('Phone number already registered', {
          description:
            'This phone number is already in use. Please use a different number.',
        });
        return;
      }

      // Handle other errors
      setError('root', {
        message,
      });
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create your account
        </h1>
        <p className="text-white/70">
          Join thousands of stakeholders and start earning today
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 bg-gradient-to-r p-6 shadow-lg backdrop-blur-sm">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
                className={`flex h-12 w-12 items-center justify-center rounded-full font-bold shadow-lg transition-all duration-300 ${
                  currentStep > step.id
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                    : currentStep === step.id
                      ? 'bg-blue-600 text-white ring-4 ring-blue-600/30 dark:bg-blue-500 dark:ring-blue-500/30'
                      : 'bg-muted text-muted-foreground'
                } `}
              >
                {currentStep > step.id ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  step.id
                )}
              </motion.div>
              <p className="mt-2 hidden text-center text-xs font-medium sm:block">
                {step.title}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div className="bg-muted relative mx-2 h-2 flex-1 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-500 dark:to-emerald-500"
                />
              </div>
            )}
          </div>
        ))}
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
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-white/70">
            {STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="relative z-10 space-y-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Email */}
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

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                        autoComplete="new-password"
                        {...register('password')}
                        aria-invalid={errors.password ? 'true' : 'false'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
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
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
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
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/90">
                      Username
                    </Label>
                    <div className="relative">
                      <AtSign className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        className="pl-10"
                        autoComplete="username"
                        {...register('username')}
                        aria-invalid={errors.username ? 'true' : 'false'}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-destructive text-sm">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/90">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="pl-10"
                        autoComplete="given-name"
                        {...register('firstName')}
                        aria-invalid={errors.firstName ? 'true' : 'false'}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-destructive text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/90">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="pl-10"
                        autoComplete="family-name"
                        {...register('lastName')}
                        aria-invalid={errors.lastName ? 'true' : 'false'}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-destructive text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Number (Required) */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="flex items-center gap-1 text-white/90"
                    >
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div
                      className={`bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-all focus-within:ring-2 focus-within:ring-offset-2 ${errors.phoneNumber ? 'border-destructive' : 'border-input'} `}
                    >
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            id="phoneNumber"
                            placeholder="Enter phone number"
                            value={field.value}
                            onChange={field.onChange}
                            countries={getCountries().filter(
                              (country) => country !== 'US'
                            )}
                            defaultCountry="GB"
                            international
                            countryCallingCodeEditable={false}
                            limitMaxLength={true}
                            smartCaret={true}
                          />
                        )}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-destructive text-sm">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      Required for account verification and security
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Referral & Terms */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Referral Code (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-white/90">
                      Referral Code{' '}
                      <span className="text-white/60">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <Gift className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        className="pl-10"
                        {...register('referralCode')}
                        aria-invalid={errors.referralCode ? 'true' : 'false'}
                      />
                    </div>
                    {errors.referralCode && (
                      <p className="text-destructive text-sm">
                        {errors.referralCode.message}
                      </p>
                    )}
                    <p className="text-muted-foreground text-sm">
                      {searchParams.get('ref')
                        ? `Referral code from link: ${searchParams.get('ref')} - The referrer will receive bonus rewards when you complete signup!`
                        : 'Have a referral code? Enter it to support your referrer!'}
                    </p>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="acceptedTerms"
                        className="text-primary focus:ring-primary mt-1 h-4 w-4 rounded border-gray-300"
                        {...register('acceptedTerms')}
                      />
                      <Label
                        htmlFor="acceptedTerms"
                        className="cursor-pointer text-sm leading-relaxed font-normal"
                      >
                        I agree to the{' '}
                        <Link
                          href="/terms"
                          className="text-primary font-medium hover:underline"
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href="/privacy"
                          className="text-primary font-medium hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptedTerms && (
                      <p className="text-destructive text-sm">
                        {errors.acceptedTerms.message}
                      </p>
                    )}
                  </div>

                  {/* Turnstile disabled for signup - removed widget */}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="relative z-10 flex flex-col space-y-3 pt-8">
            {/* Navigation Buttons */}
            <div className="flex w-full gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 border-white/20 bg-white/5 text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 font-bold text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/70 active:scale-[0.98]"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 font-bold text-white shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/70 active:scale-[0.98]"
                  size="lg"
                  disabled={isSubmitting || signupMutation.isPending}
                >
                  {(isSubmitting || signupMutation.isPending) && (
                    <NovuntSpinner size="sm" className="mr-2" />
                  )}
                  Create Account
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Sign In Link */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm backdrop-blur-sm">
        <span className="text-white/70">Already have an account? </span>
        <Link
          href="/login"
          className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          Sign in
        </Link>
      </div>

      {/* Email Exists Dialog */}
      <EmailExistsDialog
        open={emailExistsDialog.open}
        onClose={() =>
          setEmailExistsDialog({
            open: false,
            email: '',
            canResetPassword: false,
          })
        }
        email={emailExistsDialog.email}
        canResetPassword={emailExistsDialog.canResetPassword}
        onLogin={() => {
          router.push(
            `/login?email=${encodeURIComponent(emailExistsDialog.email)}`
          );
          setEmailExistsDialog({
            open: false,
            email: '',
            canResetPassword: false,
          });
        }}
        onResetPassword={() => {
          router.push(
            `/forgot-password?email=${encodeURIComponent(emailExistsDialog.email)}`
          );
          setEmailExistsDialog({
            open: false,
            email: '',
            canResetPassword: false,
          });
        }}
      />
    </div>
  );
}

/**
 * Signup Page - Wrapped with Suspense for useSearchParams
 */
export default function SignupPage() {
  return (
    <Suspense fallback={<NovuntSpinner size="lg" />}>
      <SignupPageContent />
    </Suspense>
  );
}

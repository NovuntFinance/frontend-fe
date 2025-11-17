/**
 * Validation Schemas using Zod
 * Form validation for authentication flows - BetterAuth Aligned
 */

import { z } from 'zod';

// ============================================
// PASSWORD VALIDATION - BetterAuth Requirements
// ============================================
// Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@_$!%*?&])[A-Za-z\d@_$!%*?&]{8,}$
// Requirements:
// - Minimum 8 characters
// - At least one lowercase letter
// - At least one uppercase letter  
// - At least one digit
// - At least one special character (@_$!%*?&)

const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  allowedSpecialChars: '@_$!%*?&',
};

// Phase 1: Accept any special character (not just @_$!%*?&)
// Backend checks for "special character" but doesn't restrict which ones
export const passwordSchema = z
  .string()
  .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// ============================================
// LOGIN SCHEMA
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// SIGNUP SCHEMA
// ============================================

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can include letters, numbers, dots, underscores, and hyphens'),
    email: z.string().email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    phoneNumber: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid international phone number with country code'),
    referralCode: z
      .string()
      .min(6, 'Referral code must be at least 6 characters')
      .optional()
      .or(z.literal('')),
    acceptedTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ============================================
// EMAIL VERIFICATION SCHEMA
// ============================================

export const verifyEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^[0-9]+$/, 'Verification code must contain only numbers'),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// ============================================
// FORGOT PASSWORD SCHEMA
// ============================================

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================
// RESET PASSWORD SCHEMA
// ============================================

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// TWO FACTOR AUTHENTICATION SCHEMA
// ============================================

export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Authentication code must be 6 digits')
    .regex(/^[0-9]+$/, 'Authentication code must contain only numbers'),
  trustDevice: z.boolean().optional(),
});

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

// ============================================
// PASSWORD STRENGTH CALCULATOR
// ============================================

export interface PasswordStrength {
  score: number; // 0-4
  text: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      text: 'Very Weak',
      color: 'red',
      suggestions: ['Password is required'],
    };
  }

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  else suggestions.push('Use at least 12 characters for better security');

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else suggestions.push('Include both uppercase and lowercase letters');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Include special characters (!@#$%^&*)');

  // Penalize common patterns
  if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid using only letters or only numbers');
  }

  // Penalize sequential characters
  if (/abc|bcd|cde|123|234|345/i.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Avoid sequential characters');
  }

  // Determine text and color
  const strength: PasswordStrength = {
    score: Math.min(score, 4),
    text: 'Very Weak',
    color: '#ef4444',
    suggestions,
  };

  if (score <= 1) {
    strength.text = 'Very Weak';
    strength.color = '#ef4444'; // red
  } else if (score === 2) {
    strength.text = 'Weak';
    strength.color = '#f97316'; // orange
  } else if (score === 3) {
    strength.text = 'Fair';
    strength.color = '#f59e0b'; // amber
  } else if (score === 4) {
    strength.text = 'Strong';
    strength.color = '#22c55e'; // green
  } else if (score >= 5) {
    strength.text = 'Very Strong';
    strength.color = '#10b981'; // emerald
  }

  return strength;
}

// ============================================
// EMAIL VALIDATION
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

export function isValidPhoneNumber(phone: string): boolean {
  // International phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

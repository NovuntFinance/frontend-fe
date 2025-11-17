'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TwoFactorInputProps {
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  isLoading?: boolean;
  error?: string;
  length?: number;
  disabled?: boolean;
}

/**
 * Two-Factor Authentication Input Component
 * Features:
 * - 6-digit code input
 * - Auto-focus next input
 * - Paste support
 * - Auto-submit when complete
 * - Loading state
 * - Error handling
 */
export function TwoFactorInput({
  value,
  onChange,
  onComplete,
  isLoading = false,
  error,
  length = 6,
  disabled = false,
}: TwoFactorInputProps) {
  const [internalCode, setInternalCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Support controlled mode
  const code = value ? value.split('').concat(Array(length).fill('')).slice(0, length) : internalCode;
  const setCode = (newCode: string[]) => {
    const codeString = newCode.join('');
    if (onChange) {
      onChange(codeString);
    } else {
      setInternalCode(newCode);
    }
  };

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newCode.every((digit) => digit !== '') && !isLoading && !disabled && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  // Handle keydown
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow keys navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (!/^\d+$/.test(pastedData)) return; // Only numbers

    const digits = pastedData.slice(0, length).split('');
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < length) {
        newCode[index] = digit;
      }
    });

    setCode(newCode);

    // Focus last filled input or last input
    const lastFilledIndex = Math.min(digits.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Auto-submit if complete
    if (newCode.every((digit) => digit !== '') && !isLoading && !disabled && onComplete) {
      onComplete(newCode.join(''));
    }
  };

  // Clear code
  const handleClear = () => {
    setCode(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Code Input */}
      <div className="flex gap-2 sm:gap-3 justify-center">
        {code.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`
              w-12 h-14 sm:w-14 sm:h-16
              text-center text-2xl font-bold
              border-2 rounded-lg
              transition-all duration-200
              ${
                digit
                  ? 'border-primary bg-primary/5'
                  : 'border-input bg-background'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={`Digit ${index + 1}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      {onComplete && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => onComplete(code.join(''))}
            disabled={code.some((digit) => !digit) || isLoading || disabled}
            className="w-full"
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>

          <Button
            onClick={handleClear}
            variant="outline"
            disabled={isLoading || disabled}
            className="w-full"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Help Text */}
      <p className="text-sm text-center text-muted-foreground">
        Can&apos;t find your code?{' '}
        <button className="text-primary hover:underline font-medium">
          Need help?
        </button>
      </p>
    </div>
  );
}

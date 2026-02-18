'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import styles from '@/styles/auth.module.css';

export interface NeuFieldProps {
  id: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: { message?: string };
  register: ReturnType<typeof import('react-hook-form').useForm>['register'];
  registerName: string;
  delay?: number;
  children?: React.ReactNode;
  hint?: string;
}

export function NeuField({
  id,
  label,
  icon: Icon,
  type = 'text',
  autoComplete,
  error,
  register,
  registerName,
  delay = 0,
  children,
  hint,
}: NeuFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="space-y-1.5"
    >
      <div className={styles.neuInputIconWrap}>
        <Icon className={styles.neuInputIcon} />
        <input
          id={id}
          type={type}
          placeholder={label}
          autoComplete={autoComplete}
          className={`${styles.neuInput} ${error ? styles.neuInputError : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-label={label}
          {...register(registerName)}
        />
        {children}
      </div>
      {error?.message && (
        <p className={styles.neuFieldError}>{error.message}</p>
      )}
      {hint && <p className={`text-xs ${styles.neuTextMuted}`}>{hint}</p>}
    </motion.div>
  );
}

export interface NeuPasswordFieldProps
  extends Omit<NeuFieldProps, 'icon' | 'type' | 'children'> {
  showPassword: boolean;
  onToggle: () => void;
  strengthIndicator?: React.ReactNode;
}

export function NeuPasswordField({
  showPassword,
  onToggle,
  strengthIndicator,
  ...rest
}: NeuPasswordFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rest.delay || 0, duration: 0.3, ease: 'easeOut' }}
      className="space-y-1.5"
    >
      <NeuField {...rest} icon={Lock} type={showPassword ? 'text' : 'password'}>
        <button
          type="button"
          onClick={onToggle}
          className={styles.neuInputToggle}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-[1.125rem] w-[1.125rem]" />
          ) : (
            <Eye className="h-[1.125rem] w-[1.125rem]" />
          )}
        </button>
      </NeuField>
      {strengthIndicator}
    </motion.div>
  );
}

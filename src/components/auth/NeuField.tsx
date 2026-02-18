'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import type { FieldValues, Path, UseFormRegister } from 'react-hook-form';
import styles from '@/styles/auth.module.css';

export interface NeuFieldProps<T extends FieldValues = FieldValues> {
  id: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: { message?: string };
  register: UseFormRegister<T>;
  registerName: Path<T>;
  delay?: number;
  children?: React.ReactNode;
  hint?: string;
}

export function NeuField<T extends FieldValues = FieldValues>({
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
}: NeuFieldProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="space-y-2"
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
          {...register(registerName as Path<T>)}
        />
        {children}
      </div>
      {error?.message && (
        <p className={styles.neuFieldError}>{error.message}</p>
      )}
      {hint && <p className={`mt-1 text-xs ${styles.neuTextMuted}`}>{hint}</p>}
    </motion.div>
  );
}

export interface NeuPasswordFieldProps<T extends FieldValues = FieldValues>
  extends Omit<NeuFieldProps<T>, 'icon' | 'type' | 'children'> {
  showPassword: boolean;
  onToggle: () => void;
  strengthIndicator?: React.ReactNode;
}

export function NeuPasswordField<T extends FieldValues = FieldValues>({
  showPassword,
  onToggle,
  strengthIndicator,
  ...rest
}: NeuPasswordFieldProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rest.delay || 0, duration: 0.3, ease: 'easeOut' }}
      className="space-y-2"
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
      {strengthIndicator && <div className="mt-2">{strengthIndicator}</div>}
    </motion.div>
  );
}

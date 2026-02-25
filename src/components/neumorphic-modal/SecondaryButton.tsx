'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NEU_TOKENS, neuRaised } from './tokens';

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Secondary action (Cancel / Back): text link or subtle raised, white60.
 */
export function SecondaryButton({
  children,
  className,
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'text-center text-sm font-medium transition-opacity hover:opacity-90',
        className
      )}
      style={{ color: NEU_TOKENS.white60 }}
      {...props}
    >
      {children}
    </button>
  );
}

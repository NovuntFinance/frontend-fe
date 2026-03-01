'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NEU_TOKENS } from './tokens';

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Secondary action (Cancel / Back): theme-aware text so it's visible in both
 * light and dark mode (primary text = dark on light bg, light on dark bg).
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
      style={{ color: NEU_TOKENS.white80 }}
      {...props}
    >
      {children}
    </button>
  );
}

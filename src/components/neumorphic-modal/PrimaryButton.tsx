'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NEU_TOKENS, neuRaised } from './tokens';

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * Primary action button: neumorphic raised, accent color, same hover/press as Stakes modal.
 */
export function PrimaryButton({
  children,
  loading,
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button
      type="button"
      className={cn(
        'neu-btn-primary h-12 w-full border-0 font-bold tracking-wide uppercase',
        className
      )}
      style={{
        background: NEU_TOKENS.bg,
        color: NEU_TOKENS.accent,
        boxShadow: neuRaised,
      }}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

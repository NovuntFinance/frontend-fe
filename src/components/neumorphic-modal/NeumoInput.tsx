'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { NEU_TOKENS } from './tokens';

export interface NeumoInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  /** Optional helper text below input */
  helper?: React.ReactNode;
  /** Error message (same placement/typography as Stakes modal) */
  error?: string;
  /** Right-side slot (e.g. MAX link, icon) */
  rightSlot?: React.ReactNode;
  /** Use transparent inner style (no border/background) for amount-in-group inputs */
  inner?: boolean;
}

/**
 * Label + input with neumorphic styling. Use className "neu-input" (and "neu-input-inner" if inner).
 */
export function NeumoInput({
  label,
  helper,
  error,
  rightSlot,
  inner,
  id,
  className,
  ...inputProps
}: NeumoInputProps) {
  const inputId = id ?? label.replace(/\s/g, '-').toLowerCase();
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: NEU_TOKENS.white60 }}
        >
          {label}
        </Label>
        {rightSlot}
      </div>
      <Input
        id={inputId}
        className={cn(
          'neu-input border-0 focus-visible:ring-0',
          inner && 'neu-input-inner',
          className
        )}
        {...inputProps}
      />
      {helper && (
        <p className="text-xs" style={{ color: NEU_TOKENS.white60 }}>
          {helper}
        </p>
      )}
      {error && <p className="neu-error text-xs font-medium">{error}</p>}
    </div>
  );
}

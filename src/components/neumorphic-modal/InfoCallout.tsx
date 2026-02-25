'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NEU_TOKENS, neuInset, neuRaised, neuRadius } from './tokens';

export interface InfoCalloutProps {
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  /** Optional badge (e.g. "Secure lock") - shown top-right on lg. style overrides default green. */
  badge?: { label: string; className?: string; style?: React.CSSProperties };
  /** Override border color (e.g. for warning/amber) */
  borderColor?: string;
  className?: string;
}

const defaultBadgeStyle: React.CSSProperties = {
  background: 'rgba(34, 197, 94, 0.2)',
  color: '#4ade80',
  border: '1px solid rgba(34, 197, 94, 0.35)',
};

/**
 * Neumorphic inset block for info (e.g. Guaranteed Returns, limits, network).
 */
export function InfoCallout({
  icon,
  title,
  description,
  badge,
  borderColor,
  className,
}: InfoCalloutProps) {
  const insetStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuInset,
    border: `1px solid ${borderColor ?? NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };
  const raisedStyle: React.CSSProperties = {
    background: NEU_TOKENS.bg,
    boxShadow: neuRaised,
    border: `1px solid ${NEU_TOKENS.border}`,
    borderRadius: neuRadius.md,
  };

  return (
    <div
      className={cn('relative rounded-xl p-4 lg:p-5', className)}
      style={insetStyle}
    >
      {badge && (
        <div className="absolute top-3 right-3 hidden lg:block">
          <span
            className={cn(
              'rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase',
              badge.className
            )}
            style={badge.style ?? defaultBadgeStyle}
          >
            {badge.label}
          </span>
        </div>
      )}
      <div className={cn('flex items-start gap-3', badge && 'pr-0 lg:pr-24')}>
        {icon && (
          <div
            className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg"
            style={raisedStyle}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4
            className="text-sm font-bold"
            style={{ color: NEU_TOKENS.white80 }}
          >
            {title}
          </h4>
          <div
            className="mt-1 text-xs leading-relaxed"
            style={{ color: NEU_TOKENS.white60 }}
          >
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

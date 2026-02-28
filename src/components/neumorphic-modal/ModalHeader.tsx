'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NEU_TOKENS, neuSpacing } from './tokens';

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Disable close button (e.g. during submit) */
  disableClose?: boolean;
  /** Subtitle hidden on small screens, shown on lg (matches Stakes modal) */
  subtitleHiddenOnMobile?: boolean;
  className?: string;
}

/**
 * Modal header: title (accent), optional subtitle (white60), close button (neumorphic).
 */
export function ModalHeader({
  title,
  subtitle,
  onClose,
  disableClose,
  subtitleHiddenOnMobile = true,
  className,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8',
        className
      )}
      style={{ paddingBottom: neuSpacing.mobile }}
    >
      <div>
        <h2
          className="text-lg font-bold sm:text-xl lg:text-2xl"
          style={{ color: NEU_TOKENS.accent }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              'mt-0.5 text-sm',
              subtitleHiddenOnMobile && 'hidden lg:block'
            )}
            style={{ color: NEU_TOKENS.white60 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="neu-close-btn flex size-9 flex-shrink-0 items-center justify-center lg:size-10"
        disabled={disableClose}
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

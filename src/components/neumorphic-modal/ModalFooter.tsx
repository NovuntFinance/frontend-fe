'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Footer area for primary + secondary actions (same spacing as Stakes modal).
 */
export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex flex-col gap-3 pt-2', className)}>{children}</div>
  );
}

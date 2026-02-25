'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal body: consistent padding and vertical spacing (space-y-4 sm:space-y-5 lg:space-y-6).
 */
export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        'space-y-4 px-4 pb-4 sm:space-y-5 sm:px-6 sm:pb-6 lg:space-y-6 lg:px-8 lg:pb-8',
        'max-h-[calc(100vh-12rem)] overflow-y-auto lg:max-h-none lg:overflow-visible',
        className
      )}
    >
      {children}
    </div>
  );
}

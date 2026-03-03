'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { RegistrationBonusBanner } from './RegistrationBonusBanner';
import { cn } from '@/lib/utils';

interface RegistrationBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const neuRadius = { sm: '16px', md: '18px', lg: '24px' };

/**
 * Registration Bonus as a modal – neumorphic, mobile-first.
 * Renders the same content as RegistrationBonusBanner inside a dialog.
 */
export function RegistrationBonusModal({
  isOpen,
  onClose,
}: RegistrationBonusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'reg-bonus-neu-modal',
          'border-0 p-0 shadow-none',
          /* Mobile-first: safe-area aware, max 460px */
          'max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)]',
          'w-[calc(100vw-2rem)] max-w-[460px]',
          /* Scrollable */
          'overflow-x-hidden overflow-y-auto overscroll-contain',
          '-webkit-overflow-scrolling-touch',
          /* Animations */
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:duration-200 data-[state=open]:duration-300',
          /* Thin scrollbar */
          '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10'
        )}
        style={{
          background: 'var(--neu-modal-bg)',
          boxShadow: 'var(--neu-shadow-raised)',
          border: '1px solid var(--neu-border)',
          borderRadius: neuRadius.lg,
        }}
      >
        <DialogTitle className="sr-only">Registration Bonus</DialogTitle>
        <RegistrationBonusBanner onClose={onClose} defaultExpanded />
      </DialogContent>
    </Dialog>
  );
}

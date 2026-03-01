'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { RegistrationBonusBanner } from './RegistrationBonusBanner';

interface RegistrationBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Registration Bonus as a modal. Renders the same content as RegistrationBonusBanner
 * inside a dialog. The "10% bonus" button should open this modal.
 */
export function RegistrationBonusModal({
  isOpen,
  onClose,
}: RegistrationBonusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[calc(100%-1rem)] sm:max-w-lg md:max-w-xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Registration Bonus</DialogTitle>
        <RegistrationBonusBanner onClose={onClose} defaultExpanded />
      </DialogContent>
    </Dialog>
  );
}

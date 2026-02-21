'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
        className="max-h-[90vh] max-w-[calc(100%-1rem)] overflow-y-auto sm:max-w-lg md:max-w-xl"
        showCloseButton
      >
        <RegistrationBonusBanner onClose={onClose} defaultExpanded />
      </DialogContent>
    </Dialog>
  );
}

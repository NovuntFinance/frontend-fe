/**
 * Large Withdrawal Confirmation Dialog
 * Shows confirmation modal for withdrawals exceeding $1,000
 */

import React, { useState } from 'react';
import { CriticalActionDialog } from './CriticalActionDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface LargeWithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  walletAddress: string;
  estimatedFees?: number;
  requires2FA?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function LargeWithdrawalDialog({
  open,
  onOpenChange,
  amount,
  walletAddress,
  estimatedFees = 0,
  requires2FA = false,
  onConfirm,
  onCancel,
}: LargeWithdrawalDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText.toUpperCase() === 'CONFIRM';

  const finalAmount = amount - estimatedFees;

  const details = [
    {
      label: 'Withdrawal Amount',
      value: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: 'Network Fees',
      value: `$${estimatedFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: 'You Will Receive',
      value: `$${finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      label: 'Destination',
      value: `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`,
    },
  ];

  if (requires2FA) {
    details.push({ label: '2FA Required', value: 'Yes' });
  }

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmText(''); // Reset for next time
    }
  };

  const handleCancel = () => {
    setConfirmText(''); // Reset
    onCancel?.();
  };

  return (
    <CriticalActionDialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setConfirmText('');
        }
        onOpenChange(newOpen);
      }}
      type="warning"
      title="Confirm Large Withdrawal"
      description="You are about to withdraw a large amount. Please review the details carefully before confirming."
      details={details}
      confirmText="Proceed with Withdrawal"
      cancelText="Cancel"
      onConfirm={isConfirmed ? handleConfirm : undefined}
      onCancel={handleCancel}
    >
      {/* Explicit Confirmation Input */}
      <div className="space-y-2">
        <Label htmlFor="confirm-text" className="text-sm font-medium">
          Type <span className="font-bold">CONFIRM</span> to proceed
        </Label>
        <Input
          id="confirm-text"
          type="text"
          placeholder="Type CONFIRM"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className={`${
            confirmText && !isConfirmed
              ? 'border-red-500 focus-visible:ring-red-500'
              : isConfirmed
                ? 'border-green-500 focus-visible:ring-green-500'
                : ''
          }`}
        />
      </div>
    </CriticalActionDialog>
  );
}

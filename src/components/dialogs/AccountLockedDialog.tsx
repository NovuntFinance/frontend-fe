/**
 * Account Locked Dialog
 * Shows when user's account has been locked
 */

import React from 'react';
import { CriticalActionDialog } from './CriticalActionDialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export interface AccountLockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?:
    | 'too_many_attempts'
    | 'suspicious_activity'
    | 'security_review'
    | 'other';
  lockDuration?: string; // e.g., "24 hours", "permanently"
  supportEmail?: string;
  supportPhone?: string;
}

const reasonMessages = {
  too_many_attempts:
    'Your account has been temporarily locked due to too many failed login attempts.',
  suspicious_activity:
    'Your account has been locked due to suspicious activity detected on your account.',
  security_review:
    'Your account is under security review. This is a temporary measure to protect your funds.',
  other: 'Your account has been locked for security reasons.',
};

const nextSteps = {
  too_many_attempts:
    'Please wait for the lock period to expire, or reset your password to unlock immediately.',
  suspicious_activity:
    'Please contact our support team immediately to verify your identity and unlock your account.',
  security_review:
    'Our security team will review your account within 24-48 hours. You will be notified via email.',
  other: 'Please contact support for assistance.',
};

export function AccountLockedDialog({
  open,
  onOpenChange,
  reason = 'other',
  lockDuration,
  supportEmail = 'support@novunt.com',
  supportPhone,
}: AccountLockedDialogProps) {
  const details = lockDuration
    ? [{ label: 'Lock Duration', value: lockDuration }]
    : undefined;

  return (
    <CriticalActionDialog
      open={open}
      onOpenChange={onOpenChange}
      type="error"
      title="Account Locked"
      description={reasonMessages[reason]}
      details={details}
      confirmText="I Understand"
      showCancel={false}
      onConfirm={() => onOpenChange(false)}
    >
      {/* Next Steps */}
      <div className="space-y-4">
        <div className="bg-muted border-border rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-semibold">Next Steps:</h4>
          <p className="text-muted-foreground text-xs">{nextSteps[reason]}</p>
        </div>

        {/* Support Contact */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Need Help?</h4>
          <div className="flex flex-col gap-2">
            <Link href={`mailto:${supportEmail}`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Support: {supportEmail}
              </Button>
            </Link>
            {supportPhone && (
              <Link href={`tel:${supportPhone}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Support: {supportPhone}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Password Reset Option for too many attempts */}
        {reason === 'too_many_attempts' && (
          <Link href="/forgot-password" className="block">
            <Button variant="default" size="sm" className="w-full">
              Reset Password Now
            </Button>
          </Link>
        )}
      </div>
    </CriticalActionDialog>
  );
}

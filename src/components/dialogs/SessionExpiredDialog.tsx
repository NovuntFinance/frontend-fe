/**
 * Session Expired Dialog
 * Shows when user's session has expired
 */

import React, { useState, useEffect } from 'react';
import { CriticalActionDialog } from './CriticalActionDialog';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

export interface SessionExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoRedirectSeconds?: number; // Auto-redirect countdown (default: 5)
  redirectPath?: string; // Where to redirect (default: /login)
  onRedirect?: () => void; // Callback before redirect
}

export function SessionExpiredDialog({
  open,
  onOpenChange,
  autoRedirectSeconds = 5,
  redirectPath = '/login',
  onRedirect,
}: SessionExpiredDialogProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(autoRedirectSeconds);

  useEffect(() => {
    if (!open) {
      setCountdown(autoRedirectSeconds);
      return;
    }

    if (countdown <= 0) {
      handleRedirect();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [open, countdown, autoRedirectSeconds]);

  const handleRedirect = () => {
    onRedirect?.();
    // Get current path to redirect back after login
    const currentPath = window.location.pathname;
    const returnUrl =
      currentPath !== '/login'
        ? `?redirect=${encodeURIComponent(currentPath)}`
        : '';
    router.push(`${redirectPath}${returnUrl}`);
    onOpenChange(false);
  };

  const handleManualRedirect = () => {
    handleRedirect();
  };

  return (
    <CriticalActionDialog
      open={open}
      onOpenChange={onOpenChange}
      type="warning"
      title="Session Expired"
      description="Your session has expired due to inactivity. Please log in again to continue."
      confirmText={`Login Now ${countdown > 0 ? `(${countdown}s)` : ''}`}
      showCancel={false}
      onConfirm={handleManualRedirect}
    >
      {/* Auto-redirect countdown */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          {countdown > 0 ? (
            <>
              Redirecting to login in <strong>{countdown}</strong> second
              {countdown !== 1 ? 's' : ''}...
            </>
          ) : (
            'Redirecting now...'
          )}
        </AlertDescription>
      </Alert>

      {/* Security tip */}
      <div className="text-muted-foreground bg-muted/50 mt-2 rounded-lg p-3 text-xs">
        <strong>Security Tip:</strong> Your session expires after a period of
        inactivity to protect your account.
      </div>
    </CriticalActionDialog>
  );
}

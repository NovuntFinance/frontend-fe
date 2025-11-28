/**
 * Global Modals Provider
 * Provides session expired and account locked modals globally
 */

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SessionExpiredDialog } from '@/components/dialogs/SessionExpiredDialog';
import { AccountLockedDialog } from '@/components/dialogs/AccountLockedDialog';

interface GlobalModalsContextType {
  showSessionExpired: (redirectPath?: string) => void;
  showAccountLocked: (
    reason?:
      | 'too_many_attempts'
      | 'suspicious_activity'
      | 'security_review'
      | 'other',
    lockDuration?: string
  ) => void;
}

const GlobalModalsContext = createContext<GlobalModalsContextType | undefined>(
  undefined
);

export function useGlobalModals() {
  const context = useContext(GlobalModalsContext);
  if (!context) {
    throw new Error('useGlobalModals must be used within GlobalModalsProvider');
  }
  return context;
}

interface GlobalModalsProviderProps {
  children: ReactNode;
}

export function GlobalModalsProvider({ children }: GlobalModalsProviderProps) {
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [sessionExpiredRedirect, setSessionExpiredRedirect] =
    useState('/login');

  const [accountLockedOpen, setAccountLockedOpen] = useState(false);
  const [accountLockedReason, setAccountLockedReason] = useState<
    'too_many_attempts' | 'suspicious_activity' | 'security_review' | 'other'
  >('other');
  const [accountLockedDuration, setAccountLockedDuration] = useState<
    string | undefined
  >();

  const showSessionExpired = (redirectPath = '/login') => {
    setSessionExpiredRedirect(redirectPath);
    setSessionExpiredOpen(true);
  };

  const showAccountLocked = (
    reason:
      | 'too_many_attempts'
      | 'suspicious_activity'
      | 'security_review'
      | 'other' = 'other',
    lockDuration?: string
  ) => {
    setAccountLockedReason(reason);
    setAccountLockedDuration(lockDuration);
    setAccountLockedOpen(true);
  };

  return (
    <GlobalModalsContext.Provider
      value={{ showSessionExpired, showAccountLocked }}
    >
      {children}

      <SessionExpiredDialog
        open={sessionExpiredOpen}
        onOpenChange={setSessionExpiredOpen}
        redirectPath={sessionExpiredRedirect}
      />

      <AccountLockedDialog
        open={accountLockedOpen}
        onOpenChange={setAccountLockedOpen}
        reason={accountLockedReason}
        lockDuration={accountLockedDuration}
      />
    </GlobalModalsContext.Provider>
  );
}

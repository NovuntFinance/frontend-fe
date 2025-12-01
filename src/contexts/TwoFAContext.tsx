'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { TwoFAInputModal } from '@/components/admin/TwoFAInputModal';

interface TwoFAContextType {
  twoFACode: string | null;
  set2FACode: (code: string | null) => void;
  promptFor2FA: () => Promise<string | null>;
  clear2FA: () => void;
  isPrompting: boolean;
}

const TwoFAContext = createContext<TwoFAContextType | undefined>(undefined);

export function TwoFAProvider({ children }: { children: ReactNode }) {
  const [twoFACode, set2FACode] = useState<string | null>(null);
  const [isPrompting, setIsPrompting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const resolveRef = useRef<((value: string | null) => void) | null>(null);
  const rejectRef = useRef<((reason?: any) => void) | null>(null);

  const promptFor2FA = useCallback((): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      // Store resolve/reject so we can call them when modal confirms/cancels
      resolveRef.current = resolve;
      rejectRef.current = reject;
      setIsPrompting(true);
      setIsModalOpen(true);

      if (process.env.NODE_ENV === 'development') {
        console.log('[TwoFAContext] Opening 2FA modal...');
      }
    });
  }, []);

  const handleModalConfirm = useCallback((code: string) => {
    set2FACode(code);
    setIsPrompting(false);
    setIsModalOpen(false);
    if (resolveRef.current) {
      resolveRef.current(code);
      resolveRef.current = null;
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setIsPrompting(false);
    setIsModalOpen(false);
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
    if (rejectRef.current) {
      rejectRef.current(new Error('2FA prompt cancelled'));
      rejectRef.current = null;
    }
  }, []);

  const clear2FA = useCallback(() => {
    set2FACode(null);
  }, []);

  return (
    <TwoFAContext.Provider
      value={{
        twoFACode,
        set2FACode,
        promptFor2FA,
        clear2FA,
        isPrompting,
      }}
    >
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ display: 'none' }}>
          Modal State: {isModalOpen ? 'OPEN' : 'CLOSED'} | Prompting:{' '}
          {isPrompting ? 'YES' : 'NO'}
        </div>
      )}
      <TwoFAInputModal
        open={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title="Two-Factor Authentication Required"
        description="Enter the 6-digit code from your authenticator app to continue with this admin operation"
      />
    </TwoFAContext.Provider>
  );
}

export function use2FA() {
  const context = useContext(TwoFAContext);
  if (!context) {
    throw new Error('use2FA must be used within TwoFAProvider');
  }
  return context;
}

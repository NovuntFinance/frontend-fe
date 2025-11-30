'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

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

  const promptFor2FA = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      setIsPrompting(true);
      // This will be handled by the TwoFAInputModal component
      // For now, use a simple prompt (can be replaced with modal)
      const code = prompt('Enter 2FA code from your authenticator app:');
      setIsPrompting(false);
      if (code && code.length === 6) {
        set2FACode(code);
        resolve(code);
      } else {
        resolve(null);
      }
    });
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

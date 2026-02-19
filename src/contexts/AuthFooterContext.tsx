'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthFooterContextType {
  footerContent: ReactNode | null;
  setFooterContent: (content: ReactNode | null) => void;
}

const AuthFooterContext = createContext<AuthFooterContextType | undefined>(
  undefined
);

export function AuthFooterProvider({ children }: { children: ReactNode }) {
  const [footerContent, setFooterContent] = useState<ReactNode | null>(null);

  return (
    <AuthFooterContext.Provider value={{ footerContent, setFooterContent }}>
      {children}
    </AuthFooterContext.Provider>
  );
}

export function useAuthFooter() {
  const context = useContext(AuthFooterContext);
  if (!context) {
    throw new Error('useAuthFooter must be used within AuthFooterProvider');
  }
  return context;
}

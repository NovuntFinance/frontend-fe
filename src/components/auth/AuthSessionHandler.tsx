'use client';

/**
 * AuthSessionHandler – Listens for session-lost events from API interceptor.
 * Uses router.replace() instead of window.location to avoid full page reload
 * and prevent login loop (per FRONTEND_AUTH_HANDOFF.md).
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthSessionHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleSessionLost = () => {
      router.replace('/login?reason=session_expired');
    };
    window.addEventListener('auth:session-lost', handleSessionLost);
    return () =>
      window.removeEventListener('auth:session-lost', handleSessionLost);
  }, [router]);

  return null;
}

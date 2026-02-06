'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * UI abuse prevention: disables repeated submissions and enforces a cooldown.
 * Does not replace server-side rate limiting or validation.
 *
 * @param cooldownMs - Minimum time between submissions (default 1500)
 * @returns [isSubmitting, guardSubmit] - guardSubmit wraps an async submit fn and prevents double-fires
 */
export function useSubmitGuard(
  cooldownMs: number = 1500
): [
  isSubmitting: boolean,
  guardSubmit: <T>(fn: () => Promise<T>) => Promise<T | undefined>,
] {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);
  const inFlight = useRef<boolean>(false);

  const guardSubmit = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
      const now = Date.now();
      if (inFlight.current || now - lastSubmitTime.current < cooldownMs) {
        return undefined;
      }
      inFlight.current = true;
      lastSubmitTime.current = now;
      setIsSubmitting(true);
      try {
        return await fn();
      } finally {
        inFlight.current = false;
        setIsSubmitting(false);
      }
    },
    [cooldownMs]
  );

  return [isSubmitting, guardSubmit];
}

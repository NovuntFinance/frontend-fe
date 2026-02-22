/**
 * Hook for OTP request cooldown (waitSeconds from backend)
 * When backend returns cooldown error: { success: false, waitSeconds: 45 }
 * Use triggerCooldown(error) and show "Resend in Xs" until countdown ends
 */
import { useState, useEffect, useCallback } from 'react';

export function useOtpCooldown() {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const triggerCooldown = useCallback((error: unknown): boolean => {
    const err = error as {
      response?: { data?: { waitSeconds?: number } };
      waitSeconds?: number;
    };
    const waitSeconds =
      err?.response?.data?.waitSeconds ?? err?.waitSeconds;
    if (typeof waitSeconds === 'number' && waitSeconds > 0) {
      setCooldownSeconds(waitSeconds);
      return true;
    }
    return false;
  }, []);

  const resetCooldown = useCallback(() => setCooldownSeconds(0), []);

  return {
    cooldownSeconds,
    isOnCooldown: cooldownSeconds > 0,
    triggerCooldown,
    resetCooldown,
  };
}

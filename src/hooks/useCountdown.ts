/**
 * Countdown Timer Hook
 * Manages countdown timer logic for registration bonus deadline
 */

import { useState, useEffect, useRef } from 'react';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
}

/**
 * Custom hook for countdown timer
 * @param deadline - ISO 8601 date string
 * @param initialTimeRemaining - Initial time remaining in milliseconds
 * @returns Countdown values and expired status
 */
export function useCountdown(
  deadline: string,
  initialTimeRemaining: number
): CountdownResult {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
  const [isExpired, setIsExpired] = useState(initialTimeRemaining <= 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset when deadline or initial time changes
    setTimeRemaining(initialTimeRemaining);
    setIsExpired(initialTimeRemaining <= 0);
  }, [initialTimeRemaining, deadline]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Update every second
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          setIsExpired(true);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining]);

  // Calculate time units
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  const totalSeconds = Math.floor(timeRemaining / 1000);

  return {
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalSeconds: Math.max(0, totalSeconds),
    isExpired,
  };
}


'use client';

import { useState, useEffect } from 'react';
import { rosApi, TodayRosData } from '@/services/rosApi';

interface UseTodayRosReturn {
  data: TodayRosData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch today's ROS percentage for stakeholders
 *
 * Uses the user-facing endpoint: GET /api/v1/ros/today
 * No 2FA required - uses regular user authentication token
 *
 * @param autoFetch - Whether to fetch automatically on mount (default: true)
 * @returns {UseTodayRosReturn} Today's ROS data, loading state, error, and refetch function
 */
export function useTodayRos(autoFetch: boolean = true): UseTodayRosReturn {
  const [data, setData] = useState<TodayRosData | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchTodayRos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await rosApi.getTodayRos();
      setData(result);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch today's ROS");
      setError(error);
      setData(null);
      console.error("[useTodayRos] Error fetching today's ROS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchTodayRos();
    }
  }, [autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchTodayRos,
  };
}

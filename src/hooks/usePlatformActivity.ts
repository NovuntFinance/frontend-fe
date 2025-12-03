/**
 * React Hook for Platform Activity
 * Fetches and polls platform activities from backend
 */

import { useState, useEffect, useCallback } from 'react';
import { PlatformActivityService } from '@/services/platformActivityApi';
import type {
  PlatformActivity,
  PlatformActivityType,
} from '@/types/platformActivity';

interface UsePlatformActivityOptions {
  limit?: number;
  types?: PlatformActivityType[];
  pollInterval?: number; // Polling interval in ms (default: 30000 = 30 seconds)
  enabled?: boolean; // Enable/disable polling (default: true)
}

export function usePlatformActivity(options: UsePlatformActivityOptions = {}) {
  const { limit = 1, types, pollInterval = 30000, enabled = true } = options;

  const [activity, setActivity] = useState<PlatformActivity | null>(null);
  const [activities, setActivities] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PlatformActivityService.getActivities(limit, types);

      if (limit === 1) {
        setActivity(data[0] || null);
      } else {
        setActivities(data);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch activities');
      setError(error);
      console.error('[usePlatformActivity] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, types]);

  useEffect(() => {
    if (!enabled) return;

    // Fetch immediately
    fetchActivities();

    // Set up polling
    const interval = setInterval(fetchActivities, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, fetchActivities, pollInterval]);

  return {
    activity, // Single activity (when limit=1)
    activities, // Multiple activities (when limit>1)
    loading,
    error,
    refetch: fetchActivities,
  };
}

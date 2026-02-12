import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cronSettingsService } from '@/services/cronSettingsService';
import type {
  UpdateScheduleRequest,
  ToggleScheduleRequest,
  Timezone,
  DistributionSlot,
} from '@/types/cronSettings';
import { toast } from 'sonner';

/**
 * Hook to fetch and manage cron settings
 */
export function useCronSettings() {
  const queryClient = useQueryClient();

  const {
    data: cronSettings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cron-settings'],
    queryFn: async () => {
      const response = await cronSettingsService.getDistributionSchedule();
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateScheduleRequest) => {
      return await cronSettingsService.updateDistributionSchedule(data);
    },
    onSuccess: (response) => {
      toast.success(
        response.message || 'Distribution schedule updated successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['cron-settings'] });
      queryClient.invalidateQueries({ queryKey: ['schedule-preview'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update distribution schedule';
      toast.error(errorMessage);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (data: ToggleScheduleRequest) => {
      return await cronSettingsService.toggleDistributionSchedule(data);
    },
    onSuccess: (response) => {
      toast.success(
        response.message || 'Distribution schedule toggled successfully'
      );
      queryClient.invalidateQueries({ queryKey: ['cron-settings'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to toggle distribution schedule';
      toast.error(errorMessage);
    },
  });

  return {
    cronSettings,
    isLoading,
    error,
    refetch,
    updateCronSettings: updateMutation.mutateAsync,
    toggleCronSettings: toggleMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}

/**
 * Hook to fetch timezones
 */
export function useTimezones() {
  const {
    data: timezonesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['timezones'],
    queryFn: async () => {
      const response = await cronSettingsService.getTimezones();
      return response.data;
    },
    staleTime: Infinity, // Timezones don't change
    retry: 2,
  });

  const searchTimezones = (query: string): Timezone[] => {
    if (!timezonesData?.timezones) return [];
    if (!query.trim()) return timezonesData.timezones;

    const lowerQuery = query.toLowerCase();
    return timezonesData.timezones.filter(
      (tz) =>
        tz.displayName.toLowerCase().includes(lowerQuery) ||
        tz.name.toLowerCase().includes(lowerQuery) ||
        tz.offset.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    timezones: timezonesData?.timezones || [],
    isLoading,
    error,
    searchTimezones,
  };
}

/**
 * Hook to fetch schedule preview
 * Shows next 5 execution times for given timezone and slots
 */
export function useSchedulePreview(
  timezone?: string,
  slots?: DistributionSlot[]
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['schedule-preview', timezone, slots],
    queryFn: async () => {
      const response = await cronSettingsService.getPreviewSchedule(
        timezone,
        slots
      );
      return response.data;
    },
    enabled: !!timezone && !!slots && slots.length > 0,
    staleTime: 10000, // 10 seconds
    retry: 1,
  });

  return {
    preview: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch public cron status
 */
export function useCronStatus() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cron-status'],
    queryFn: async () => {
      return await cronSettingsService.getCronStatus();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
    retry: 2,
  });

  return {
    cronStatus: data,
    isLoading,
    error,
    refetch,
  };
}

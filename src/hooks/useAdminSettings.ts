import { useState, useEffect, useCallback } from 'react';
import {
  adminSettingsService,
  AdminSetting,
} from '@/services/adminSettingsService';
import { toast } from 'sonner';

export function useAdminSettings(category?: string) {
  const [settings, setSettings] = useState<
    Record<string, AdminSetting[]> | AdminSetting[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (category) {
        const categorySettings =
          await adminSettingsService.getSettingsByCategory(category);
        setSettings(categorySettings);
      } else {
        const response = await adminSettingsService.getAllSettings();
        setSettings(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch settings')
      );
      console.error('Error fetching admin settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    async (key: string, value: any, reason?: string) => {
      try {
        await adminSettingsService.updateSetting(key, value, reason);
        toast.success(`Setting '${key}' updated successfully`);

        // Refresh settings
        await fetchSettings();

        // Clear public config cache
        const { configService } = await import('@/services/configService');
        configService.clearCache();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update setting';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchSettings]
  );

  const updateMultipleSettings = useCallback(
    async (updates: Record<string, any>, reason?: string) => {
      try {
        await adminSettingsService.updateMultipleSettings(updates, reason);
        toast.success(`Updated ${Object.keys(updates).length} settings`);

        // Refresh settings
        await fetchSettings();

        // Clear public config cache
        const { configService } = await import('@/services/configService');
        configService.clearCache();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update settings';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchSettings]
  );

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings,
    updateSetting,
    updateMultipleSettings,
  };
}

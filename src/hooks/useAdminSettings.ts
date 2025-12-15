import { useState, useEffect, useCallback } from 'react';
import {
  adminSettingsService,
  AdminSetting,
} from '@/services/adminSettingsService';
import { toast } from 'sonner';
import { use2FA } from '@/contexts/TwoFAContext';

export function useAdminSettings(category?: string) {
  const [settings, setSettings] = useState<
    Record<string, AdminSetting[]> | AdminSetting[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { promptFor2FA } = use2FA();

  const fetchSettings = useCallback(
    async (twoFACode?: string) => {
      try {
        setLoading(true);
        setError(null);

        // If no 2FA code provided, prompt for it
        let code = twoFACode;
        if (!code) {
          code = await promptFor2FA();
          if (!code) {
            setError(new Error('2FA code is required to fetch settings'));
            setLoading(false);
            return;
          }
        }

        if (category) {
          const categorySettings =
            await adminSettingsService.getSettingsByCategory(
              category,
              true,
              code
            );
          setSettings(categorySettings);
        } else {
          const response = await adminSettingsService.getAllSettings(
            true,
            code
          );
          setSettings(response.data);
        }
      } catch (err: any) {
        // Handle 2FA errors
        if (err?.response?.status === 403) {
          const errorData = err.response.data;
          const errorCode = errorData?.error?.code;

          if (errorCode === '2FA_CODE_REQUIRED' && !twoFACode) {
            // Retry with 2FA code
            const code = await promptFor2FA();
            if (code) {
              await fetchSettings(code);
              return;
            }
          } else if (errorCode === '2FA_CODE_INVALID') {
            setError(new Error('Invalid 2FA code. Please try again.'));
            toast.error('Invalid 2FA code');
          } else {
            setError(err instanceof Error ? err : new Error('Access denied'));
            toast.error('Access denied');
          }
        } else if (err?.response?.status === 401) {
          setError(new Error('Authentication failed. Please login again.'));
          toast.error('Authentication failed');
        } else {
          setError(
            err instanceof Error ? err : new Error('Failed to fetch settings')
          );
          console.error('Error fetching admin settings:', err);
          toast.error('Failed to load settings');
        }
      } finally {
        setLoading(false);
      }
    },
    [category, promptFor2FA]
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    async (key: string, value: any, reason?: string, twoFACode?: string) => {
      try {
        // If no 2FA code provided, prompt for it
        let code = twoFACode;
        if (!code) {
          code = await promptFor2FA();
          if (!code) {
            toast.error('2FA code is required to update settings');
            throw new Error('2FA code is required');
          }
        }

        await adminSettingsService.updateSetting(key, value, reason, code);
        toast.success(`Setting '${key}' updated successfully`);

        // Refresh settings
        await fetchSettings(code);

        // Clear public config cache
        const { configService } = await import('@/services/configService');
        configService.clearCache();
      } catch (err: any) {
        // Handle 2FA errors
        if (err?.response?.status === 403) {
          const errorData = err.response.data;
          const errorCode = errorData?.error?.code;

          if (errorCode === '2FA_CODE_REQUIRED' && !twoFACode) {
            // Retry with 2FA code
            const code = await promptFor2FA();
            if (code) {
              await updateSetting(key, value, reason, code);
              return;
            }
          } else if (errorCode === '2FA_CODE_INVALID') {
            toast.error('Invalid 2FA code. Please try again.');
            throw new Error('Invalid 2FA code');
          }
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update setting';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchSettings, promptFor2FA]
  );

  const updateMultipleSettings = useCallback(
    async (
      updates: Record<string, any>,
      reason?: string,
      twoFACode?: string
    ) => {
      try {
        // If no 2FA code provided, prompt for it
        let code = twoFACode;
        if (!code) {
          code = await promptFor2FA();
          if (!code) {
            toast.error('2FA code is required to update settings');
            throw new Error('2FA code is required');
          }
        }

        await adminSettingsService.updateMultipleSettings(
          updates,
          reason,
          code
        );
        toast.success(`Updated ${Object.keys(updates).length} settings`);

        // Refresh settings
        await fetchSettings(code);

        // Clear public config cache
        const { configService } = await import('@/services/configService');
        configService.clearCache();
      } catch (err: any) {
        // Handle 2FA errors
        if (err?.response?.status === 403) {
          const errorData = err.response.data;
          const errorCode = errorData?.error?.code;

          if (errorCode === '2FA_CODE_REQUIRED' && !twoFACode) {
            // Retry with 2FA code
            const code = await promptFor2FA();
            if (code) {
              await updateMultipleSettings(updates, reason, code);
              return;
            }
          } else if (errorCode === '2FA_CODE_INVALID') {
            toast.error('Invalid 2FA code. Please try again.');
            throw new Error('Invalid 2FA code');
          }
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update settings';
        toast.error(errorMessage);
        throw err;
      }
    },
    [fetchSettings, promptFor2FA]
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

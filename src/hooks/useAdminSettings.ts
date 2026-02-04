import { useState, useEffect, useCallback } from 'react';
import {
  adminSettingsService,
  AdminSetting,
  type SettingsBundleData,
} from '@/services/adminSettingsService';
import { toast } from 'sonner';
import { use2FA } from '@/contexts/TwoFAContext';

/**
 * Hook for admin settings page: loads from GET /admin/ui/settings/bundle (single source of truth),
 * updates via PUT /admin/settings/:key or PUT /admin/settings (bulk). Uses response.success and
 * response.message; handles 2FA (prompt/redirect) and bulk data.failed.
 */
export function useSettingsBundle() {
  const [bundle, setBundle] = useState<SettingsBundleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { promptFor2FA } = use2FA();

  const fetchBundle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSettingsService.getSettingsBundle();
      setBundle(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load settings';
      setError(err instanceof Error ? err : new Error(msg));
      toast.error(msg);
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        const data = err?.response?.data as any;
        const message = (data?.message || data?.error || '')
          .toString()
          .toLowerCase();
        if (
          message.includes('2fa') &&
          (message.includes('setup') ||
            message.includes('complete') ||
            message.includes('required'))
        ) {
          window.location.href = '/admin/setup-2fa';
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  const updateSetting = useCallback(
    async (
      key: string,
      value: unknown,
      reason?: string,
      twoFACode?: string
    ) => {
      let code = twoFACode;
      if (!code) {
        code = (await promptFor2FA()) || undefined;
        if (!code) {
          toast.error('2FA code is required to update settings');
          throw new Error('2FA code is required');
        }
      }
      try {
        const res = await adminSettingsService.updateSetting(
          key,
          value,
          reason,
          code
        );
        if (!res.success) {
          const msg = (res as any).message || 'Update failed';
          toast.error(msg);
          throw new Error(msg);
        }
        toast.success((res as any).message || `Setting '${key}' updated`);
        await fetchBundle();
        const { configService } = await import('@/services/configService');
        configService.clearCache();
      } catch (err: any) {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          const data = err?.response?.data as any;
          const msg = (data?.message || data?.error || '')
            .toString()
            .toLowerCase();
          if (
            msg.includes('2fa') &&
            (msg.includes('setup') || msg.includes('complete'))
          ) {
            window.location.href = '/admin/setup-2fa';
            return;
          }
          if (!twoFACode) {
            const newCode = (await promptFor2FA()) || undefined;
            if (newCode) {
              await updateSetting(key, value, reason, newCode);
              return;
            }
          }
        }
        const errorMessage =
          err?.response?.data?.message ??
          err?.message ??
          'Failed to update setting';
        // If the message looks like a success message, show success toast (backend may send success: false with success text)
        if (
          typeof errorMessage === 'string' &&
          errorMessage.toLowerCase().includes('updated successfully')
        ) {
          toast.success(errorMessage);
        } else {
          toast.error(errorMessage);
        }
        throw err;
      }
    },
    [fetchBundle, promptFor2FA]
  );

  const updateMultipleSettings = useCallback(
    async (
      settings: Array<{ key: string; value: unknown }>,
      reason?: string,
      twoFACode?: string
    ) => {
      let code = twoFACode;
      if (!code) {
        code = (await promptFor2FA()) || undefined;
        if (!code) {
          toast.error('2FA code is required to update settings');
          throw new Error('2FA code is required');
        }
      }
      try {
        const res = await adminSettingsService.updateMultipleSettings(
          settings,
          reason,
          code
        );
        const body = res as any;
        if (body?.data?.failed?.length) {
          body.data.failed.forEach((f: { key: string; error?: string }) => {
            toast.error(`${f.key}: ${f.error || 'Failed'}`);
          });
        }
        if (body?.data?.successful?.length) {
          toast.success(
            body.message || `Updated ${body.data.successful.length} settings`
          );
          await fetchBundle();
          const { configService } = await import('@/services/configService');
          configService.clearCache();
        }
        if (!body?.success && !body?.data?.successful?.length) {
          toast.error(body?.message || 'Update failed');
          throw new Error(body?.message || 'Update failed');
        }
      } catch (err: any) {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          const data = err?.response?.data as any;
          const msg = (data?.message || '').toString().toLowerCase();
          if (
            msg.includes('2fa') &&
            (msg.includes('setup') || msg.includes('complete'))
          ) {
            window.location.href = '/admin/setup-2fa';
            return;
          }
          if (!twoFACode) {
            const newCode = (await promptFor2FA()) || undefined;
            if (newCode) {
              await updateMultipleSettings(settings, reason, newCode);
              return;
            }
          }
        }
        toast.error(
          err?.response?.data?.message ??
            err?.message ??
            'Failed to update settings'
        );
        throw err;
      }
    },
    [fetchBundle, promptFor2FA]
  );

  /** Get a single setting value by key from the loaded bundle (e.g. max_ros_percentage). */
  const getSettingValue = useCallback(
    (key: string): unknown => {
      if (!bundle?.categories) return undefined;
      for (const cat of bundle.categories) {
        const s = cat.settings.find((x) => x.key === key);
        if (s) return s.value;
      }
      return undefined;
    },
    [bundle]
  );

  return {
    bundle,
    categories: bundle?.categories ?? [],
    loading,
    error,
    refresh: fetchBundle,
    updateSetting,
    updateMultipleSettings,
    getSettingValue,
  };
}

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

        // Try to fetch without 2FA first (backend should allow GET requests without 2FA)
        // Only prompt for 2FA if backend specifically requires it
        if (category) {
          const categorySettings =
            await adminSettingsService.getSettingsByCategory(
              category,
              true,
              twoFACode
            );
          setSettings(categorySettings);
        } else {
          const response = await adminSettingsService.getAllSettings(
            true,
            twoFACode
          );
          setSettings(response.data);
        }
      } catch (err: any) {
        // Handle 2FA errors
        if (err?.response?.status === 403) {
          const errorData = err.response.data;
          const errorCode = errorData?.error?.code;

          // Only prompt for 2FA if backend explicitly requires it for GET requests
          // (This shouldn't happen after backend fix, but kept for backward compatibility)
          if (errorCode === '2FA_CODE_REQUIRED' && !twoFACode) {
            const code = (await promptFor2FA()) || undefined;
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
          code = (await promptFor2FA()) || undefined;
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
            const code = (await promptFor2FA()) || undefined;
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
          code = (await promptFor2FA()) || undefined;
          if (!code) {
            toast.error('2FA code is required to update settings');
            throw new Error('2FA code is required');
          }
        }

        const arr = Object.entries(updates).map(([key, value]) => ({
          key,
          value,
        }));
        const res = await adminSettingsService.updateMultipleSettings(
          arr,
          reason,
          code
        );
        const body = res as any;
        if (body?.data?.failed?.length) {
          body.data.failed.forEach((f: { key: string; error?: string }) =>
            toast.error(`${f.key}: ${f.error || 'Failed'}`)
          );
        }
        const successCount =
          body?.data?.successful?.length ??
          (body?.success ? Object.keys(updates).length : 0);
        toast.success(body?.message || `Updated ${successCount} settings`);

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
            const code = (await promptFor2FA()) || undefined;
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

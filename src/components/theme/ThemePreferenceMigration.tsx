'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

const THEME_MIGRATION_FLAG = 'theme-migrated-to-system-v1';

/**
 * One-time migration that resets old explicit light/dark preferences to system.
 * Keeps user choice available going forward from Settings > Appearance.
 */
export function ThemePreferenceMigration() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const alreadyMigrated = window.localStorage.getItem(THEME_MIGRATION_FLAG);
    if (alreadyMigrated) {
      return;
    }

    if (theme === 'light' || theme === 'dark') {
      setTheme('system');
    }

    window.localStorage.setItem(THEME_MIGRATION_FLAG, 'true');
  }, [theme, setTheme]);

  return null;
}

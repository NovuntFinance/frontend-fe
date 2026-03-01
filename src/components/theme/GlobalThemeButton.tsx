'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import neuStyles from '@/styles/neumorphic.module.css';

/**
 * Global theme toggle — fixed position, neumorphic design, visible on every page.
 * Hidden on dashboard (theme toggle lives in dashboard header next to headset to avoid overlap).
 * Icon: Moon = dark mode. Sun = light mode.
 */
export function GlobalThemeButton() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  const isDark = resolvedTheme === 'dark';

  if (!mounted) {
    return (
      <div
        className={`fixed right-4 z-[100] ${neuStyles['neu-icon-button']}`}
        style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`fixed right-4 z-[100] flex items-center justify-center rounded-full ${neuStyles['neu-icon-button']} ${neuStyles['neu-icon-button-accent-default']}`}
      style={{
        filter: 'none',
        top: 'calc(1rem + env(safe-area-inset-top, 0px))',
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}

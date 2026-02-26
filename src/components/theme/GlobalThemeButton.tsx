'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import neuStyles from '@/styles/neumorphic.module.css';

/**
 * Global theme toggle — fixed position, neumorphic design, visible on every page.
 * Same visual as the previous dashboard theme button (neu-icon-button).
 */
export function GlobalThemeButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={`fixed top-4 right-4 z-[100] ${neuStyles['neu-icon-button']}`}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`fixed top-4 right-4 z-[100] flex items-center justify-center rounded-full ${neuStyles['neu-icon-button']}`}
      style={{ color: 'var(--neu-accent)', filter: 'none' }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}

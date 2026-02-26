'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import neuStyles from '@/styles/neumorphic.module.css';

/**
 * Global theme toggle — fixed position, neumorphic design, visible on every page.
 * Icon convention: Moon = dark mode (current; dark blue background). Sun = light mode (planned).
 */
export function GlobalThemeButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`fixed right-4 z-[100] flex items-center justify-center rounded-full ${neuStyles['neu-icon-button']}`}
      style={{
        color: 'var(--neu-accent)',
        filter: 'none',
        top: 'calc(1rem + env(safe-area-inset-top, 0px))',
      }}
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

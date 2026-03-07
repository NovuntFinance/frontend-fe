'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Settings, Smartphone, Sun } from 'lucide-react';

const appearanceOptions: Array<{
  value: 'system' | 'light' | 'dark';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: 'system',
    label: 'System',
    description: 'Follow your device theme automatically.',
    icon: Smartphone,
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Always use the light theme.',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Always use the dark theme.',
    icon: Moon,
  },
];

export default function DashboardSettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedTheme = theme ?? 'system';
  const activeDisplayTheme = resolvedTheme === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-4 sm:py-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your platform preferences and appearance.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--neu-border)] bg-[var(--neu-bg)] p-4 shadow-[var(--neu-shadow-inset)] sm:p-6">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold text-[var(--neu-text-primary)] sm:text-xl">
            Appearance
          </h2>
          <p className="text-sm text-[var(--neu-text-secondary)]">
            Default behavior is System theme. You can choose a manual override
            below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {appearanceOptions.map((option) => {
            const Icon = option.icon;
            const active = selectedTheme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                disabled={!mounted}
                className={`rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                  active
                    ? 'border-[rgba(var(--neu-accent-rgb),0.65)] bg-[rgba(var(--neu-accent-rgb),0.16)]'
                    : 'border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.05)]'
                }`}
                aria-label={`Set ${option.label} theme`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[var(--neu-text-primary)]" />
                  <span className="font-medium text-[var(--neu-text-primary)]">
                    {option.label}
                  </span>
                </div>
                <p className="text-xs text-[var(--neu-text-secondary)]">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-[var(--neu-text-primary)]/70">
          Active display theme: {mounted ? activeDisplayTheme : 'Loading...'}
        </p>
      </section>
    </div>
  );
}

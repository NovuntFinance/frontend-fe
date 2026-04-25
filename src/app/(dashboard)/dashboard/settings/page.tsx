'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Moon,
  Settings,
  ShieldCheck,
  Shield,
  Smartphone,
  Sun,
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';

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
  const { user } = useUser();

  const twoFAEnabled = user?.twoFAEnabled ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const open2FAModal = () => {
    window.dispatchEvent(new CustomEvent('openTwoFactorModal'));
  };

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

      {/* ── Security ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--neu-border)] bg-[var(--neu-bg)] p-4 shadow-[var(--neu-shadow-inset)] sm:p-6">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold text-[var(--neu-text-primary)] sm:text-xl">
            Security
          </h2>
          <p className="text-sm text-[var(--neu-text-secondary)]">
            Protect your account with two-factor authentication.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--neu-border)] bg-[rgba(var(--neu-accent-rgb),0.04)] p-4">
          <div className="flex items-center gap-3">
            <div
              className="rounded-xl p-2.5"
              style={{
                background: 'var(--neu-bg)',
                boxShadow:
                  '3px 3px 8px var(--neu-shadow-dark), -3px -3px 8px var(--neu-shadow-light)',
              }}
            >
              {twoFAEnabled ? (
                <ShieldCheck
                  className="h-5 w-5"
                  style={{ color: 'rgb(34, 197, 94)' }}
                />
              ) : (
                <Shield
                  className="h-5 w-5"
                  style={{ color: 'var(--neu-accent)' }}
                />
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--neu-text-primary)]">
                Two-Factor Authentication (2FA)
              </p>
              <p className="text-xs text-[var(--neu-text-secondary)]">
                {twoFAEnabled
                  ? 'Your account is protected with an authenticator app.'
                  : 'Add an extra layer of security to your account.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {/* Status badge */}
            <span
              className="hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block"
              style={
                twoFAEnabled
                  ? {
                      background: 'rgba(34, 197, 94, 0.12)',
                      color: 'rgb(34, 197, 94)',
                    }
                  : {
                      background: 'rgba(var(--neu-accent-rgb), 0.12)',
                      color: 'var(--neu-accent)',
                    }
              }
            >
              {twoFAEnabled ? 'Enabled' : 'Not set up'}
            </span>

            <button
              type="button"
              onClick={open2FAModal}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all"
              style={{
                background: twoFAEnabled
                  ? 'rgba(var(--neu-accent-rgb), 0.15)'
                  : 'var(--neu-accent)',
                color: twoFAEnabled ? 'var(--neu-accent)' : '#fff',
                boxShadow: twoFAEnabled
                  ? 'none'
                  : '0 2px 8px rgba(var(--neu-accent-rgb), 0.3)',
                border: twoFAEnabled
                  ? '1px solid rgba(var(--neu-accent-rgb), 0.3)'
                  : 'none',
              }}
            >
              {twoFAEnabled ? 'Manage' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

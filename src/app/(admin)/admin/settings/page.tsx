'use client';

import { SettingsManager } from '@/components/admin/SettingsManager';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Platform Settings
        </h2>
      </div>

      {/* Dynamic Settings Manager */}
      <SettingsManager />
    </div>
  );
}

'use client';

import React from 'react';
import { TodayDistributionForm } from '@/components/admin/dailyDeclarationReturns/TodayDistributionForm';
import { HistoryTable } from '@/components/admin/dailyDeclarationReturns/HistoryTable';

export default function DailyDeclarationReturnsPage() {
  return (
    <div className="min-h-screen space-y-4 bg-gradient-to-br from-gray-50 to-blue-50/30 p-3 sm:space-y-6 sm:p-4 md:p-6 lg:p-8 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="space-y-2 rounded-xl bg-white/50 p-3 backdrop-blur-sm sm:rounded-2xl sm:p-4 md:p-6 dark:bg-gray-800/50">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl md:text-3xl lg:text-4xl dark:from-blue-400 dark:to-purple-400">
          Daily Declaration Returns
        </h1>
        <p className="text-xs leading-relaxed text-gray-600 sm:text-sm md:text-base dark:text-gray-400">
          Queue, modify, and track ROS & pool distributions for today
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Form (60%) */}
        <div className="lg:col-span-2">
          <TodayDistributionForm />
        </div>

        {/* Right Column: History (40%) */}
        <div className="lg:col-span-1">
          <HistoryTable />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { DailyProfitCalendar } from '@/components/admin/dailyProfit/DailyProfitCalendar';
import { DistributionStatus } from '@/components/admin/dailyProfit/DistributionStatus';
import { DeclaredProfitsList } from '@/components/admin/dailyProfit/DeclaredProfitsList';

export default function DailyProfitPage() {
  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:space-y-8 sm:p-6 lg:p-8 dark:from-gray-900 dark:to-gray-800">
      {/* Header - More prominent */}
      <div className="space-y-2 rounded-2xl bg-white/50 p-4 backdrop-blur-sm sm:p-6 dark:bg-gray-800/50">
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl lg:text-4xl dark:from-blue-400 dark:to-purple-400">
          Daily Profit Management
        </h1>
        <p className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-400">
          Declare and manage daily profit percentages for the next 30 days
        </p>
      </div>

      {/* Calendar and Status - Better spacing */}
      <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
        {/* Calendar View - Full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2">
          <DailyProfitCalendar />
        </div>

        {/* Distribution Status - Full width on mobile, 1 column on desktop */}
        <div className="lg:col-span-1">
          <DistributionStatus />
        </div>
      </div>

      {/* Declared Profits List - Full width */}
      <div>
        <DeclaredProfitsList />
      </div>
    </div>
  );
}

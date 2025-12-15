'use client';

import React from 'react';
import { DailyProfitCalendar } from '@/components/admin/dailyProfit/DailyProfitCalendar';
import { DistributionStatus } from '@/components/admin/dailyProfit/DistributionStatus';
import { DeclaredProfitsList } from '@/components/admin/dailyProfit/DeclaredProfitsList';

export default function DailyProfitPage() {
  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Daily Profit Management
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
          Declare and manage daily profit percentages for the next 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar View - Takes 2 columns */}
        <div className="lg:col-span-2">
          <DailyProfitCalendar />
        </div>

        {/* Distribution Status - Takes 1 column */}
        <div>
          <DistributionStatus />
        </div>
      </div>

      {/* Declared Profits List */}
      <div>
        <DeclaredProfitsList />
      </div>
    </div>
  );
}

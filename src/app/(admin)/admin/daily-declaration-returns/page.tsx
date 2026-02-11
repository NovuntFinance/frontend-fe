'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TodayDistributionForm } from '@/components/admin/dailyDeclarationReturns/TodayDistributionForm';
import { HistoryTable } from '@/components/admin/dailyDeclarationReturns/HistoryTable';
import { DailyDeclarationReturnsManager } from '@/components/admin/dailyDeclarationReturns/DailyDeclarationReturnsManager';

export default function DailyDeclarationReturnsPage() {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Daily Declaration Returns
          </h1>
          <p className="text-muted-foreground">
            Manage daily ROS distributions, premium pools, and performance pools
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today&apos;s Distribution</TabsTrigger>
          <TabsTrigger value="history">Distribution History</TabsTrigger>
          <TabsTrigger value="calendar">Calendar & Management</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <TodayDistributionForm />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryTable />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <DailyDeclarationReturnsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

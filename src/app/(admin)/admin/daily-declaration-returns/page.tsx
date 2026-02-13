'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TodayDistributionForm } from '@/components/admin/dailyDeclarationReturns/TodayDistributionForm';
import { HistoryTable } from '@/components/admin/dailyDeclarationReturns/HistoryTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import {
  usePlatformDayStart,
  useTimeUntilReset,
} from '@/hooks/usePlatformTime';

export default function DailyDeclarationReturnsPage() {
  const [activeTab, setActiveTab] = useState('today');
  const platformDayStart = usePlatformDayStart();
  const { formatted } = useTimeUntilReset();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Daily Declaration Returns
          </h1>
          <p className="text-muted-foreground">
            Manage daily ROS distributions, premium pools, and performance pools
            (Platform Time - UTC)
          </p>
        </div>
      </div>

      {/* Platform Day Info */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Platform Day:</strong> Resets at {platformDayStart} UTC
          <span className="text-muted-foreground ml-2">
            (Next reset in: {formatted})
          </span>
          <br />
          <span className="text-muted-foreground text-xs">
            All distribution times and daily boundaries use the unified platform
            time system (UTC).
          </span>
        </AlertDescription>
      </Alert>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Today&apos;s Distribution</TabsTrigger>
          <TabsTrigger value="history">Distribution History</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <TodayDistributionForm />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

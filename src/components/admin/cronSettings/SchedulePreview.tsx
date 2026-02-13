'use client';

import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { useSchedulePreview } from '@/hooks/useCronSettings';
import type { DistributionSlot } from '@/types/cronSettings';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShimmerCard } from '@/components/ui/shimmer';

interface SchedulePreviewProps {
  timezone: string;
  slots: DistributionSlot[];
}

export function SchedulePreview({ timezone, slots }: SchedulePreviewProps) {
  const { preview, isLoading, error } = useSchedulePreview(timezone, slots);

  if (!timezone || !slots || slots.length === 0) {
    return null;
  }

  if (isLoading) {
    return <ShimmerCard />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load preview. Please check your timezone and slot
          configuration.
        </AlertDescription>
      </Alert>
    );
  }

  if (
    !preview ||
    !preview.nextExecutions ||
    preview.nextExecutions.length === 0
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Executions
        </CardTitle>
        <CardDescription>
          Next 5 scheduled distributions (UTC - Platform Time)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {preview.nextExecutions.map((execution, index) => (
            <div
              key={index}
              className="bg-muted/50 flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Clock className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">
                    {execution.label || `Slot ${execution.slotNumber}`}
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {execution.slotTime}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {new Date(execution.nextRun).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-muted-foreground text-xs">
                  in {execution.timeUntil}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-4 text-center text-xs">
          Platform time (UTC): {new Date(preview.currentTime).toUTCString()}
        </p>
      </CardContent>
    </Card>
  );
}

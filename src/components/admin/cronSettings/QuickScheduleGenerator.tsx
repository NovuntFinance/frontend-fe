'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { DistributionSlot } from '@/types/cronSettings';

interface QuickScheduleGeneratorProps {
  maxSlots: number;
  currentSlotCount: number;
  existingTimes: string[];
  onGenerate: (slots: DistributionSlot[]) => void;
  disabled?: boolean;
}

function timeStringToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
}

function secondsToTimeString(totalSeconds: number): string {
  const clamped = Math.max(0, Math.min(86399, totalSeconds));
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function QuickScheduleGenerator({
  maxSlots,
  currentSlotCount,
  existingTimes,
  onGenerate,
  disabled,
}: QuickScheduleGeneratorProps) {
  const [slotCount, setSlotCount] = useState<number | ''>(10);
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');

  const available = maxSlots - currentSlotCount;

  const handleGenerate = () => {
    const count = Number(slotCount);
    if (!count || count < 1) {
      toast.error('Enter at least 1 slot');
      return;
    }
    if (count > available) {
      toast.error(
        `You already have ${currentSlotCount} slots. Can only add ${available} more (max ${maxSlots}).`
      );
      return;
    }

    const startSec = timeStringToSeconds(startTime);
    const endSec = timeStringToSeconds(endTime);

    if (startSec >= endSec) {
      toast.error('Start time must be before end time');
      return;
    }

    const range = endSec - startSec;
    if (range < count) {
      toast.error(
        `Time range (${range}s) is too small for ${count} unique slots. Widen the window or reduce slot count.`
      );
      return;
    }

    // Collect existing times as seconds to avoid duplicates
    const existingSeconds = new Set(existingTimes.map(timeStringToSeconds));

    const chosen = new Set<number>();
    let attempts = 0;
    const maxAttempts = count * 100;
    while (chosen.size < count && attempts < maxAttempts) {
      const candidate = startSec + Math.floor(Math.random() * (range + 1));
      if (!existingSeconds.has(candidate)) {
        chosen.add(candidate);
      }
      attempts++;
    }

    if (chosen.size < count) {
      toast.error(
        'Could not generate enough unique times. Try a wider time range.'
      );
      return;
    }

    const sorted = Array.from(chosen).sort((a, b) => a - b);
    const slots: DistributionSlot[] = sorted.map((sec) => ({
      time: secondsToTimeString(sec),
      label: '',
    }));

    onGenerate(slots);
    toast.success(
      `Added ${count} new slots (total: ${currentSlotCount + count}) between ${startTime} and ${endTime} UTC`
    );
  };

  return (
    <Card className="border-primary/20 bg-primary/5 border-2 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Quick Schedule Generator
        </CardTitle>
        <CardDescription>
          Add new slots with random times within a time window. New slots are
          appended to your existing {currentSlotCount} slot
          {currentSlotCount !== 1 ? 's' : ''}. You can still fine-tune
          individual slots after generating.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="quick-slot-count" className="text-sm">
              Slots to Add
            </Label>
            <Input
              id="quick-slot-count"
              type="number"
              min={1}
              max={available}
              value={slotCount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') {
                  setSlotCount('');
                } else {
                  const n = parseInt(v, 10);
                  if (!isNaN(n)) setSlotCount(n);
                }
              }}
              disabled={disabled}
              placeholder="e.g. 20"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="quick-start-time" className="text-sm">
              Start Time (UTC)
            </Label>
            <Input
              id="quick-start-time"
              type="time"
              step="1"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value || '00:00:00')}
              disabled={disabled}
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="quick-end-time" className="text-sm">
              End Time (UTC)
            </Label>
            <Input
              id="quick-end-time"
              type="time"
              step="1"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value || '23:59:59')}
              disabled={disabled}
              className="mt-1 font-mono"
            />
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={disabled || !slotCount || available < 1}
          className="w-full"
          variant="outline"
        >
          <Zap className="mr-2 h-4 w-4" />
          Add {slotCount || 0} Random Slots
          {slotCount ? ` (Total: ${currentSlotCount + Number(slotCount)})` : ''}
        </Button>
      </CardContent>
    </Card>
  );
}

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
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface QuickRosDistributorProps {
  slotCount: number;
  slotNumbers: number[];
  onDistribute: (values: Record<number, number>) => void;
  disabled?: boolean;
}

/**
 * Splits a total percentage into N random unequal portions that sum exactly
 * to the original total. Uses an exponential distribution for natural-looking
 * variance, then corrects rounding error on the largest portion.
 */
function splitPercentageRandomly(total: number, count: number): number[] {
  const weights = Array.from({ length: count }, () => -Math.log(Math.random()));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  const portions = weights.map(
    (w) => Math.round((w / weightSum) * total * 1000) / 1000
  );

  // Ensure no portion rounds to 0 when the total is large enough
  for (let i = 0; i < portions.length; i++) {
    if (portions[i] === 0) portions[i] = 0.001;
  }

  // Correct rounding error by adjusting the largest value
  const currentSum = portions.reduce((sum, v) => sum + v, 0);
  const diff = Math.round((total - currentSum) * 1000) / 1000;
  if (diff !== 0) {
    const maxIdx = portions.indexOf(Math.max(...portions));
    portions[maxIdx] = Math.round((portions[maxIdx] + diff) * 1000) / 1000;
  }

  return portions;
}

export function QuickRosDistributor({
  slotCount,
  slotNumbers,
  onDistribute,
  disabled,
}: QuickRosDistributorProps) {
  const [totalRos, setTotalRos] = useState<number | ''>('');

  const handleDistribute = () => {
    const total = Number(totalRos);
    if (!total || total <= 0) {
      toast.error('Enter a ROS percentage greater than 0');
      return;
    }
    if (total > 100) {
      toast.error('ROS percentage cannot exceed 100%');
      return;
    }
    if (slotCount < 1) {
      toast.error(
        'No slots available. Configure the Distribution Schedule first.'
      );
      return;
    }

    if (total / slotCount < 0.001) {
      toast.error(
        `${total}% is too small to split across ${slotCount} slots (minimum ~${(0.001 * slotCount).toFixed(3)}% needed). Increase the total or reduce slot count.`
      );
      return;
    }

    const portions = splitPercentageRandomly(total, slotCount);

    const result: Record<number, number> = {};
    slotNumbers.forEach((slotNum, idx) => {
      result[slotNum] = portions[idx];
    });

    onDistribute(result);
    toast.success(
      `Distributed ${total}% across ${slotCount} slots (random unequal portions)`
    );
  };

  return (
    <Card className="border-primary/20 bg-primary/5 border-2 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shuffle className="h-5 w-5" />
          Quick ROS Distributor
        </CardTitle>
        <CardDescription>
          Enter a total daily ROS % and auto-distribute it across all{' '}
          {slotCount} slot{slotCount !== 1 ? 's' : ''} with random unequal
          amounts that sum to your exact total.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="quick-total-ros" className="text-sm">
              Total Daily ROS %
            </Label>
            <Input
              id="quick-total-ros"
              type="number"
              min={0.001}
              max={100}
              step={0.001}
              value={totalRos}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') {
                  setTotalRos('');
                } else {
                  const n = parseFloat(v);
                  if (!isNaN(n)) setTotalRos(n);
                }
              }}
              disabled={disabled}
              placeholder="e.g. 1.5"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleDistribute}
            disabled={disabled || !totalRos || slotCount < 1}
            variant="outline"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Distribute Across {slotCount} Slots
          </Button>
        </div>
        {totalRos !== '' && Number(totalRos) > 0 && slotCount > 0 && (
          <p className="text-muted-foreground text-xs">
            {Number(totalRos)}% will be split into {slotCount} random unequal
            portions that sum to exactly {Number(totalRos)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useMemo } from 'react';
import { AlertCircle, Clock, TrendingUp } from 'lucide-react';
import type { DistributionSlot } from '@/types/cronSettings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  slots: DistributionSlot[];
  rosValues: Record<number, number>;
  onChange: (slotNumber: number, value: number) => void;
  disabled?: boolean;
  currentTotalStakes?: number; // For estimation
}

export function MultiSlotRosInput({
  slots,
  rosValues,
  onChange,
  disabled,
  currentTotalStakes = 0,
}: Props) {
  // Calculate total ROS
  const totalRos = useMemo(() => {
    return Object.values(rosValues).reduce((sum, val) => sum + (val || 0), 0);
  }, [rosValues]);

  // Check if total exceeds 100%
  const exceedsLimit = totalRos > 100;

  // Calculate estimated distribution per slot
  const getEstimatedAmount = (rosPercentage: number) => {
    if (!currentTotalStakes || !rosPercentage) return 0;
    return (currentTotalStakes * rosPercentage) / 100;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">
          ROS Distribution by Slot
        </Label>
        <div className="text-sm font-medium">
          Total:{' '}
          <span
            className={
              exceedsLimit ? 'font-bold text-orange-600' : 'text-primary'
            }
          >
            {totalRos.toFixed(2)}%
          </span>
        </div>
      </div>

      {exceedsLimit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Total ROS exceeds 100%. This means cumulative distribution across
            all slots. This is allowed but review carefully.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {slots.map((slot, index) => {
          const slotNumber = index + 1; // 1-indexed
          const rosValue = rosValues[slotNumber] || 0;
          const estimatedAmount = getEstimatedAmount(rosValue);

          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Slot header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">Slot {slotNumber}</span>
                      <span className="text-muted-foreground font-mono text-sm">
                        ({slot.time})
                      </span>
                    </div>
                    {slot.label && (
                      <span className="bg-muted rounded px-2 py-1 text-xs">
                        {slot.label}
                      </span>
                    )}
                  </div>

                  {/* ROS input */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label
                        htmlFor={`ros-slot-${slotNumber}`}
                        className="text-xs"
                      >
                        ROS Percentage
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id={`ros-slot-${slotNumber}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={rosValue || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            onChange(
                              slotNumber,
                              Math.min(100, Math.max(0, value))
                            );
                          }}
                          disabled={disabled}
                          placeholder="0.00"
                          className="pr-8"
                        />
                        <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Estimated amount */}
                    {currentTotalStakes > 0 && (
                      <div className="flex-1">
                        <Label className="text-muted-foreground text-xs">
                          Estimated Distribution
                        </Label>
                        <div className="bg-muted/50 mt-1 flex items-center gap-2 rounded-md border px-3 py-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {formatCurrency(estimatedAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total estimated distribution */}
      {currentTotalStakes > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary h-5 w-5" />
                <span className="font-semibold">
                  Total Estimated Distribution
                </span>
              </div>
              <span className="text-primary text-lg font-bold">
                {formatCurrency(getEstimatedAmount(totalRos))}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              Based on current total stakes of{' '}
              {formatCurrency(currentTotalStakes)}
            </p>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription className="text-xs">
          💡 <strong>Tip:</strong> Each slot will distribute its ROS percentage
          at the scheduled time. The total ROS (cumulative) can exceed 100% if
          distributing multiple times per day.
        </AlertDescription>
      </Alert>
    </div>
  );
}

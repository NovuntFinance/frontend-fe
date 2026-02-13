'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  AlertCircle,
  Clock,
  TrendingUp,
  Copy,
  Trash,
  Lock,
  CheckCircle,
  Loader2,
  XCircle,
} from 'lucide-react';
import type { DistributionSlot } from '@/types/cronSettings';
import type { IDistributionSlot } from '@/types/dailyDeclarationReturns';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { pct4 } from '@/utils/formatters';

interface Props {
  slots: DistributionSlot[];
  rosValues: Record<number, number>;
  onChange: (slotNumber: number, value: number) => void;
  disabled?: boolean;
  currentTotalStakes?: number; // For estimation
  slotStatuses?: IDistributionSlot[]; // Per-slot status from backend
}

export function MultiSlotRosInput({
  slots,
  rosValues,
  onChange,
  disabled,
  currentTotalStakes = 0,
  slotStatuses,
}: Props) {
  const [bulkValue, setBulkValue] = useState<string>('');

  // Debug slot statuses
  useEffect(() => {
    console.log('🎯 MultiSlotRosInput - Slot Statuses:', {
      hasStatuses: !!slotStatuses,
      statusesCount: slotStatuses?.length,
      statuses: slotStatuses,
      slotsCount: slots.length,
    });
  }, [slotStatuses, slots]);

  // Helper to check if a specific slot is locked (completed or failed)
  const isSlotLocked = (slotNumber: number): boolean => {
    if (!slotStatuses) return false;
    const slotStatus = slotStatuses.find((s) => s.slotNumber === slotNumber);
    return (
      slotStatus?.status === 'COMPLETED' || slotStatus?.status === 'FAILED'
    );
  };

  // Get slot status info
  const getSlotStatus = (slotNumber: number): IDistributionSlot | undefined => {
    return slotStatuses?.find((s) => s.slotNumber === slotNumber);
  };

  // Calculate total ROS
  const totalRos = useMemo(() => {
    return Object.values(rosValues).reduce((sum, val) => sum + (val || 0), 0);
  }, [rosValues]);

  // Check if total exceeds 100%
  const exceedsLimit = totalRos > 100;

  // Bulk operations (skip locked slots)
  const handleSetAll = () => {
    const value = parseFloat(bulkValue);
    if (isNaN(value) || value < 0 || value > 100) {
      return;
    }
    slots.forEach((_, index) => {
      const slotNumber = index + 1;
      if (!isSlotLocked(slotNumber)) {
        onChange(slotNumber, value);
      }
    });
    setBulkValue('');
  };

  const handleClearAll = () => {
    slots.forEach((_, index) => {
      const slotNumber = index + 1;
      if (!isSlotLocked(slotNumber)) {
        onChange(slotNumber, 0);
      }
    });
  };

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
          ROS Distribution by Slot ({slots.length} slots)
        </Label>
        <div className="text-sm font-medium">
          Total:{' '}
          <span
            className={
              exceedsLimit ? 'font-bold text-orange-600' : 'text-primary'
            }
          >
            {pct4(totalRos)}
          </span>
        </div>
      </div>

      {/* Bulk Operations */}
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <Label className="text-xs font-semibold">Quick Fill Operations</Label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Enter ROS % to apply to all slots"
                disabled={disabled}
                className="h-9 pr-8 text-sm"
              />
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                %
              </span>
            </div>
            <Button
              onClick={handleSetAll}
              disabled={disabled || !bulkValue}
              size="sm"
              variant="outline"
              className="h-9"
            >
              <Copy className="mr-1 h-3 w-3" />
              Set All
            </Button>
            <Button
              onClick={handleClearAll}
              disabled={disabled}
              size="sm"
              variant="outline"
              className="h-9"
            >
              <Trash className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {exceedsLimit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Total ROS exceeds 100%. This means cumulative distribution across
            all slots. This is allowed but review carefully.
          </AlertDescription>
        </Alert>
      )}

      {/* Scrollable slot inputs - optimized for up to 20+ slots */}
      <div className="max-h-[600px] space-y-2 overflow-y-auto rounded-md border p-3">
        {slots.map((slot, index) => {
          const slotNumber = index + 1; // 1-indexed
          const rosValue = rosValues[slotNumber] || 0;
          const estimatedAmount = getEstimatedAmount(rosValue);
          const slotStatus = getSlotStatus(slotNumber);
          const locked = isSlotLocked(slotNumber);

          return (
            <Card
              key={index}
              className={`transition-shadow hover:shadow-sm ${
                locked ? 'bg-muted/30 opacity-70' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* Slot header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {locked ? (
                        <Lock className="text-muted-foreground h-3 w-3" />
                      ) : (
                        <Clock className="text-muted-foreground h-3 w-3" />
                      )}
                      <span className="text-sm font-medium">
                        Slot {slotNumber}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {slot.time}
                      </span>
                      {slotStatus?.status === 'PENDING' && (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 border-blue-200 bg-blue-50 text-xs text-blue-700"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                      {slotStatus?.status === 'EXECUTING' && (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 border-amber-200 bg-amber-50 text-xs text-amber-700"
                        >
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Executing
                        </Badge>
                      )}
                      {slotStatus?.status === 'COMPLETED' && (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 border-green-200 bg-green-50 text-xs text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                      {slotStatus?.status === 'FAILED' && (
                        <Badge
                          variant="outline"
                          className="h-5 gap-1 border-red-200 bg-red-50 text-xs text-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </div>
                    {slot.label && (
                      <span className="bg-muted rounded px-2 py-0.5 text-xs">
                        {slot.label}
                      </span>
                    )}
                  </div>

                  {/* ROS input */}
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label
                        htmlFor={`ros-slot-${slotNumber}`}
                        className="text-xs"
                      >
                        ROS %
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
                          disabled={disabled || locked}
                          placeholder={locked ? 'Completed' : '0.00'}
                          className="h-9 pr-8 text-sm"
                        />
                        <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Estimated amount */}
                    {currentTotalStakes > 0 && (
                      <div className="flex-1">
                        <Label className="text-muted-foreground text-xs">
                          Est. Dist.
                        </Label>
                        <div className="bg-muted/50 mt-1 flex items-center gap-1.5 rounded-md border px-2 py-1.5">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium">
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

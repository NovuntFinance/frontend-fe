'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeclareBulkDailyProfit } from '@/lib/mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/enhanced-toast';
import { utcDayString } from '@/lib/dateUtils';

const MAX_ROS_PERCENTAGE = 2.2;

const bulkDeclareSchema = z.object({
  premiumPoolAmount: z
    .number()
    .min(0, 'Premium pool amount must be at least 0'),
  performancePoolAmount: z
    .number()
    .min(0, 'Performance pool amount must be at least 0'),
  rosPercentage: z
    .number()
    .min(0, 'ROS percentage must be at least 0')
    .max(
      MAX_ROS_PERCENTAGE,
      `ROS percentage cannot exceed ${MAX_ROS_PERCENTAGE}%`
    ),
  selectedDates: z.array(z.string()).min(1, 'Select at least one date'),
});

type BulkDeclareFormData = z.infer<typeof bulkDeclareSchema>;

interface BulkDeclareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkDeclareModal({
  open,
  onOpenChange,
}: BulkDeclareModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const bulkDeclareMutation = useDeclareBulkDailyProfit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BulkDeclareFormData>({
    resolver: zodResolver(bulkDeclareSchema),
    defaultValues: {
      premiumPoolAmount: 0,
      performancePoolAmount: 0,
      rosPercentage: 0,
      selectedDates: [],
    },
  });

  const premiumPoolAmount = watch('premiumPoolAmount');
  const performancePoolAmount = watch('performancePoolAmount');
  const rosPercentage = watch('rosPercentage');

  // Generate next 30 days using UTC day strings
  const todayDate = new Date();
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(todayDate);
    date.setUTCDate(todayDate.getUTCDate() + i);
    return utcDayString(date);
  });

  useEffect(() => {
    setValue('selectedDates', selectedDates);
  }, [selectedDates, setValue]);

  const toggleDate = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const selectAll = () => {
    setSelectedDates([...availableDates]);
  };

  const deselectAll = () => {
    setSelectedDates([]);
  };

  const onSubmit = async (data: BulkDeclareFormData) => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }

    if (selectedDates.length > 30) {
      toast.error('Cannot declare profits for more than 30 days at once');
      return;
    }

    setIsLoading(true);
    try {
      // Don't manually prompt for 2FA - let the API interceptor handle it
      // It will prompt once if needed and retry automatically
      const declarations = selectedDates.map((date) => ({
        date,
        premiumPoolAmount: data.premiumPoolAmount,
        performancePoolAmount: data.performancePoolAmount,
        rosPercentage: data.rosPercentage,
      }));

      await bulkDeclareMutation.mutateAsync({
        declarations,
        // twoFACode will be added by the API interceptor if needed
      });

      // Success message is handled by the mutation's onSuccess
      onOpenChange(false);
      reset();
      setSelectedDates([]);
    } catch (error: any) {
      // Error message is handled by the mutation's onError
      // But handle user cancellation gracefully
      if (error?.message === '2FA_CODE_REQUIRED') {
        // User cancelled 2FA prompt - don't show error
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Declare Daily Profits</DialogTitle>
          <DialogDescription>
            Select multiple dates and declare the same pool amounts and ROS
            percentage for all (up to 30 days)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="premiumPoolAmount">Premium Pool Amount ($)</Label>
            <Input
              id="premiumPoolAmount"
              type="number"
              step="0.01"
              min="0"
              {...register('premiumPoolAmount', { valueAsNumber: true })}
              disabled={isLoading}
              placeholder="10000"
            />
            {errors.premiumPoolAmount && (
              <p className="text-sm text-red-500">
                {errors.premiumPoolAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="performancePoolAmount">
              Performance Pool Amount ($)
            </Label>
            <Input
              id="performancePoolAmount"
              type="number"
              step="0.01"
              min="0"
              {...register('performancePoolAmount', { valueAsNumber: true })}
              disabled={isLoading}
              placeholder="5000"
            />
            {errors.performancePoolAmount && (
              <p className="text-sm text-red-500">
                {errors.performancePoolAmount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rosPercentage">ROS Percentage (%)</Label>
            <Input
              id="rosPercentage"
              type="number"
              step="0.01"
              min="0"
              max={String(MAX_ROS_PERCENTAGE)}
              {...register('rosPercentage', { valueAsNumber: true })}
              disabled={isLoading}
              placeholder="0.55"
            />
            {errors.rosPercentage && (
              <p className="text-sm text-red-500">
                {errors.rosPercentage.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Max {MAX_ROS_PERCENTAGE}% (e.g., 0.55 for 0.55%)
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Pool Amount:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                $
                {(
                  (premiumPoolAmount || 0) + (performancePoolAmount || 0)
                ).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Dates ({selectedDates.length} selected)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={isLoading}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={isLoading}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="grid max-h-64 grid-cols-7 gap-2 overflow-y-auto rounded-lg border p-2">
              {availableDates.map((date) => {
                const isSelected = selectedDates.includes(date);
                // Extract day number from YYYY-MM-DD string
                const dayNumber = date.split('-')[2];
                // Get weekday using UTC-safe formatting
                const [y, m, d] = date.split('-').map(Number);
                const dateObj = new Date(Date.UTC(y, m - 1, d));
                const dayName = new Intl.DateTimeFormat('en-US', {
                  weekday: 'short',
                  timeZone: 'UTC',
                }).format(dateObj);

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => toggleDate(date)}
                    disabled={isLoading}
                    className={`rounded border p-2 text-xs transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-500 text-white'
                        : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
                    } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
                  >
                    <div className="text-center">
                      <div className="text-xs opacity-70">{dayName}</div>
                      <div className="font-semibold">{dayNumber}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.selectedDates && (
              <p className="text-sm text-red-500">
                {errors.selectedDates.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedDates([]);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedDates.length === 0}
            >
              {isLoading
                ? 'Processing...'
                : `Declare for ${selectedDates.length} Day(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

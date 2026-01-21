'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeclareDailyProfit, useUpdateDailyProfit } from '@/lib/mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { DailyProfit } from '@/types/dailyProfit';
import {
  utcDayString,
  isPastDate,
  isFutureDate,
  formatDateWithWeekday,
} from '@/lib/dateUtils';

const MAX_ROS_PERCENTAGE = 2.2;

const declareProfitSchema = z.object({
  date: z.string().min(1, 'Date is required'),
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
  description: z.string().optional(),
});

type DeclareProfitFormData = z.infer<typeof declareProfitSchema>;

interface DeclareProfitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  editingProfit?: DailyProfit;
}

export function DeclareProfitModal({
  open,
  onOpenChange,
  initialDate,
  editingProfit,
}: DeclareProfitModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const declareMutation = useDeclareDailyProfit();
  const updateMutation = useUpdateDailyProfit();
  const isLocked = editingProfit?.isDistributed === true;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DeclareProfitFormData>({
    resolver: zodResolver(declareProfitSchema),
    defaultValues: {
      date: initialDate || '',
      premiumPoolAmount: editingProfit?.premiumPoolAmount || 0,
      performancePoolAmount: editingProfit?.performancePoolAmount || 0,
      rosPercentage: editingProfit?.rosPercentage || 0,
      description: editingProfit?.description || '',
    },
  });

  const watchedDate = watch('date');
  const watchedPremiumPool = watch('premiumPoolAmount');
  const watchedPerformancePool = watch('performancePoolAmount');

  // Calculate total pool amount
  const totalPoolAmount =
    (watchedPremiumPool || 0) + (watchedPerformancePool || 0);

  // Set initial date when modal opens
  useEffect(() => {
    if (open) {
      if (initialDate) {
        setValue('date', initialDate);
      } else if (!editingProfit) {
        // Default to today if no date provided
        setValue('date', utcDayString());
      }
      if (editingProfit) {
        setValue('date', editingProfit.date);
        setValue('premiumPoolAmount', editingProfit.premiumPoolAmount);
        setValue('performancePoolAmount', editingProfit.performancePoolAmount);
        setValue('rosPercentage', editingProfit.rosPercentage);
        setValue('description', editingProfit.description || '');
      }
    } else {
      reset();
    }
  }, [open, initialDate, editingProfit, setValue, reset]);

  // Validate date is not in the past and not more than 30 days ahead
  const validateDate = (dateStr: string): boolean => {
    const todayUtc = utcDayString();

    // Calculate max date (30 days from today) using UTC day strings
    const todayDate = new Date();
    const maxDate = new Date(todayDate);
    maxDate.setUTCDate(todayDate.getUTCDate() + 30);
    const maxDateUtc = utcDayString(maxDate);

    if (isPastDate(dateStr, todayUtc)) {
      toast.error('Cannot declare profit for past dates');
      return false;
    }
    if (dateStr > maxDateUtc) {
      toast.error('Cannot declare profit more than 30 days in advance');
      return false;
    }
    return true;
  };

  const onSubmit = async (data: DeclareProfitFormData) => {
    if (isLocked) {
      toast.error('Distributed (locked): this day cannot be edited.');
      return;
    }

    if (!validateDate(data.date)) {
      return;
    }

    setIsLoading(true);
    try {
      // Don't manually prompt for 2FA - let the API interceptor handle it
      // It will prompt once if needed and retry automatically
      if (editingProfit) {
        // Update existing profit
        await updateMutation.mutateAsync({
          date: editingProfit.date,
          data: {
            premiumPoolAmount: data.premiumPoolAmount,
            performancePoolAmount: data.performancePoolAmount,
            rosPercentage: data.rosPercentage,
            description: data.description,
            // twoFACode will be added by the API interceptor if needed
          },
        });
        // Success message is handled by the mutation's onSuccess
      } else {
        // Declare new profit
        await declareMutation.mutateAsync({
          date: data.date,
          premiumPoolAmount: data.premiumPoolAmount,
          performancePoolAmount: data.performancePoolAmount,
          rosPercentage: data.rosPercentage,
          description: data.description,
          // twoFACode will be added by the API interceptor if needed
        });
        // Success message is handled by the mutation's onSuccess
      }

      onOpenChange(false);
      reset();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isLocked
              ? 'Daily Profit (Locked)'
              : editingProfit
                ? 'Edit Daily Profit'
                : 'Declare Daily Profit'}
          </DialogTitle>
          <DialogDescription>
            {isLocked
              ? 'This day has already been distributed and is locked from edits/deletes.'
              : editingProfit
                ? 'Update the pool amounts and ROS percentage for this date'
                : 'Declare the pool amounts and ROS percentage for a specific date (up to 30 days ahead)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isLocked && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-200">
              <span className="font-semibold">Distributed (locked)</span> —
              edits and deletes are disabled for this day.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              disabled={isLoading || isLocked || !!editingProfit}
              min={utcDayString()}
              max={(() => {
                const todayDate = new Date();
                const maxDate = new Date(todayDate);
                maxDate.setUTCDate(todayDate.getUTCDate() + 30);
                return utcDayString(maxDate);
              })()}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
            {watchedDate && (
              <p className="text-xs text-gray-500">
                {formatDateWithWeekday(watchedDate)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="premiumPoolAmount">Premium Pool Amount ($)</Label>
            <Input
              id="premiumPoolAmount"
              type="number"
              step="0.01"
              min="0"
              {...register('premiumPoolAmount', { valueAsNumber: true })}
              disabled={isLoading || isLocked}
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
              disabled={isLoading || isLocked}
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
              disabled={isLoading || isLocked}
              placeholder="0.55"
            />
            {errors.rosPercentage && (
              <p className="text-sm text-red-500">
                {errors.rosPercentage.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter a value between 0 and {MAX_ROS_PERCENTAGE} (e.g., 0.55 for
              0.55%)
            </p>
          </div>

          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <Label className="text-base font-semibold">Total Pool Amount</Label>
            <p className="text-primary text-2xl font-bold">
              $
              {totalPoolAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-500">
              Sum of Premium Pool and Performance Pool amounts
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              disabled={isLoading || isLocked}
              placeholder="Normal day, Special event, etc."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {isLocked ? 'Close' : 'Cancel'}
            </Button>
            {!isLocked && (
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Processing...'
                  : editingProfit
                    ? 'Update Profit'
                    : 'Declare Profit'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

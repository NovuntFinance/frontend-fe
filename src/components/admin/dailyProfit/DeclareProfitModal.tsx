'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeclareDailyProfit, useUpdateDailyProfit } from '@/lib/mutations';
import { use2FA } from '@/contexts/TwoFAContext';
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
    .max(100, 'ROS percentage cannot exceed 100'),
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
  const { promptFor2FA } = use2FA();
  const declareMutation = useDeclareDailyProfit();
  const updateMutation = useUpdateDailyProfit();

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
        const today = new Date().toISOString().split('T')[0];
        setValue('date', today);
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
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);

    if (date < today) {
      toast.error('Cannot declare profit for past dates');
      return false;
    }
    if (date > maxDate) {
      toast.error('Cannot declare profit more than 30 days in advance');
      return false;
    }
    return true;
  };

  const onSubmit = async (data: DeclareProfitFormData) => {
    if (!validateDate(data.date)) {
      return;
    }

    setIsLoading(true);
    try {
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        setIsLoading(false);
        return;
      }

      if (editingProfit) {
        // Update existing profit
        await updateMutation.mutateAsync({
          date: editingProfit.date,
          data: {
            premiumPoolAmount: data.premiumPoolAmount,
            performancePoolAmount: data.performancePoolAmount,
            rosPercentage: data.rosPercentage,
            description: data.description,
            twoFACode,
          },
        });
        toast.success('Profit updated successfully');
      } else {
        // Declare new profit
        await declareMutation.mutateAsync({
          date: data.date,
          premiumPoolAmount: data.premiumPoolAmount,
          performancePoolAmount: data.performancePoolAmount,
          rosPercentage: data.rosPercentage,
          description: data.description,
          twoFACode,
        });
        toast.success('Profit declared successfully');
      }

      onOpenChange(false);
      reset();
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to declare profit';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingProfit ? 'Edit Daily Profit' : 'Declare Daily Profit'}
          </DialogTitle>
          <DialogDescription>
            {editingProfit
              ? 'Update the pool amounts and ROS percentage for this date'
              : 'Declare the pool amounts and ROS percentage for a specific date (up to 30 days ahead)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              disabled={isLoading || !!editingProfit}
              min={new Date().toISOString().split('T')[0]}
              max={
                new Date(new Date().setDate(new Date().getDate() + 30))
                  .toISOString()
                  .split('T')[0]
              }
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
            {watchedDate && (
              <p className="text-xs text-gray-500">
                {new Date(watchedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
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
              max="100"
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
              Enter a value between 0 and 100 (e.g., 0.55 for 0.55%)
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
              disabled={isLoading}
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Processing...'
                : editingProfit
                  ? 'Update Profit'
                  : 'Declare Profit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

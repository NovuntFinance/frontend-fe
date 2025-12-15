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
  profitPercentage: z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
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
      profitPercentage: editingProfit?.profitPercentage || 0,
      description: editingProfit?.description || '',
    },
  });

  const watchedDate = watch('date');

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
        setValue('profitPercentage', editingProfit.profitPercentage);
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
            profitPercentage: data.profitPercentage,
            description: data.description,
            twoFACode,
          },
        });
        toast.success('Profit updated successfully');
      } else {
        // Declare new profit
        await declareMutation.mutateAsync({
          date: data.date,
          profitPercentage: data.profitPercentage,
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
              ? 'Update the profit percentage for this date'
              : 'Declare the profit percentage for a specific date (up to 30 days ahead)'}
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
            <Label htmlFor="profitPercentage">Profit Percentage (%)</Label>
            <Input
              id="profitPercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('profitPercentage', { valueAsNumber: true })}
              disabled={isLoading}
              placeholder="1.5"
            />
            {errors.profitPercentage && (
              <p className="text-sm text-red-500">
                {errors.profitPercentage.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter a value between 0 and 100 (e.g., 1.5 for 1.5%)
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

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDeclareBulkDailyProfit } from '@/lib/mutations';
import { use2FA } from '@/contexts/TwoFAContext';
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
import { toast } from 'sonner';
import { format, addDays, startOfToday } from 'date-fns';

const bulkDeclareSchema = z.object({
  profitPercentage: z
    .number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage cannot exceed 100'),
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
  const { promptFor2FA } = use2FA();
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
      profitPercentage: 0,
      selectedDates: [],
    },
  });

  const profitPercentage = watch('profitPercentage');

  // Generate next 30 days
  const today = startOfToday();
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(today, i);
    return format(date, 'yyyy-MM-dd');
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
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        setIsLoading(false);
        return;
      }

      const declarations = selectedDates.map((date) => ({
        date,
        profitPercentage: data.profitPercentage,
      }));

      await bulkDeclareMutation.mutateAsync({
        declarations,
        twoFACode,
      });

      toast.success(`Declared profit for ${selectedDates.length} day(s)`);
      onOpenChange(false);
      reset();
      setSelectedDates([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to declare bulk profits';
      toast.error(message);
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
            Select multiple dates and declare the same profit percentage for all
            (up to 30 days)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                const dateObj = new Date(date);
                const dayName = format(dateObj, 'EEE');
                const dayNumber = format(dateObj, 'd');

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

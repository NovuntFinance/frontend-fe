'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { poolService } from '@/services/poolService';
import { use2FA } from '@/contexts/TwoFAContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const declarePoolSchema = z.object({
  autoDistribute: z.boolean().default(false),
  notes: z.string().optional(),
});

type DeclarePoolFormData = z.infer<typeof declarePoolSchema>;

interface DeclarePoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  performanceAmount: number;
  premiumAmount: number;
  onSuccess: () => void;
}

export function DeclarePoolModal({
  open,
  onOpenChange,
  performanceAmount,
  premiumAmount,
  onSuccess,
}: DeclarePoolModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { promptFor2FA } = use2FA();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DeclarePoolFormData>({
    resolver: zodResolver(declarePoolSchema),
    defaultValues: {
      autoDistribute: false,
      notes: '',
    },
  });

  const autoDistribute = watch('autoDistribute');
  const totalAmount = performanceAmount + premiumAmount;

  const onSubmit = async (data: DeclarePoolFormData) => {
    if (totalAmount <= 0) {
      toast.error('Please enter at least one pool amount');
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

      const response = await poolService.declarePools({
        performancePoolAmount: performanceAmount,
        premiumPoolAmount: premiumAmount,
        autoDistribute: data.autoDistribute,
        notes: data.notes || undefined,
      });

      if (response.success) {
        if (data.autoDistribute && response.data.distribution?.distributed) {
          toast.success('Pools declared and distributed successfully', {
            description: `Total distributed: ${formatCurrency(response.data.distribution.totalDistributed || 0)}`,
          });
        } else {
          toast.success('Pools declared successfully', {
            description: 'Use the distribute button to distribute pools later.',
          });
        }
        onOpenChange(false);
        reset();
        onSuccess();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to declare pools';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Declare Pool Amounts</DialogTitle>
          <DialogDescription>
            Confirm pool declaration. You can distribute immediately or later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Summary */}
          <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Performance Pool:
              </span>
              <span className="font-semibold">
                {formatCurrency(performanceAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Premium Pool:
              </span>
              <span className="font-semibold">
                {formatCurrency(premiumAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Auto Distribute Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoDistribute"
              checked={autoDistribute}
              onCheckedChange={(checked) => {
                setValue('autoDistribute', checked === true);
              }}
              disabled={isLoading}
            />
            <Label
              htmlFor="autoDistribute"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              onClick={() => {
                setValue('autoDistribute', !autoDistribute);
              }}
            >
              Distribute immediately after declaration
            </Label>
          </div>
          {autoDistribute && (
            <p className="text-muted-foreground ml-6 text-xs">
              Pools will be distributed to all qualifiers immediately after
              declaration.
            </p>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Add any notes about this pool declaration..."
              disabled={isLoading}
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
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
              {isLoading ? (
                <>Processing...</>
              ) : autoDistribute ? (
                <>Declare & Distribute</>
              ) : (
                <>Declare Only</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

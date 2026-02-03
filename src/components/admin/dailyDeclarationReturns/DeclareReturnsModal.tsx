'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useDeclareReturns, useUpdateDeclaration } from '@/lib/mutations';
import { useDeclarationByDate } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Info } from 'lucide-react';
import {
  utcDayString,
  isPastDate,
  isFutureDate,
  formatDateWithWeekday,
} from '@/lib/dateUtils';

// Testing: up to 100% allowed. Revert to 2.2 for production.
const MAX_ROS_PERCENTAGE = 100;

const declareReturnsSchema = z
  .object({
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
      .max(MAX_ROS_PERCENTAGE, 'ROS percentage must be between 0 and 100'),
    description: z.string().optional(),
    autoDistributePools: z.boolean(),
    autoDistributeROS: z.boolean(),
  })
  .refine(
    (data) =>
      data.premiumPoolAmount > 0 ||
      data.performancePoolAmount > 0 ||
      data.rosPercentage > 0,
    {
      message:
        'At least one pool amount or ROS percentage must be greater than 0',
      path: ['premiumPoolAmount'],
    }
  );

type DeclareReturnsFormData = z.infer<typeof declareReturnsSchema>;

interface DeclareReturnsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  onSuccess?: () => void;
}

export function DeclareReturnsModal({
  open,
  onOpenChange,
  initialDate,
  onSuccess,
}: DeclareReturnsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const declareMutation = useDeclareReturns();
  const updateMutation = useUpdateDeclaration();
  const pollAbortRef = useRef(false);

  // Fetch existing declaration if initialDate is provided
  const { data: existingDeclaration, isLoading: isLoadingDeclaration } =
    useDeclarationByDate(initialDate || '');

  const isEditing = !!existingDeclaration && !!initialDate;
  const isLocked =
    existingDeclaration?.poolsDistributed &&
    existingDeclaration?.rosDistributed;
  const isPartiallyDistributed =
    (existingDeclaration?.poolsDistributed ||
      existingDeclaration?.rosDistributed) &&
    !isLocked;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DeclareReturnsFormData>({
    resolver: zodResolver(declareReturnsSchema),
    defaultValues: {
      date: initialDate || '',
      premiumPoolAmount: 0,
      performancePoolAmount: 0,
      rosPercentage: 0,
      description: '',
      autoDistributePools: false,
      autoDistributeROS: false,
    },
  });

  const watchedDate = watch('date');
  const watchedPremiumPool = watch('premiumPoolAmount');
  const watchedPerformancePool = watch('performancePoolAmount');
  const watchedROS = watch('rosPercentage');

  // Clear mutation errors when modal closes so the "backend 2.2%" banner only shows after a failed submit
  useEffect(() => {
    if (!open) {
      declareMutation.reset();
      updateMutation.reset();
    }
  }, [open, declareMutation, updateMutation]);

  // Calculate total pool amount
  const totalPoolAmount =
    (watchedPremiumPool || 0) + (watchedPerformancePool || 0);

  // Set initial date and load existing data when modal opens
  useEffect(() => {
    if (open) {
      if (initialDate) {
        setValue('date', initialDate);
      } else if (!isEditing) {
        setValue('date', utcDayString());
      }

      // Load existing declaration data if editing
      if (existingDeclaration && isEditing) {
        setValue('premiumPoolAmount', existingDeclaration.premiumPoolAmount);
        setValue(
          'performancePoolAmount',
          existingDeclaration.performancePoolAmount
        );
        setValue('rosPercentage', existingDeclaration.rosPercentage);
        setValue('description', existingDeclaration.description || '');
        setValue('autoDistributePools', false); // Don't auto-distribute on update
        setValue('autoDistributeROS', false);
      } else {
        // Reset form for new declaration
        reset({
          date: initialDate || utcDayString(),
          premiumPoolAmount: 0,
          performancePoolAmount: 0,
          rosPercentage: 0,
          description: '',
          autoDistributePools: false,
          autoDistributeROS: false,
        });
      }
    }
  }, [open, initialDate, existingDeclaration, isEditing, setValue, reset]);

  // Stop polling when modal closes
  useEffect(() => {
    if (!open) pollAbortRef.current = true;
  }, [open]);

  /** Poll GET declaration by date until rosDistributed is true (for 202 declare with autoDistributeROS) */
  const pollDeclarationUntilROSDone = async (date: string) => {
    const POLL_INTERVAL_MS = 5000;
    const MAX_ATTEMPTS = 24; // ~2 minutes
    let attempts = 0;

    const poll = async () => {
      if (pollAbortRef.current || attempts >= MAX_ATTEMPTS) return;
      attempts++;
      try {
        const { dailyDeclarationReturnsService } = await import(
          '@/services/dailyDeclarationReturnsService'
        );
        const res =
          await dailyDeclarationReturnsService.getDeclarationByDate(date);
        queryClient.invalidateQueries({
          queryKey: ['admin', 'daily-declaration-returns'],
        });
        if (res?.data?.rosDistributed) return;
      } catch {
        // ignore; will retry or timeout
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    };
    setTimeout(poll, POLL_INTERVAL_MS);
  };

  const onSubmit = async (data: DeclareReturnsFormData) => {
    if (isLocked) {
      toast.error('Cannot modify a fully distributed declaration');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && !isLocked) {
        // Update existing declaration
        await updateMutation.mutateAsync({
          date: data.date,
          data: {
            premiumPoolAmount: data.premiumPoolAmount,
            performancePoolAmount: data.performancePoolAmount,
            rosPercentage: data.rosPercentage,
            description: data.description,
          },
        });
      } else {
        // Create new declaration (backend returns 201 or 202 when autoDistributeROS + rosPercentage > 0)
        const response = await declareMutation.mutateAsync({
          date: data.date,
          premiumPoolAmount: data.premiumPoolAmount,
          performancePoolAmount: data.performancePoolAmount,
          rosPercentage: data.rosPercentage,
          description: data.description,
          autoDistributePools: data.autoDistributePools,
          autoDistributeROS: data.autoDistributeROS,
        });

        const responseData = response?.data ?? response;
        const is202 =
          (response as { _httpStatus?: number })?._httpStatus === 202;
        if (responseData?.qualifiers) {
          const qualifiers = responseData.qualifiers;
          const perfTotal = qualifiers.performancePool?.total ?? 0;
          const premTotal = qualifiers.premiumPool?.total ?? 0;

          if (perfTotal > 0 || premTotal > 0) {
            toast.success('Declaration created', {
              description: `Performance Pool: ${perfTotal} qualifiers, Premium Pool: ${premTotal} qualifiers`,
              duration: 5000,
            });
          }
        }

        // Show auto-distribution results if available
        if (responseData?.poolDistribution && data.autoDistributePools) {
          const poolDist = responseData.poolDistribution;
          if (poolDist.distributed) {
            toast.success('Pools auto-distributed', {
              description: `Performance: ${poolDist.performancePool.distributed} users, Premium: ${poolDist.premiumPool.distributed} users`,
              duration: 5000,
            });
          }
        }

        if (responseData?.rosDistribution && data.autoDistributeROS) {
          const rosDist = responseData.rosDistribution;
          if (rosDist.distributed) {
            toast.success('ROS auto-distributed', {
              description: 'ROS distribution completed successfully',
              duration: 5000,
            });
          } else if (is202 || rosDist.status === 'processing') {
            // Backend returned 202: ROS running in background (handoff: poll GET :date until rosDistributed)
            pollAbortRef.current = false;
            pollDeclarationUntilROSDone(data.date);
          }
        }
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      // Mutation's onError shows the toast; log full response for debugging
      const message =
        typeof error?.message === 'string'
          ? error.message
          : String(error?.message ?? '');
      const status = error?.response?.status ?? error?.statusCode ?? '';
      const statusText =
        typeof error?.response?.statusText === 'string'
          ? error.response.statusText
          : '';
      let dataStr = '';
      try {
        const d = error?.response?.data ?? error?.response;
        dataStr = d != null ? JSON.stringify(d) : '';
      } catch (_) {
        dataStr = String(error?.response?.data ?? '');
      }
      console.error(
        '[DeclareReturnsModal] Declare/update failed:',
        message || 'Unknown error',
        '| status:',
        status,
        statusText ? `| statusText: ${statusText}` : '',
        dataStr ? `| response: ${dataStr}` : ''
      );
    } finally {
      setIsLoading(false);
    }
  };

  const dateObj = watchedDate ? new Date(watchedDate + 'T00:00:00Z') : null;
  const isPast = dateObj ? isPastDate(watchedDate, utcDayString()) : false;
  const isFuture = dateObj ? isFutureDate(watchedDate, utcDayString()) : false;
  const canEdit = !isLocked && (!isPast || isEditing);

  // Detect "ROS 0–2.2%" backend error so we can show a clear fix banner
  const lastError = declareMutation.error ?? updateMutation.error ?? null;
  const lastErrorMessage =
    typeof lastError?.response?.data?.message === 'string'
      ? lastError.response.data.message
      : typeof (lastError?.response?.data as any)?.error === 'string'
        ? (lastError.response.data as any).error
        : typeof lastError?.message === 'string'
          ? lastError.message
          : '';
  const isBackendRos22Error =
    lastErrorMessage.includes('2.2') &&
    (lastErrorMessage.toLowerCase().includes('ros') ||
      lastErrorMessage.includes('percentage'));
  const apiBaseUrl =
    typeof process.env.NEXT_PUBLIC_API_URL === 'string'
      ? process.env.NEXT_PUBLIC_API_URL
      : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? isLocked
                ? 'View Declaration (Locked)'
                : isPartiallyDistributed
                  ? 'Update Declaration (Partially Distributed)'
                  : 'Update Declaration'
              : 'Declare Daily Returns'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? isLocked
                ? 'This declaration has been fully distributed and cannot be modified.'
                : isPartiallyDistributed
                  ? 'This declaration has been partially distributed. You can only update non-distributed fields.'
                  : 'Update pools and ROS for this date.'
              : 'Declare pools and ROS (Returns on Stake) for a specific date.'}
          </DialogDescription>
        </DialogHeader>

        {isBackendRos22Error && (
          <Alert variant="destructive" className="rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Backend does not allow 0–100% ROS yet</AlertTitle>
            <AlertDescription>
              <div className="mt-1 space-y-2 text-sm">
                <p>
                  The server you&apos;re connected to still only allows ROS
                  0–2.2%. The frontend cannot fix this — the backend must be
                  updated and redeployed.
                </p>
                {apiBaseUrl && (
                  <p className="font-mono text-xs break-all">
                    Current API: {apiBaseUrl}
                  </p>
                )}
                <p className="mt-2 font-medium">To fix:</p>
                <ol className="ml-1 list-inside list-decimal space-y-1">
                  <li>
                    <strong>Redeploy the backend</strong> at the URL above with
                    the 0–100% ROS validation (see{' '}
                    <code className="text-xs">
                      BACKEND_PROMPT_ROS_0_100_VALIDATION.md
                    </code>
                    ).
                  </li>
                  <li>
                    <strong>Or use a local backend:</strong> In{' '}
                    <code className="text-xs">.env.local</code> set only{' '}
                    <code className="text-xs">
                      NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
                    </code>
                    , run your backend locally with the 0–100% fix, then restart
                    this app.
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              disabled={isEditing || isLoading || isLoadingDeclaration}
              className={errors.date ? 'border-red-500' : ''}
            />
            {watchedDate && (
              <p className="text-muted-foreground text-sm">
                {formatDateWithWeekday(watchedDate)}
              </p>
            )}
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
            {isPast && !isEditing && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Cannot declare for past dates
              </p>
            )}
          </div>

          {/* Pool Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premiumPoolAmount">
                Premium Pool Amount ($) *
              </Label>
              <Input
                id="premiumPoolAmount"
                type="number"
                step="0.01"
                min="0"
                {...register('premiumPoolAmount', {
                  valueAsNumber: true,
                })}
                disabled={isLoading || isLoadingDeclaration || isLocked}
                className={errors.premiumPoolAmount ? 'border-red-500' : ''}
              />
              {errors.premiumPoolAmount && (
                <p className="text-sm text-red-500">
                  {errors.premiumPoolAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="performancePoolAmount">
                Performance Pool Amount ($) *
              </Label>
              <Input
                id="performancePoolAmount"
                type="number"
                step="0.01"
                min="0"
                {...register('performancePoolAmount', {
                  valueAsNumber: true,
                })}
                disabled={isLoading || isLoadingDeclaration || isLocked}
                className={errors.performancePoolAmount ? 'border-red-500' : ''}
              />
              {errors.performancePoolAmount && (
                <p className="text-sm text-red-500">
                  {errors.performancePoolAmount.message}
                </p>
              )}
            </div>
          </div>

          {/* Total Pool Amount Display */}
          {totalPoolAmount > 0 && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Total Pool Amount: ${totalPoolAmount.toLocaleString()}
              </p>
            </div>
          )}

          {/* Declaration detail: show pools distribution breakdown when available (from GET by date; includes Premium) */}
          {isEditing && existingDeclaration?.poolsDistributionDetails && (
            <div className="rounded-lg border border-green-500/30 bg-green-50 p-3 dark:bg-green-900/20">
              <p className="mb-2 text-sm font-semibold text-green-900 dark:text-green-100">
                Pool distribution (this date)
              </p>
              <div className="text-muted-foreground space-y-1 text-sm">
                <p>
                  Performance:{' '}
                  {existingDeclaration.poolsDistributionDetails.performancePool
                    ?.distributed ?? 0}{' '}
                  users,{' '}
                  {(
                    existingDeclaration.poolsDistributionDetails.performancePool
                      ?.totalDistributed ?? 0
                  ).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p>
                  Premium:{' '}
                  {existingDeclaration.poolsDistributionDetails.premiumPool
                    ?.distributed ?? 0}{' '}
                  users,{' '}
                  {(
                    existingDeclaration.poolsDistributionDetails.premiumPool
                      ?.totalDistributed ?? 0
                  ).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                  })}
                </p>
                {existingDeclaration.poolsDistributionDetails.note && (
                  <p className="mt-1 text-yellow-600 italic dark:text-yellow-400">
                    {existingDeclaration.poolsDistributionDetails.note}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ROS Percentage */}
          <div className="space-y-2">
            <Label htmlFor="rosPercentage">
              ROS Percentage (%) * (Max: {MAX_ROS_PERCENTAGE}%. Testing: up to
              100% allowed.)
            </Label>
            <Input
              id="rosPercentage"
              type="number"
              step="0.01"
              min="0"
              max={MAX_ROS_PERCENTAGE}
              {...register('rosPercentage', {
                valueAsNumber: true,
              })}
              disabled={isLoading || isLoadingDeclaration || isLocked}
              className={errors.rosPercentage ? 'border-red-500' : ''}
            />
            {errors.rosPercentage && (
              <p className="text-sm text-red-500">
                {errors.rosPercentage.message}
              </p>
            )}
            {watchedROS > 0 && (
              <p className="text-muted-foreground text-sm">
                ROS: {watchedROS}% of total stakes
              </p>
            )}
          </div>

          {/* Auto-Distribute Options (only for new declarations) */}
          {!isEditing && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="text-base font-semibold">
                Auto-Distribution Options
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoDistributePools"
                    {...register('autoDistributePools')}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="autoDistributePools"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Auto-distribute pools immediately
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoDistributeROS"
                    {...register('autoDistributeROS')}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="autoDistributeROS"
                    className="cursor-pointer text-sm font-normal"
                  >
                    Auto-distribute ROS immediately
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              disabled={isLoading || isLoadingDeclaration || isLocked}
              placeholder="Add a note about this declaration..."
              rows={3}
            />
          </div>

          {/* Visibility Warning */}
          {!isEditing && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-50/50 p-3 dark:bg-yellow-900/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <div className="space-y-1 text-xs">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    User Visibility Notice
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-400">
                    Users cannot see this declaration until 23:59:59 BIT after
                    distribution. Throughout the day, users only see the
                    previous day&apos;s profit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                isLoadingDeclaration ||
                !canEdit ||
                (isPast && !isEditing)
              }
            >
              {isLoading
                ? 'Processing...'
                : isEditing
                  ? 'Update Declaration'
                  : 'Declare Returns'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

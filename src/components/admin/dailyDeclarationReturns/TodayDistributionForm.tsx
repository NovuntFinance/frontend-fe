'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dailyDeclarationReturnsService } from '@/services/dailyDeclarationReturnsService';
import { use2FA } from '@/contexts/TwoFAContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import type {
  QueueDistributionRequest,
  ModifyDistributionRequest,
} from '@/types/dailyDeclarationReturns';

const POLLING_INTERVAL = 30000; // 30 seconds
const STATUS_MESSAGES: Record<string, string> = {
  EMPTY: 'No distribution queued for today',
  PENDING: 'Distribution scheduled for 3:59:59 PM Nigeria',
  SCHEDULED: 'System recognized (internal state)',
  EXECUTING: 'Distribution is running...',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  EMPTY: <AlertCircle className="h-5 w-5 text-gray-600" />,
  PENDING: <Clock className="h-5 w-5 animate-pulse text-blue-600" />,
  SCHEDULED: <Clock className="h-5 w-5 text-blue-600" />,
  EXECUTING: <Loader2 className="h-5 w-5 animate-spin text-amber-600" />,
  COMPLETED: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  FAILED: <XCircle className="h-5 w-5 text-red-600" />,
};

interface FormValues {
  rosPercentage: number | '';
  premiumPoolAmount: number | '';
  performancePoolAmount: number | '';
  description: string;
}

export function TodayDistributionForm() {
  const { promptFor2FA } = use2FA();
  const [formValues, setFormValues] = useState<FormValues>({
    rosPercentage: '',
    premiumPoolAmount: '',
    performancePoolAmount: '',
    description: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  // Set up 2FA here
  useEffect(() => {
    dailyDeclarationReturnsService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
  }, [promptFor2FA]);

  const {
    data: statusData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['today-status'],
    queryFn: async () => {
      const response = await dailyDeclarationReturnsService.getTodayStatus();
      return response.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'EXECUTING') return 10000; // 10s while executing
      if (data?.status === 'PENDING') {
        const now = new Date();
        const scheduled = data.scheduledFor
          ? new Date(data.scheduledFor)
          : null;
        if (scheduled) {
          const diff = scheduled.getTime() - now.getTime();
          if (diff > 0 && diff < 10 * 60 * 1000) return 10000; // 10s if within 10 mins
        }
      }
      return POLLING_INTERVAL;
    },
    staleTime: 5000,
  });

  // Auto-update form values from API response
  useEffect(() => {
    if (statusData?.values) {
      setFormValues({
        rosPercentage: statusData.values.rosPercentage || '',
        premiumPoolAmount: statusData.values.premiumPoolAmount || '',
        performancePoolAmount: statusData.values.performancePoolAmount || '',
        description: statusData.values.description || '',
      });
    }
  }, [statusData]);

  // Load form from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dailyDeclarationForm');
    if (saved) {
      try {
        setFormValues(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save form to localStorage
  useEffect(() => {
    localStorage.setItem('dailyDeclarationForm', JSON.stringify(formValues));
  }, [formValues]);

  // Countdown timer logic
  useEffect(() => {
    if (statusData?.status !== 'PENDING' || !statusData?.scheduledFor) {
      setCountdown('');
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const scheduled = new Date(statusData.scheduledFor!);
      const diff = scheduled.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Executing now...');
        refetch();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setCountdown(parts.join(' '));
    }, 1000);

    return () => clearInterval(timer);
  }, [statusData, refetch]);

  // Handle form input changes
  const handleInputChange = (
    field: keyof FormValues,
    value: string | number
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form
  const validateForm = (): string | null => {
    const ros = Number(formValues.rosPercentage);
    const premium = Number(formValues.premiumPoolAmount);
    const performance = Number(formValues.performancePoolAmount);

    if (
      (isNaN(ros) || isNaN(premium) || isNaN(performance)) &&
      ros === 0 &&
      premium === 0 &&
      performance === 0
    ) {
      return 'At least one value must be greater than 0';
    }

    if (isNaN(ros) || ros < 0 || ros > 100) {
      return 'ROS percentage must be between 0 and 100';
    }

    if (isNaN(premium) || premium < 0) {
      return 'Premium pool amount must be 0 or greater';
    }

    if (isNaN(performance) || performance < 0) {
      return 'Performance pool amount must be 0 or greater';
    }

    return null;
  };

  // Queue distribution mutation
  const queueMutation = useMutation({
    mutationFn: async (data: QueueDistributionRequest) => {
      return await dailyDeclarationReturnsService.queueDistribution(data);
    },
    onSuccess: () => {
      toast.success('Distribution queued successfully');
      refetch();
      setIsEditing(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to queue distribution';
      toast.error(errorMessage);
    },
  });

  // Modify distribution mutation
  const modifyMutation = useMutation({
    mutationFn: async (data: ModifyDistributionRequest) => {
      return await dailyDeclarationReturnsService.modifyDistribution(data);
    },
    onSuccess: () => {
      toast.success('Distribution modified successfully');
      refetch();
      setIsEditing(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to modify distribution';
      toast.error(errorMessage);
    },
  });

  // Cancel distribution mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await dailyDeclarationReturnsService.cancelDistribution({});
    },
    onSuccess: () => {
      toast.success('Distribution cancelled successfully');
      refetch();
      setShowCancelConfirm(false);
      setIsEditing(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to cancel distribution';
      toast.error(errorMessage);
      setShowCancelConfirm(false);
    },
  });

  // Handle trigger/save
  const handleTrigger = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const ros = Number(formValues.rosPercentage) || 0;
    const premium = Number(formValues.premiumPoolAmount) || 0;
    const performance = Number(formValues.performancePoolAmount) || 0;

    if (statusData?.status === 'EMPTY') {
      // Queue new distribution
      queueMutation.mutate({
        rosPercentage: ros,
        premiumPoolAmount: premium,
        performancePoolAmount: performance,
        description: formValues.description,
      });
    } else if (statusData?.status === 'PENDING' && isEditing) {
      // Modify existing distribution
      modifyMutation.mutate({
        rosPercentage: ros,
        premiumPoolAmount: premium,
        performancePoolAmount: performance,
        description: formValues.description,
      });
    }
  };

  const handleCancel = () => {
    if (showCancelConfirm) {
      cancelMutation.mutate();
    } else {
      setShowCancelConfirm(true);
    }
  };

  const isFormDisabled =
    !isEditing &&
    statusData?.status !== 'EMPTY' &&
    statusData?.status !== undefined;
  const isLoading_ =
    isLoading || queueMutation.isPending || modifyMutation.isPending;
  const isCanceling = cancelMutation.isPending;
  const status = statusData?.status || 'EMPTY';
  const lastExecution = statusData?.lastExecution;
  const today = statusData?.today || new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                📋 Today&apos;s Distribution
              </CardTitle>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {today}
              </p>
            </div>
            {status !== 'EMPTY' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading_}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ROS Percentage */}
          <div>
            <Label htmlFor="ros" className="flex items-center gap-2">
              ROS Percentage (%)
              {isFormDisabled && !isEditing && (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </Label>
            <Input
              id="ros"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formValues.rosPercentage}
              onChange={(e) =>
                handleInputChange('rosPercentage', e.target.value)
              }
              disabled={isFormDisabled && !isEditing}
              placeholder="Max: 100%"
              className="mt-1"
            />
          </div>

          {/* Premium Pool Amount */}
          <div>
            <Label htmlFor="premium" className="flex items-center gap-2">
              Premium Pool Amount ($)
              {isFormDisabled && !isEditing && (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </Label>
            <Input
              id="premium"
              type="number"
              min="0"
              step="0.01"
              value={formValues.premiumPoolAmount}
              onChange={(e) =>
                handleInputChange('premiumPoolAmount', e.target.value)
              }
              disabled={isFormDisabled && !isEditing}
              placeholder="0.00"
              className="mt-1"
            />
          </div>

          {/* Performance Pool Amount */}
          <div>
            <Label htmlFor="performance" className="flex items-center gap-2">
              Performance Pool Amount ($)
              {isFormDisabled && !isEditing && (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </Label>
            <Input
              id="performance"
              type="number"
              min="0"
              step="0.01"
              value={formValues.performancePoolAmount}
              onChange={(e) =>
                handleInputChange('performancePoolAmount', e.target.value)
              }
              disabled={isFormDisabled && !isEditing}
              placeholder="0.00"
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="flex items-center gap-2">
              Description (Optional)
              {isFormDisabled && !isEditing && (
                <Lock className="h-4 w-4 text-gray-500" />
              )}
            </Label>
            <Input
              id="description"
              type="text"
              value={formValues.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isFormDisabled && !isEditing}
              placeholder="Optional notes..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Indicator */}
      <Card
        className={`border-2 ${
          status === 'COMPLETED'
            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
            : status === 'FAILED'
              ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
              : status === 'PENDING'
                ? 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950'
                : 'border-gray-200'
        }`}
      >
        <CardContent className="flex items-center gap-3 pt-6">
          {STATUS_ICONS[status]}
          <div>
            <p className="font-semibold">{STATUS_MESSAGES[status]}</p>
            {status === 'PENDING' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {countdown
                  ? `Execution in ${countdown} (at 3:59:59 PM WAT)`
                  : 'Scheduled for 3:59:59 PM WAT'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Execution Details */}
      {lastExecution && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Last Execution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Status
                </p>
                <p className="text-lg">
                  {lastExecution.status === 'COMPLETED' ? '✅' : '❌'}{' '}
                  {lastExecution.status}
                </p>
              </div>

              {lastExecution.rosStats && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ROS
                  </p>
                  <p className="text-sm">
                    {lastExecution.rosStats.processedStakes.toLocaleString()}{' '}
                    stakes
                  </p>
                  <p className="text-sm">
                    $
                    {lastExecution.rosStats.totalDistributed.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}
                  </p>
                </div>
              )}
            </div>

            {lastExecution.premiumPoolStats && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Premium Pool
                </p>
                <p className="text-sm">
                  {lastExecution.premiumPoolStats.usersReceived} users → $
                  {lastExecution.premiumPoolStats.totalDistributed.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 }
                  )}
                </p>
              </div>
            )}

            {lastExecution.performancePoolStats && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Performance Pool
                </p>
                <p className="text-sm">
                  {lastExecution.performancePoolStats.usersReceived} users → $
                  {lastExecution.performancePoolStats.totalDistributed.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 }
                  )}
                </p>
              </div>
            )}

            {lastExecution.executionTimeMs && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Execution Time
                </p>
                <p className="text-sm">
                  {(lastExecution.executionTimeMs / 1000).toFixed(1)}s
                </p>
              </div>
            )}

            {lastExecution.error && (
              <div className="rounded bg-red-50 p-2 dark:bg-red-950">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Error: {lastExecution.error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {status === 'EMPTY' && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            disabled={isLoading_}
            size="lg"
            className="gap-2"
          >
            {isLoading_ && <Loader2 className="h-4 w-4 animate-spin" />}
            🚀 Queue Distribution
          </Button>
        )}

        {isEditing && (
          <>
            <Button
              onClick={handleTrigger}
              disabled={isLoading_}
              size="lg"
              className="gap-2"
            >
              {isLoading_ && <Loader2 className="h-4 w-4 animate-spin" />}
              {status === 'EMPTY' ? '✏️ Queue' : '💾 Save Changes'}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              disabled={isLoading_}
              size="lg"
            >
              Cancel Edit
            </Button>
          </>
        )}

        {status === 'PENDING' && !isEditing && (
          <>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              disabled={isLoading_}
              size="lg"
              className="gap-2"
            >
              ✏️ Modify
            </Button>
            <Button
              onClick={handleCancel}
              variant="destructive"
              disabled={isCanceling}
              size="lg"
              className="gap-2"
            >
              {isCanceling && <Loader2 className="h-4 w-4 animate-spin" />}❌{' '}
              {showCancelConfirm ? 'Confirm Cancel' : 'Cancel Distribution'}
            </Button>
            {showCancelConfirm && (
              <Button
                onClick={() => setShowCancelConfirm(false)}
                variant="outline"
                size="lg"
              >
                No, Keep It
              </Button>
            )}
          </>
        )}
      </div>

      {showCancelConfirm && status === 'PENDING' && (
        <Card className="border-2 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="flex items-start gap-3 pt-6">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                Are you sure?
              </p>
              <p className="text-sm text-red-600 dark:text-red-300">
                This will cancel the scheduled distribution. This action cannot
                be undone.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

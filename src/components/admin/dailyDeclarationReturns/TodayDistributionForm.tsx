'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dailyDeclarationReturnsService } from '@/services/dailyDeclarationReturnsService';
import { poolService } from '@/services/poolService';
import { cronSettingsService } from '@/services/cronSettingsService';
import { use2FA } from '@/contexts/TwoFAContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QualifierCounts } from '@/components/admin/pool/QualifierCounts';
import { MultiSlotRosInput } from './MultiSlotRosInput';
import { SlotStatusCard } from './SlotStatusCard';
import { ShimmerCard } from '@/components/ui/shimmer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Lock,
  Info,
} from 'lucide-react';
import type {
  QueueDistributionRequest,
  QueueSingleSlotRequest,
  QueueMultiSlotRequest,
  ModifyDistributionRequest,
} from '@/types/dailyDeclarationReturns';

const POLLING_INTERVAL = 30000; // 30 seconds
const STATUS_MESSAGES: Record<string, string> = {
  EMPTY: 'No distribution queued for today',
  PENDING: 'Distribution Scheduled',
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

type DistributionMode = 'single' | 'multi';

export function TodayDistributionForm() {
  const { promptFor2FA } = use2FA();
  const [formValues, setFormValues] = useState<FormValues>({
    rosPercentage: '',
    premiumPoolAmount: '',
    performancePoolAmount: '',
    description: '',
  });
  const [mode, setMode] = useState<DistributionMode>('single');
  const [multiSlotRosValues, setMultiSlotRosValues] = useState<
    Record<number, number>
  >({});
  const [isEditing, setIsEditing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  // Set up 2FA here
  useEffect(() => {
    dailyDeclarationReturnsService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
    poolService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
    cronSettingsService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
  }, [promptFor2FA]);

  // Fetch cron settings (always fetch to enable smooth mode switching)
  const {
    data: cronSettings,
    isLoading: isLoadingCronSettings,
    error: cronSettingsError,
  } = useQuery({
    queryKey: ['cron-settings'],
    queryFn: async () => {
      const response = await cronSettingsService.getDistributionSchedule();
      return response.data;
    },
    staleTime: 30000,
    retry: 2,
  });

  // Debug cron settings loading
  useEffect(() => {
    console.log('Cron Settings State:', {
      isLoading: isLoadingCronSettings,
      hasData: !!cronSettings,
      hasError: !!cronSettingsError,
      error: cronSettingsError,
      data: cronSettings,
    });
  }, [cronSettings, isLoadingCronSettings, cronSettingsError]);

  // Fetch qualifier counts
  const {
    data: qualifiersData,
    isLoading: isLoadingQualifiers,
    refetch: refetchQualifiers,
  } = useQuery({
    queryKey: ['pool-qualifiers'],
    queryFn: async () => {
      const response = await poolService.getQualifiers();
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });

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

      // Only set mode based on API data when there's an actual distribution
      // (not EMPTY status). This allows users to freely toggle when no distribution is queued.
      if (statusData.status !== 'EMPTY') {
        if (statusData.multiSlotEnabled) {
          setMode('multi');
          // Initialize multi-slot ROS values
          if (statusData.distributionSlots) {
            const rosVals: Record<number, number> = {};
            statusData.distributionSlots.forEach((slot) => {
              rosVals[slot.slotNumber] = slot.rosPercentage;
            });
            setMultiSlotRosValues(rosVals);
          }
        } else {
          setMode('single');
        }
      }
    }
  }, [statusData]);

  // Initialize multi-slot ROS values when cron settings load and mode is multi
  useEffect(() => {
    if (
      cronSettings &&
      mode === 'multi' &&
      Object.keys(multiSlotRosValues).length === 0
    ) {
      const initialValues: Record<number, number> = {};
      cronSettings.slots.forEach((slot, index) => {
        initialValues[index + 1] = 0;
      });
      setMultiSlotRosValues(initialValues);
    }
  }, [cronSettings, mode, multiSlotRosValues]);

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
        // If more than 2 minutes past scheduled time, show warning
        if (Math.abs(diff) > 120000) {
          setCountdown('⚠️ Past execution time - Check status');
          // Force refetch every 10 seconds when overdue
          if (Math.abs(diff / 1000) % 10 === 0) {
            refetch();
          }
        } else {
          setCountdown('Executing now...');
          refetch();
        }
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
    const premium = Number(formValues.premiumPoolAmount);
    const performance = Number(formValues.performancePoolAmount);

    if (isNaN(premium) || premium < 0) {
      return 'Premium pool amount must be 0 or greater';
    }

    if (isNaN(performance) || performance < 0) {
      return 'Performance pool amount must be 0 or greater';
    }

    if (mode === 'single') {
      const ros = Number(formValues.rosPercentage);

      if (isNaN(ros) || ros < 0 || ros > 100) {
        return 'ROS percentage must be between 0 and 100';
      }

      if (ros === 0 && premium === 0 && performance === 0) {
        return 'At least one value must be greater than 0';
      }
    } else {
      // Multi-slot validation
      if (!cronSettings) {
        return 'Cron settings not loaded. Please try again.';
      }

      const slotCount = Object.keys(multiSlotRosValues).length;
      if (slotCount !== cronSettings.slots.length) {
        return `Number of slots (${slotCount}) must match cron settings (${cronSettings.slots.length})`;
      }

      // Validate each slot percentage
      for (const [slotNumber, rosValue] of Object.entries(multiSlotRosValues)) {
        if (isNaN(rosValue) || rosValue < 0 || rosValue > 100) {
          return `Slot ${slotNumber}: ROS percentage must be between 0 and 100`;
        }
      }

      const totalRos = Object.values(multiSlotRosValues).reduce(
        (sum, val) => sum + val,
        0
      );
      if (totalRos === 0 && premium === 0 && performance === 0) {
        return 'At least one value must be greater than 0';
      }
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

    const premium = Number(formValues.premiumPoolAmount) || 0;
    const performance = Number(formValues.performancePoolAmount) || 0;

    if (statusData?.status === 'EMPTY') {
      // Queue new distribution
      if (mode === 'single') {
        const ros = Number(formValues.rosPercentage) || 0;
        queueMutation.mutate({
          rosPercentage: ros,
          premiumPoolAmount: premium,
          performancePoolAmount: performance,
          description: formValues.description,
        } as QueueSingleSlotRequest);
      } else {
        // Multi-slot mode
        const totalRos = Object.values(multiSlotRosValues).reduce(
          (sum, val) => sum + val,
          0
        );
        const distributionSlots = Object.entries(multiSlotRosValues).map(
          ([slotNum, rosVal]) => ({
            slotNumber: parseInt(slotNum),
            rosPercentage: rosVal,
          })
        );

        queueMutation.mutate({
          multiSlotEnabled: true,
          distributionSlots,
          rosPercentage: totalRos,
          premiumPoolAmount: premium,
          performancePoolAmount: performance,
          description: formValues.description,
        } as QueueMultiSlotRequest);
      }
    } else if (statusData?.status === 'PENDING' && isEditing) {
      // Modify existing distribution
      if (mode === 'single') {
        const ros = Number(formValues.rosPercentage) || 0;
        modifyMutation.mutate({
          rosPercentage: ros,
          premiumPoolAmount: premium,
          performancePoolAmount: performance,
          description: formValues.description,
        });
      } else {
        // Multi-slot modification
        const distributionSlots = Object.entries(multiSlotRosValues).map(
          ([slotNum, rosVal]) => ({
            slotNumber: parseInt(slotNum),
            rosPercentage: rosVal,
          })
        );
        const totalRos = Object.values(multiSlotRosValues).reduce(
          (sum, val) => sum + val,
          0
        );

        modifyMutation.mutate({
          distributionSlots,
          rosPercentage: totalRos,
          premiumPoolAmount: premium,
          performancePoolAmount: performance,
          description: formValues.description,
        });
      }
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
      {/* Qualifier Counts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Qualifier Counts</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchQualifiers()}
              disabled={isLoadingQualifiers}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoadingQualifiers ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingQualifiers ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ShimmerCard className="h-32" />
              <ShimmerCard className="h-32" />
            </div>
          ) : qualifiersData ? (
            <QualifierCounts qualifiers={qualifiersData} />
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              Failed to load qualifier counts
            </p>
          )}
        </CardContent>
      </Card>

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
          {/* Mode Toggle */}
          <div className="space-y-3 border-b pb-4">
            <Label className="font-semibold">Distribution Mode</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log('Single-Slot button clicked');
                  setMode('single');
                }}
                disabled={status !== 'EMPTY' && !isEditing}
                className={`flex items-center space-x-2 rounded px-4 py-2 transition-all ${
                  mode === 'single'
                    ? 'border-2 border-blue-600 bg-blue-100 dark:bg-blue-900'
                    : 'border-2 border-gray-300 bg-gray-100 dark:bg-gray-700'
                } ${status !== 'EMPTY' && !isEditing ? 'cursor-not-allowed opacity-50' : 'hover:bg-opacity-80 cursor-pointer'}`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    mode === 'single' ? 'border-blue-600' : 'border-gray-400'
                  }`}
                >
                  {mode === 'single' && (
                    <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="font-medium">Single-Slot (Legacy)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Multi-Slot button clicked');
                  setMode('multi');
                  if (cronSettings) {
                    const initialValues: Record<number, number> = {};
                    cronSettings.slots.forEach((slot, index) => {
                      const slotNumber = index + 1;
                      initialValues[slotNumber] =
                        multiSlotRosValues[slotNumber] || 0;
                    });
                    setMultiSlotRosValues(initialValues);
                  }
                }}
                disabled={status !== 'EMPTY' && !isEditing}
                className={`flex items-center space-x-2 rounded px-4 py-2 transition-all ${
                  mode === 'multi'
                    ? 'border-2 border-blue-600 bg-blue-100 dark:bg-blue-900'
                    : 'border-2 border-gray-300 bg-gray-100 dark:bg-gray-700'
                } ${status !== 'EMPTY' && !isEditing ? 'cursor-not-allowed opacity-50' : 'hover:bg-opacity-80 cursor-pointer'}`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    mode === 'multi' ? 'border-blue-600' : 'border-gray-400'
                  }`}
                >
                  {mode === 'multi' && (
                    <div className="mx-auto mt-0.5 h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="font-medium">Multi-Slot</span>
              </button>
            </div>
            {mode === 'multi' && cronSettings && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Current schedule: {cronSettings.slots.length} slot
                  {cronSettings.slots.length > 1 ? 's' : ''} at{' '}
                  {cronSettings.slots.map((slot, idx) => (
                    <span key={idx}>
                      {slot.time}
                      {idx < cronSettings.slots.length - 1 ? ', ' : ''}
                    </span>
                  ))}{' '}
                  ({cronSettings.timezone})
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* ROS Section - Single or Multi */}
          {mode === 'single' ? (
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
          ) : (
            <div>
              {isLoadingCronSettings ? (
                <ShimmerCard className="h-40" />
              ) : cronSettingsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Multi-Slot Distribution Not Available</strong>
                    <br />
                    Failed to load cron settings from the backend. Please verify
                    the backend endpoint is working:
                    <ul className="mt-2 ml-4 list-disc text-xs">
                      <li>GET /api/v1/admin/cron-settings/timezones</li>
                      <li>
                        GET /api/v1/admin/cron-settings/distribution-schedule
                      </li>
                    </ul>
                    <br />
                    Use <strong>Single-Slot mode</strong> for now or contact the
                    backend team.
                  </AlertDescription>
                </Alert>
              ) : cronSettings ? (
                <MultiSlotRosInput
                  slots={cronSettings.slots}
                  rosValues={multiSlotRosValues}
                  onChange={(slotNumber, value) => {
                    setMultiSlotRosValues((prev) => ({
                      ...prev,
                      [slotNumber]: value,
                    }));
                  }}
                  disabled={isFormDisabled && !isEditing}
                />
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load cron settings. Please configure the
                    Distribution Schedule first:
                    <br />
                    <a
                      href="/admin/settings"
                      className="mt-1 inline-block text-blue-600 underline"
                    >
                      Settings → Distribution Schedule Tab
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

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
        className={`relative overflow-hidden border-2 transition-all duration-500 ${
          status === 'COMPLETED'
            ? 'border-green-500/30 bg-green-50/50 backdrop-blur-sm dark:bg-green-950/20'
            : status === 'FAILED'
              ? 'border-red-500/30 bg-red-50/50 backdrop-blur-sm dark:bg-red-950/20'
              : status === 'PENDING'
                ? 'border-blue-500/30 bg-blue-50/50 backdrop-blur-sm dark:bg-blue-950/20'
                : status === 'EXECUTING'
                  ? 'border-amber-500/30 bg-amber-50/50 backdrop-blur-sm dark:bg-amber-950/20'
                  : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        {/* Animated background glow for active states */}
        {(status === 'PENDING' || status === 'EXECUTING') && (
          <div className="animate-shimmer absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
        <CardContent className="flex items-center gap-3 pt-6">
          {STATUS_ICONS[status]}
          <div>
            <p className="font-semibold">
              {status === 'PENDING'
                ? statusData?.multiSlotEnabled
                  ? 'Distribution Scheduled (Multi-Slot)'
                  : cronSettings?.slots[0]?.time
                    ? `Distribution scheduled for ${new Date(`2000-01-01T${cronSettings.slots[0].time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })} ${cronSettings.timezoneOffset || ''}`
                    : STATUS_MESSAGES[status]
                : STATUS_MESSAGES[status]}
            </p>
            {status === 'PENDING' && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {countdown ? (
                  <>
                    {countdown.startsWith('⚠️') ||
                    countdown.startsWith('Executing')
                      ? countdown
                      : `Execution in ${countdown}`}
                    {statusData?.multiSlotEnabled
                      ? ''
                      : cronSettings?.slots[0]?.time &&
                        ` (at ${new Date(`2000-01-01T${cronSettings.slots[0].time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })})`}
                  </>
                ) : statusData?.multiSlotEnabled ? (
                  'Check slot status below'
                ) : cronSettings?.slots[0]?.time ? (
                  `Scheduled for ${new Date(`2000-01-01T${cronSettings.slots[0].time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}`
                ) : (
                  'Scheduled for later today'
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Multi-Slot Status Cards */}
      {statusData?.multiSlotEnabled && statusData?.distributionSlots && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Slot-by-Slot Status</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              Each slot executes independently at its scheduled time
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusData.distributionSlots.map((slot) => (
              <SlotStatusCard
                key={slot.slotNumber}
                slot={{
                  ...slot,
                  label: cronSettings?.slots[slot.slotNumber - 1]?.label,
                }}
              />
            ))}

            {/* Total summary */}
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                <div>
                  <p className="text-2xl font-bold">
                    {statusData.distributionSlots.length}
                  </p>
                  <p className="text-muted-foreground text-xs">Total Slots</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      statusData.distributionSlots.filter(
                        (s) => s.status === 'COMPLETED'
                      ).length
                    }
                  </p>
                  <p className="text-muted-foreground text-xs">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      statusData.distributionSlots.filter(
                        (s) => s.status === 'PENDING'
                      ).length
                    }
                  </p>
                  <p className="text-muted-foreground text-xs">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {
                      statusData.distributionSlots.filter(
                        (s) => s.status === 'EXECUTING'
                      ).length
                    }
                  </p>
                  <p className="text-muted-foreground text-xs">Executing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

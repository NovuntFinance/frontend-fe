'use client';

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Send,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTestDistributeDailyProfit } from '@/lib/mutations';
import { toast } from '@/components/ui/enhanced-toast';
import { utcDayString } from '@/lib/dateUtils';

interface DistributionStatusProps {
  /** When provided, shows a "Trigger Test ROS" button that opens the Test ROS modal */
  onTriggerTestROSClick?: () => void;
}

export function DistributionStatus({
  onTriggerTestROSClick,
}: DistributionStatusProps = {}) {
  const [selectedDate, setSelectedDate] = useState<string>(utcDayString());
  const [isDistributing, setIsDistributing] = useState(false);
  const testDistributeMutation = useTestDistributeDailyProfit();

  const handleDistribute = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setIsDistributing(true);
    try {
      // Don't manually prompt for 2FA - let the API interceptor handle it
      // It will prompt once if needed and retry automatically
      await testDistributeMutation.mutateAsync({
        date: selectedDate,
        // twoFACode will be added by the API interceptor if needed
      });
      // Success message is handled by the mutation's onSuccess
    } catch (error: any) {
      // Error message is handled by the mutation's onError
      // But handle user cancellation gracefully
      if (error?.message === '2FA_CODE_REQUIRED') {
        // User cancelled 2FA prompt - don't show error
        return;
      }
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <Card className="h-fit overflow-hidden shadow-lg">
      <CardHeader className="space-y-2 bg-gradient-to-br from-purple-50 to-white pb-4 sm:pb-6 dark:from-gray-800 dark:to-gray-900">
        <CardTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <ArrowRightLeft className="h-5 w-5 text-purple-600 sm:h-6 sm:w-6" />
          Test Distribution
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed sm:text-base">
          Manually trigger profit distribution for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:space-y-5 sm:p-6">
        <div className="space-y-3">
          <Label htmlFor="distribute-date" className="text-base font-semibold">
            Select Date
          </Label>
          <Input
            id="distribute-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isDistributing}
            max={utcDayString()}
            className="h-12 text-base font-medium sm:h-14 sm:text-lg"
          />
          <p className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-gray-700 sm:text-sm dark:bg-blue-900/20 dark:text-gray-300">
            💡 Select a date to manually trigger distribution. Useful for
            testing without waiting for the cron job.
          </p>
        </div>

        <Button
          onClick={handleDistribute}
          disabled={isDistributing || !selectedDate}
          className="h-12 w-full text-base font-bold shadow-lg transition-all hover:scale-[1.02] sm:h-14 sm:text-lg"
        >
          {isDistributing ? (
            <>
              <Clock className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-5 w-5" />
              Trigger Distribution
            </>
          )}
        </Button>

        {/* Trigger Test ROS - pays real USDT to earning wallets (test_ros_payout), separate from date-based distribution */}
        {onTriggerTestROSClick && (
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Or run Test ROS (no date)
            </p>
            <p className="mb-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              Pays real USDT to all users&apos; earning wallets. Safe to run
              multiple times. Does not affect daily ROS or stake progress.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-2 border-blue-200 font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
              onClick={onTriggerTestROSClick}
            >
              <Send className="mr-2 h-4 w-4" />
              Trigger Test ROS
            </Button>
          </div>
        )}

        {testDistributeMutation.isSuccess &&
          testDistributeMutation.data?.data && (
            <div className="mt-5 space-y-4 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-6 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500 p-2">
                  <CheckCircle2 className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                </div>
                <h4 className="text-lg font-bold text-green-900 sm:text-xl dark:text-green-100">
                  Distribution Complete!
                </h4>
              </div>

              {/* Pool Amounts - Clear cards */}
              <div className="space-y-3">
                <h5 className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Pool Amounts
                </h5>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Premium Pool
                    </p>
                    <p className="text-xl font-bold text-green-600 sm:text-2xl dark:text-green-400">
                      $
                      {testDistributeMutation.data.data.premiumPoolAmount?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-md dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Performance Pool
                    </p>
                    <p className="text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400">
                      $
                      {testDistributeMutation.data.data.performancePoolAmount?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-md sm:col-span-2 dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      ROS Percentage
                    </p>
                    <p className="text-xl font-bold text-purple-600 sm:text-2xl dark:text-purple-400">
                      {testDistributeMutation.data.data.rosPercentage?.toFixed(
                        2
                      ) || '0.00'}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Stakes Information - Clearer grid */}
              <div className="space-y-3">
                <h5 className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Stakes Processed
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white p-3 text-center shadow-md dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Total
                    </p>
                    <p className="text-lg font-bold text-gray-900 sm:text-xl dark:text-gray-100">
                      {testDistributeMutation.data.data.totalStakes}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center shadow-md dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Processed
                    </p>
                    <p className="text-lg font-bold text-blue-600 sm:text-xl dark:text-blue-400">
                      {testDistributeMutation.data.data.processedStakes}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center shadow-md dark:bg-gray-800">
                    <p className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-lg font-bold text-green-600 sm:text-xl dark:text-green-400">
                      {testDistributeMutation.data.data.completedStakes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distribution Breakdown */}
              <div className="space-y-3">
                <h5 className="text-sm font-bold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                  Distribution Breakdown
                </h5>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3 shadow-md dark:from-green-900/30 dark:to-emerald-900/30">
                    <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      Premium Pool
                    </p>
                    <p className="text-lg font-bold text-green-700 sm:text-xl dark:text-green-300">
                      $
                      {testDistributeMutation.data.data.premiumPoolDistributed?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 p-3 shadow-md dark:from-blue-900/30 dark:to-cyan-900/30">
                    <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      Performance Pool
                    </p>
                    <p className="text-lg font-bold text-blue-700 sm:text-xl dark:text-blue-300">
                      $
                      {testDistributeMutation.data.data.performancePoolDistributed?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-3 shadow-md dark:from-purple-900/30 dark:to-pink-900/30">
                    <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                      ROS
                    </p>
                    <p className="text-lg font-bold text-purple-700 sm:text-xl dark:text-purple-300">
                      $
                      {testDistributeMutation.data.data.rosDistributed?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Distributed - Prominent */}
              <div className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 p-4 text-center shadow-xl">
                <p className="mb-1 text-sm font-bold tracking-wide text-white/90 uppercase">
                  Total Distributed
                </p>
                <p className="flex items-center justify-center gap-2 text-3xl font-bold text-white sm:text-4xl">
                  <DollarSign className="h-7 w-7 sm:h-8 sm:w-8" />
                  {testDistributeMutation.data.data.totalDistributed?.toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  ) || '0.00'}
                </p>
                <p className="mt-1 text-sm font-medium text-white/90">USDT</p>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

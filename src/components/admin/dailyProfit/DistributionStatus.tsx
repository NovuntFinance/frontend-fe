'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Clock, DollarSign } from 'lucide-react';
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
import { use2FA } from '@/contexts/TwoFAContext';
import { toast } from '@/components/ui/enhanced-toast';
import { format, startOfToday } from 'date-fns';

export function DistributionStatus() {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(startOfToday(), 'yyyy-MM-dd')
  );
  const [isDistributing, setIsDistributing] = useState(false);
  const { promptFor2FA } = use2FA();
  const testDistributeMutation = useTestDistributeDailyProfit();

  const handleDistribute = async () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    setIsDistributing(true);
    try {
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        setIsDistributing(false);
        return;
      }

      const result = await testDistributeMutation.mutateAsync({
        date: selectedDate,
        twoFACode,
      });

      const data = result.data;
      toast.success(
        `Distribution completed: ${data.totalDistributed.toFixed(2)} USDT distributed to ${data.processedStakes} stakes`
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to distribute profits';
      toast.error(message);
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Test Distribution
        </CardTitle>
        <CardDescription>
          Manually trigger profit distribution for a specific date (for testing)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="distribute-date">Date to Distribute</Label>
          <Input
            id="distribute-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            disabled={isDistributing}
            max={format(startOfToday(), 'yyyy-MM-dd')}
          />
          <p className="text-xs text-gray-500">
            Select a date to manually trigger distribution. This is useful for
            testing without waiting for the cron job.
          </p>
        </div>

        <Button
          onClick={handleDistribute}
          disabled={isDistributing || !selectedDate}
          className="w-full"
        >
          {isDistributing ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Distributing...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Trigger Distribution
            </>
          )}
        </Button>

        {testDistributeMutation.isSuccess &&
          testDistributeMutation.data?.data && (
            <div className="mt-4 rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Distribution Results
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Pool Amounts */}
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-800/30">
                  <p className="text-gray-600 dark:text-gray-400">
                    Premium Pool Amount
                  </p>
                  <p className="font-bold text-green-700 dark:text-green-300">
                    $
                    {testDistributeMutation.data.data.premiumPoolAmount?.toLocaleString(
                      'en-US',
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    ) || '0.00'}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-800/30">
                  <p className="text-gray-600 dark:text-gray-400">
                    Performance Pool Amount
                  </p>
                  <p className="font-bold text-blue-700 dark:text-blue-300">
                    $
                    {testDistributeMutation.data.data.performancePoolAmount?.toLocaleString(
                      'en-US',
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    ) || '0.00'}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-800/30">
                  <p className="text-gray-600 dark:text-gray-400">
                    ROS Percentage
                  </p>
                  <p className="font-bold text-purple-700 dark:text-purple-300">
                    {testDistributeMutation.data.data.rosPercentage?.toFixed(
                      2
                    ) || '0.00'}
                    %
                  </p>
                </div>

                {/* Stakes Information */}
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Stakes
                  </p>
                  <p className="font-bold">
                    {testDistributeMutation.data.data.totalStakes}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Processed Stakes
                  </p>
                  <p className="font-bold">
                    {testDistributeMutation.data.data.processedStakes}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Completed Stakes
                  </p>
                  <p className="font-bold">
                    {testDistributeMutation.data.data.completedStakes}
                  </p>
                </div>
              </div>

              {/* Distribution Breakdown */}
              <div className="mt-4 border-t pt-4">
                <h5 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Distribution Breakdown
                </h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-800/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Premium Pool
                    </p>
                    <p className="font-bold text-green-700 dark:text-green-300">
                      $
                      {testDistributeMutation.data.data.premiumPoolDistributed?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-800/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Performance Pool
                    </p>
                    <p className="font-bold text-blue-700 dark:text-blue-300">
                      $
                      {testDistributeMutation.data.data.performancePoolDistributed?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-800/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      ROS
                    </p>
                    <p className="font-bold text-purple-700 dark:text-purple-300">
                      $
                      {testDistributeMutation.data.data.rosDistributed?.toLocaleString(
                        'en-US',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      ) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Distributed */}
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Distributed
                </p>
                <p className="flex items-center gap-1 text-lg font-bold">
                  <DollarSign className="h-4 w-4" />
                  {testDistributeMutation.data.data.totalDistributed?.toLocaleString(
                    'en-US',
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  ) || '0.00'}{' '}
                  USDT
                </p>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

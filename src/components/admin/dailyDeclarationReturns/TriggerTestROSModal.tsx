'use client';

import React, { useState } from 'react';
import { useTriggerTestROS } from '@/lib/mutations';
import { use2FA } from '@/contexts/TwoFAContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { TriggerTestROSResponse } from '@/types/dailyDeclarationReturns';

const DEFAULT_PERCENTAGE = 5;

interface TriggerTestROSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TriggerTestROSModal({
  open,
  onOpenChange,
}: TriggerTestROSModalProps) {
  const [percentage, setPercentage] = useState<string>(
    String(DEFAULT_PERCENTAGE)
  );
  const [runId, setRunId] = useState('');
  const [result, setResult] = useState<TriggerTestROSResponse['data'] | null>(
    null
  );
  const triggerMutation = useTriggerTestROS();
  const { promptFor2FA } = use2FA();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = Number(percentage);
    if (Number.isNaN(pct) || pct < 0 || pct > 100) {
      toast.error('Please enter a percentage between 0 and 100');
      return;
    }

    try {
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        return;
      }

      const response = await triggerMutation.mutateAsync({
        percentage: pct,
        ...(runId.trim() ? { runId: runId.trim() } : {}),
        twoFACode,
      });

      if (response.success) {
        setResult(response.data);
        toast.success('Test ROS triggered successfully');
      }
    } catch {
      // Error shown by mutation onError
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setResult(null);
      setPercentage(String(DEFAULT_PERCENTAGE));
      setRunId('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {result ? '🚀 Test ROS Success' : 'Trigger Test ROS'}
          </DialogTitle>
          <DialogDescription>
            {result
              ? 'The test distribution simulation finished successfully.'
              : "Run a test ROS distribution. This pays real USDT into users' earning wallets and updates stake progress like normal ROS."}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Run ID</p>
                  <p className="font-mono font-medium">{result.runId}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">ROS %</p>
                  <p className="font-medium">{result.percentage}%</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Processed</p>
                  <p className="font-medium">
                    {result.processedStakes.toLocaleString()} /{' '}
                    {result.totalStakes.toLocaleString()} stakes
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Users Paid</p>
                  <p className="font-medium">
                    {result.userCount.toLocaleString()} users
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Total Distributed
                  </p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    $
                    {result.totalDistributed.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-medium">
                    {(result.processingTimeMs / 1000).toFixed(2)}s
                  </p>
                </div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-lg bg-red-50 p-3 text-xs dark:bg-red-950/30">
                <p className="mb-1 font-semibold text-red-700 dark:text-red-400">
                  Warnings/Errors ({result.errors.length}):
                </p>
                <ul className="list-inside list-disc space-y-1 text-red-600 dark:text-red-300">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li className="list-none font-medium italic">
                      ...and {result.errors.length - 10} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-ros-percentage">
                ROS percentage (0–100){' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="test-ros-percentage"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-ros-runid">Run label (optional)</Label>
              <Input
                id="test-ros-runid"
                type="text"
                value={runId}
                onChange={(e) => setRunId(e.target.value)}
                placeholder="e.g. feb-9-test-1"
              />
            </div>
          </form>
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={triggerMutation.isPending}
              >
                {triggerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  'Trigger Test ROS'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

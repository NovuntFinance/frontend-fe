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

      await triggerMutation.mutateAsync({
        percentage: pct,
        ...(runId.trim() ? { runId: runId.trim() } : {}),
        twoFACode,
      });
      onOpenChange(false);
      setPercentage(String(DEFAULT_PERCENTAGE));
      setRunId('');
    } catch {
      // Error shown by mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trigger Test ROS</DialogTitle>
          <DialogDescription>
            Run a test ROS distribution. This pays real USDT into users&apos;
            earning wallets and creates transactions with type &quot;Test ROS
            Payout&quot;. Safe to run multiple times; it does not affect daily
            declaration, stake progress, or production ROS.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-ros-percentage">
              ROS percentage (0–100) <span className="text-destructive">*</span>
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
          <p className="text-muted-foreground text-xs">
            Pays real USDT to all users&apos; earning wallets. Safe to run
            multiple times. Does not affect daily ROS or stake progress.
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={triggerMutation.isPending}>
              {triggerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                'Trigger Test ROS'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PoolAmountInputProps {
  performanceAmount: number;
  premiumAmount: number;
  onPerformanceChange: (amount: number) => void;
  onPremiumChange: (amount: number) => void;
}

export function PoolAmountInput({
  performanceAmount,
  premiumAmount,
  onPerformanceChange,
  onPremiumChange,
}: PoolAmountInputProps) {
  const handlePerformanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onPerformanceChange(value >= 0 ? value : 0);
  };

  const handlePremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onPremiumChange(value >= 0 ? value : 0);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Performance Pool Amount */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label
                  htmlFor="performance-amount"
                  className="text-base font-semibold"
                >
                  Performance Pool Amount
                </Label>
                <p className="text-muted-foreground text-xs">
                  Total amount to distribute
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                id="performance-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={performanceAmount || ''}
                onChange={handlePerformanceChange}
                className="text-lg font-semibold"
              />
              {performanceAmount > 0 && (
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(performanceAmount)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Pool Amount */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <Label
                  htmlFor="premium-amount"
                  className="text-base font-semibold"
                >
                  Premium Pool Amount
                </Label>
                <p className="text-muted-foreground text-xs">
                  Total amount to distribute
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                id="premium-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={premiumAmount || ''}
                onChange={handlePremiumChange}
                className="text-lg font-semibold"
              />
              {premiumAmount > 0 && (
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(premiumAmount)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

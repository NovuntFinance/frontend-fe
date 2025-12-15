'use client';

import React, { useState, useEffect } from 'react';
import { poolService } from '@/services/poolService';
import { use2FA } from '@/contexts/TwoFAContext';
import { QualifierCounts } from './QualifierCounts';
import { QualifiersList } from './QualifiersList';
import { PoolAmountInput } from './PoolAmountInput';
import { PreviewDistribution } from './PreviewDistribution';
import { DeclarePoolModal } from './DeclarePoolModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShimmerCard } from '@/components/ui/shimmer';
import { toast } from 'sonner';
import { RefreshCw, TrendingUp, Award } from 'lucide-react';
import type {
  PoolQualifiersResponse,
  PreviewDistributionResponse,
} from '@/types/pool';

export function PoolDeclarationManager() {
  const [qualifiers, setQualifiers] = useState<
    PoolQualifiersResponse['data'] | null
  >(null);
  const [isLoadingQualifiers, setIsLoadingQualifiers] = useState(true);
  const [performanceAmount, setPerformanceAmount] = useState<number>(0);
  const [premiumAmount, setPremiumAmount] = useState<number>(0);
  const [preview, setPreview] = useState<
    PreviewDistributionResponse['data'] | null
  >(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const { promptFor2FA } = use2FA();

  // Set 2FA getter from context
  useEffect(() => {
    poolService.set2FACodeGetter(async () => {
      return await promptFor2FA();
    });
  }, [promptFor2FA]);

  // Load qualifier counts on mount
  useEffect(() => {
    loadQualifiers();
  }, []);

  const loadQualifiers = async () => {
    try {
      setIsLoadingQualifiers(true);
      const response = await poolService.getQualifiers();
      setQualifiers(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to load qualifier counts';
      toast.error(message);
    } finally {
      setIsLoadingQualifiers(false);
    }
  };

  const handlePreview = async () => {
    if (performanceAmount <= 0 && premiumAmount <= 0) {
      toast.error('Please enter at least one pool amount');
      return;
    }

    try {
      setIsPreviewing(true);
      const response = await poolService.previewDistribution({
        performancePoolAmount: performanceAmount,
        premiumPoolAmount: premiumAmount,
      });

      // Debug: Log the response to check for data issues
      console.log('[Pool Declaration] Preview Response:', response.data);

      // Check for data mismatches
      if (response.data.performancePool) {
        const perfByRankTotal = response.data.performancePool.byRank.reduce(
          (sum, rank) => sum + rank.eligibleUsers,
          0
        );
        const perfByRankAmount = response.data.performancePool.byRank.reduce(
          (sum, rank) => sum + rank.totalAmount,
          0
        );

        // Use totalToDistribute if available, otherwise use totalAmount
        const expectedAmount =
          response.data.performancePool.totalToDistribute ??
          response.data.performancePool.totalAmount;

        const missingQualifiers =
          response.data.performancePool.totalQualifiers - perfByRankTotal;
        const missingAmount = expectedAmount - perfByRankAmount;

        // Validate data consistency (backend should now pass these checks)
        if (
          perfByRankTotal !== response.data.performancePool.totalQualifiers ||
          Math.abs(perfByRankAmount - expectedAmount) > 0.01
        ) {
          console.warn(
            '[Pool Declaration] ⚠️ Performance Pool Data Mismatch:',
            {
              byRankTotal: perfByRankTotal,
              totalQualifiers: response.data.performancePool.totalQualifiers,
              missingQualifiers: missingQualifiers,
              byRankAmount: perfByRankAmount,
              totalAmount: response.data.performancePool.totalAmount,
              totalToDistribute:
                response.data.performancePool.totalToDistribute,
              expectedAmount: expectedAmount,
              missingAmount: missingAmount,
              byRankEntries: response.data.performancePool.byRank.length,
              byRank: response.data.performancePool.byRank,
              fullResponse: response.data.performancePool,
            }
          );

          console.error(
            '[Pool Declaration] 🔴 BACKEND ISSUE: Performance Pool byRank array is incomplete!',
            {
              expected: {
                totalQualifiers: response.data.performancePool.totalQualifiers,
                totalAmount: response.data.performancePool.totalAmount,
                totalToDistribute:
                  response.data.performancePool.totalToDistribute,
                expectedAmount: expectedAmount,
              },
              actual: {
                qualifiersInByRank: perfByRankTotal,
                amountInByRank: perfByRankAmount,
                ranksReturned: response.data.performancePool.byRank.map(
                  (r) => ({
                    rank: r.rank,
                    users: r.eligibleUsers,
                    amount: r.totalAmount,
                  })
                ),
              },
              missing: {
                qualifiers: missingQualifiers,
                amount: missingAmount,
              },
              action:
                'Backend must return ALL ranks with qualifiers in the byRank array',
            }
          );
        } else {
          // Data is consistent - log success for debugging
          console.log(
            '[Pool Declaration] ✅ Performance Pool data is consistent:',
            {
              totalQualifiers: response.data.performancePool.totalQualifiers,
              totalAmount: response.data.performancePool.totalAmount,
              totalToDistribute:
                response.data.performancePool.totalToDistribute,
              ranksInByRank: response.data.performancePool.byRank.length,
            }
          );
        }
      }

      if (response.data.premiumPool) {
        const premByRankTotal = response.data.premiumPool.byRank.reduce(
          (sum, rank) => sum + rank.eligibleUsers,
          0
        );
        const premByRankAmount = response.data.premiumPool.byRank.reduce(
          (sum, rank) => sum + rank.totalAmount,
          0
        );

        // Use totalToDistribute if available, otherwise use totalAmount
        const expectedAmount =
          response.data.premiumPool.totalToDistribute ??
          response.data.premiumPool.totalAmount;

        const missingQualifiers =
          response.data.premiumPool.totalQualifiers - premByRankTotal;
        const missingAmount = expectedAmount - premByRankAmount;

        // Special case: If totalAmount > 0 but no qualifiers, this is a backend bug (should be fixed now)
        if (
          response.data.premiumPool.totalAmount > 0 &&
          response.data.premiumPool.totalQualifiers === 0
        ) {
          console.error(
            '[Pool Declaration] 🔴 BACKEND BUG: Premium Pool has amount but zero qualifiers!',
            {
              totalAmount: response.data.premiumPool.totalAmount,
              totalQualifiers: response.data.premiumPool.totalQualifiers,
              byRank: response.data.premiumPool.byRank,
              issue:
                'Backend should not return totalAmount > 0 when totalQualifiers = 0',
              note: 'This should be fixed - if you see this, backend fix may not be deployed yet',
            }
          );
        }

        // Validate data consistency (backend should now pass these checks)
        if (
          premByRankTotal !== response.data.premiumPool.totalQualifiers ||
          Math.abs(premByRankAmount - expectedAmount) > 0.01
        ) {
          console.warn('[Pool Declaration] ⚠️ Premium Pool Data Mismatch:', {
            byRankTotal: premByRankTotal,
            totalQualifiers: response.data.premiumPool.totalQualifiers,
            missingQualifiers: missingQualifiers,
            byRankAmount: premByRankAmount,
            totalAmount: response.data.premiumPool.totalAmount,
            totalToDistribute: response.data.premiumPool.totalToDistribute,
            expectedAmount: expectedAmount,
            missingAmount: missingAmount,
            byRankEntries: response.data.premiumPool.byRank.length,
            byRank: response.data.premiumPool.byRank,
            fullResponse: response.data.premiumPool,
          });

          console.error(
            '[Pool Declaration] 🔴 BACKEND ISSUE: Premium Pool byRank array is incomplete!',
            {
              expected: {
                totalQualifiers: response.data.premiumPool.totalQualifiers,
                totalAmount: response.data.premiumPool.totalAmount,
                totalToDistribute: response.data.premiumPool.totalToDistribute,
                expectedAmount: expectedAmount,
              },
              actual: {
                qualifiersInByRank: premByRankTotal,
                amountInByRank: premByRankAmount,
                ranksReturned: response.data.premiumPool.byRank.map((r) => ({
                  rank: r.rank,
                  users: r.eligibleUsers,
                  amount: r.totalAmount,
                })),
              },
              missing: {
                qualifiers: missingQualifiers,
                amount: missingAmount,
              },
              action:
                'Backend must return ALL ranks with qualifiers in the byRank array',
            }
          );
        } else {
          // Data is consistent - log success for debugging
          console.log(
            '[Pool Declaration] ✅ Premium Pool data is consistent:',
            {
              totalQualifiers: response.data.premiumPool.totalQualifiers,
              totalAmount: response.data.premiumPool.totalAmount,
              totalToDistribute: response.data.premiumPool.totalToDistribute,
              ranksInByRank: response.data.premiumPool.byRank.length,
            }
          );
        }
      }

      setPreview(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to preview distribution';
      toast.error(message);
      setPreview(null);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleDeclare = () => {
    if (performanceAmount <= 0 && premiumAmount <= 0) {
      toast.error('Please enter at least one pool amount');
      return;
    }
    setDeclareModalOpen(true);
  };

  const handleDeclareSuccess = () => {
    // Reset form
    setPerformanceAmount(0);
    setPremiumAmount(0);
    setPreview(null);
    // Reload qualifiers (counts might have changed)
    loadQualifiers();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Main Content Area (3 columns) */}
      <div className="space-y-6 lg:col-span-3">
        {/* Qualifier Counts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Qualifier Counts</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={loadQualifiers}
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
            ) : qualifiers ? (
              <QualifierCounts qualifiers={qualifiers} />
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                Failed to load qualifier counts
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pool Amount Input */}
        <Card>
          <CardHeader>
            <CardTitle>Pool Amounts</CardTitle>
          </CardHeader>
          <CardContent>
            <PoolAmountInput
              performanceAmount={performanceAmount}
              premiumAmount={premiumAmount}
              onPerformanceChange={setPerformanceAmount}
              onPremiumChange={setPremiumAmount}
            />
          </CardContent>
        </Card>

        {/* Preview Button */}
        <div className="flex justify-center">
          <Button
            onClick={handlePreview}
            disabled={
              isPreviewing || (performanceAmount <= 0 && premiumAmount <= 0)
            }
            size="lg"
            className="min-w-[200px]"
          >
            {isPreviewing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Previewing...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Preview Distribution
              </>
            )}
          </Button>
        </div>
        {performanceAmount <= 0 && premiumAmount <= 0 && (
          <p className="text-muted-foreground text-center text-xs">
            Enter pool amounts above to preview distribution
          </p>
        )}

        {/* Preview Results */}
        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>Preview Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewDistribution preview={preview} />
            </CardContent>
          </Card>
        )}

        {/* Declare Actions */}
        {preview && (
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleDeclare}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              Declare Only
            </Button>
            <Button onClick={handleDeclare} size="lg" className="min-w-[200px]">
              <Award className="mr-2 h-4 w-4" />
              Declare & Distribute
            </Button>
          </div>
        )}

        {/* Declare Modal */}
        <DeclarePoolModal
          open={declareModalOpen}
          onOpenChange={setDeclareModalOpen}
          performanceAmount={performanceAmount}
          premiumAmount={premiumAmount}
          onSuccess={handleDeclareSuccess}
        />
      </div>

      {/* Sidebar - Qualifiers List (1 column) */}
      <div className="space-y-4 lg:col-span-1">
        <QualifiersList poolType="performance" />
        <QualifiersList poolType="premium" />
      </div>
    </div>
  );
}

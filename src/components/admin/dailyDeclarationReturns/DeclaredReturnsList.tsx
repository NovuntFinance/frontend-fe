'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useDeleteDeclaration,
  useDistributeDeclaration,
} from '@/lib/mutations';
import { useDeclaredReturns } from '@/lib/queries';
import { use2FA } from '@/contexts/TwoFAContext';
import {
  Edit,
  Trash,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatDateWithWeekday,
  utcDayString,
  isPastDate,
} from '@/lib/dateUtils';
import { ShimmerCard } from '@/components/ui/shimmer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface DeclaredReturnsListProps {
  onEdit?: (date: string) => void;
}

export function DeclaredReturnsList({ onEdit }: DeclaredReturnsListProps) {
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [distributePools, setDistributePools] = useState(false);
  const [distributeROS, setDistributeROS] = useState(false);
  const [processingDates, setProcessingDates] = useState<Set<string>>(
    new Set()
  );
  const deleteMutation = useDeleteDeclaration();
  const distributeMutation = useDistributeDeclaration();
  const { promptFor2FA } = use2FA();

  // Get declared returns for the next 30 days
  const todayUtc = utcDayString();
  const todayDate = new Date();
  const endDate = new Date(todayDate);
  endDate.setUTCDate(todayDate.getUTCDate() + 30);
  const endDateUtc = utcDayString(endDate);

  const { data, isLoading } = useDeclaredReturns({
    startDate: todayUtc,
    endDate: endDateUtc,
    includeDistributed: true,
  });

  const declarations = data?.declarations || [];
  const summary = data?.summary;

  const handleDelete = async (date: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the declaration for ${formatDateWithWeekday(date)}?`
      )
    ) {
      return;
    }

    try {
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        return;
      }

      await deleteMutation.mutateAsync({
        date,
        data: { twoFACode },
      });
    } catch (error: any) {
      // Error handled by mutation
      console.error('Failed to delete declaration:', error);
    }
  };

  const handleDistributeClick = (date: string) => {
    const declaration = declarations.find((d) => d.date === date);
    if (!declaration) return;

    setSelectedDate(date);
    setDistributePools(!declaration.poolsDistributed);
    setDistributeROS(!declaration.rosDistributed);
    setDistributeModalOpen(true);
  };

  const handleDistribute = async () => {
    if (!selectedDate) return;

    if (!distributePools && !distributeROS) {
      toast.error('Please select at least one distribution option');
      return;
    }

    // Add to processing set
    setProcessingDates((prev) => new Set(prev).add(selectedDate));

    try {
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        setProcessingDates((prev) => {
          const next = new Set(prev);
          next.delete(selectedDate);
          return next;
        });
        return;
      }

      const response = await distributeMutation.mutateAsync({
        date: selectedDate,
        data: {
          distributePools,
          distributeROS,
          twoFACode,
        },
      });

      // Check if async processing
      const isAsync =
        response?._isAsync || response?.data?.status === 'processing' || false;

      if (isAsync) {
        // Keep processing indicator and poll for completion
        pollDistributionStatus(selectedDate);
      } else {
        // Remove from processing set immediately
        setProcessingDates((prev) => {
          const next = new Set(prev);
          next.delete(selectedDate);
          return next;
        });
      }

      setDistributeModalOpen(false);
      setSelectedDate(null);
      setDistributePools(false);
      setDistributeROS(false);
    } catch (error: any) {
      // Error handled by mutation
      console.error('Failed to distribute:', error);
      // Remove from processing set on error
      setProcessingDates((prev) => {
        const next = new Set(prev);
        next.delete(selectedDate);
        return next;
      });
    }
  };

  // Poll for distribution completion
  const pollDistributionStatus = async (date: string) => {
    const maxAttempts = 20; // Poll for up to 60 seconds (20 * 3s)
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        // Stop polling after max attempts
        setProcessingDates((prev) => {
          const next = new Set(prev);
          next.delete(date);
          return next;
        });
        return;
      }

      attempts++;

      try {
        const { dailyDeclarationReturnsService } = await import(
          '@/services/dailyDeclarationReturnsService'
        );
        const declaration =
          await dailyDeclarationReturnsService.getDeclarationByDate(date);

        // Check if both are distributed
        if (
          declaration.data.poolsDistributed &&
          declaration.data.rosDistributed
        ) {
          // Complete - remove from processing set
          setProcessingDates((prev) => {
            const next = new Set(prev);
            next.delete(date);
            return next;
          });
          // Refresh the list - React Query will auto-refresh
          return;
        }

        // Continue polling
        setTimeout(poll, 3000);
      } catch (error) {
        console.error('Failed to poll distribution status:', error);
        // Stop polling on error
        setProcessingDates((prev) => {
          const next = new Set(prev);
          next.delete(date);
          return next;
        });
      }
    };

    // Start polling after initial delay
    setTimeout(poll, 3000);
  };

  const canDelete = (declaration: (typeof declarations)[0]) => {
    return (
      !declaration.poolsDistributed &&
      !declaration.rosDistributed &&
      !isPastDate(declaration.date, todayUtc)
    );
  };

  const canDistribute = (declaration: (typeof declarations)[0]) => {
    return !declaration.poolsDistributed || !declaration.rosDistributed;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Declared Returns</CardTitle>
          {summary && (
            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
              <div>
                <p className="text-muted-foreground text-xs">Total Dates</p>
                <p className="text-lg font-semibold">{summary.totalDates}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  Total Pool Amount
                </p>
                <p className="text-lg font-semibold">
                  ${summary.totalPoolAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">
                  Total ROS Declared
                </p>
                <p className="text-lg font-semibold">
                  {summary.totalROSDeclared}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Complete</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {summary.distributedDates}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pending</p>
                <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                  {summary.pendingDates}
                </p>
                {(summary.pendingROS !== undefined ||
                  summary.pendingPools !== undefined) && (
                  <div className="text-muted-foreground mt-1 text-[10px]">
                    <span>ROS: {summary.pendingROS ?? 0}</span>
                    <span className="mx-1">•</span>
                    <span>Pools: {summary.pendingPools ?? 0}</span>
                  </div>
                )}
              </div>
              {summary.partiallyDistributed !== undefined && (
                <div>
                  <p className="text-muted-foreground text-xs">
                    Partially Complete
                  </p>
                  <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                    {summary.partiallyDistributed}
                  </p>
                </div>
              )}
              {summary.pendingROS !== undefined &&
                summary.pendingPools !== undefined && (
                  <div className="col-span-2 lg:col-span-1">
                    <p className="text-muted-foreground text-xs">
                      Pending Breakdown
                    </p>
                    <div className="mt-1 space-y-0.5 text-xs">
                      <p>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          ROS: {summary.pendingROS}
                        </span>
                      </p>
                      <p>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          Pools: {summary.pendingPools}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <ShimmerCard key={i} className="h-16" />
              ))}
            </div>
          ) : declarations.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No declarations found for the next 30 days
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pools</TableHead>
                    <TableHead>ROS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((declaration) => {
                    const isProcessing = processingDates.has(declaration.date);
                    return (
                      <TableRow key={declaration.date}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {formatDateWithWeekday(declaration.date)}
                            {isProcessing && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          ${declaration.totalPoolAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>{declaration.rosPercentage}%</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {declaration.poolsDistributed ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-500 text-xs text-white"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Pools
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-yellow-600 dark:text-yellow-400"
                                >
                                  <Clock className="mr-1 h-3 w-3" />
                                  Pools
                                </Badge>
                              )}
                              {declaration.rosDistributed ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-500 text-xs text-white"
                                >
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  ROS
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-yellow-600 dark:text-yellow-400"
                                >
                                  <Clock className="mr-1 h-3 w-3" />
                                  ROS
                                </Badge>
                              )}
                              {/* Partially Complete Indicator */}
                              {(declaration.rosDistributed &&
                                !declaration.poolsDistributed) ||
                              (!declaration.rosDistributed &&
                                declaration.poolsDistributed) ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-orange-600 dark:text-orange-400"
                                >
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Partial
                                </Badge>
                              ) : null}
                            </div>
                            {/* Distribution Details */}
                            {declaration.poolsDistributionDetails && (
                              <div className="text-muted-foreground mt-1 space-y-0.5 text-[10px]">
                                <p>
                                  Performance:{' '}
                                  {
                                    declaration.poolsDistributionDetails
                                      .performancePool.distributed
                                  }{' '}
                                  users (
                                  {declaration.poolsDistributionDetails.performancePool.totalDistributed.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'USD',
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                  )
                                </p>
                                <p>
                                  Premium:{' '}
                                  {
                                    declaration.poolsDistributionDetails
                                      .premiumPool.distributed
                                  }{' '}
                                  users (
                                  {declaration.poolsDistributionDetails.premiumPool.totalDistributed.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'USD',
                                      minimumFractionDigits: 2,
                                    }
                                  )}
                                  )
                                </p>
                                {declaration.poolsDistributionDetails.note && (
                                  <p className="mt-1 text-yellow-600 italic dark:text-yellow-400">
                                    {declaration.poolsDistributionDetails.note}
                                  </p>
                                )}
                              </div>
                            )}
                            {(!declaration.poolsDistributed ||
                              !declaration.rosDistributed) && (
                              <div className="flex items-center gap-1 text-[10px] text-yellow-600 dark:text-yellow-400">
                                <AlertCircle className="h-2.5 w-2.5" />
                                <span>Users cannot see until 23:59:59 BIT</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(declaration.date)}
                                disabled={
                                  declaration.poolsDistributed &&
                                  declaration.rosDistributed
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDistribute(declaration) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDistributeClick(declaration.date)
                                }
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {canDelete(declaration) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(declaration.date)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribute Modal */}
      <Dialog open={distributeModalOpen} onOpenChange={setDistributeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribute Declaration</DialogTitle>
            <DialogDescription>
              Select which distributions to trigger for{' '}
              {selectedDate && formatDateWithWeekday(selectedDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="distributePools"
                  checked={distributePools}
                  onCheckedChange={(checked) =>
                    setDistributePools(checked === true)
                  }
                />
                <Label htmlFor="distributePools" className="cursor-pointer">
                  Distribute Pools
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="distributeROS"
                  checked={distributeROS}
                  onCheckedChange={(checked) =>
                    setDistributeROS(checked === true)
                  }
                />
                <Label htmlFor="distributeROS" className="cursor-pointer">
                  Distribute ROS
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDistributeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDistribute}
              disabled={distributeMutation.isPending}
            >
              {distributeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Distribute'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

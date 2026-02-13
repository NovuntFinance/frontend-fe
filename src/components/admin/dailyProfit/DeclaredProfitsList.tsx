'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Edit,
  Trash,
  CheckCircle2,
  Clock,
  Filter,
  Lock,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
import { pct4 } from '@/utils/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeclaredDailyProfits } from '@/lib/queries';
import {
  useDeleteDailyProfit,
  useTestDistributeDailyProfit,
} from '@/lib/mutations';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { DeclareProfitModal } from './DeclareProfitModal';
import { toast } from 'sonner';
import {
  utcDayString,
  isPastDate,
  formatDateShort,
  formatWeekday,
} from '@/lib/dateUtils';
import type { DailyProfit } from '@/types/dailyProfit';

export function DeclaredProfitsList() {
  const [isDistributedFilter, setIsDistributedFilter] = useState<
    boolean | undefined
  >(undefined);
  const [editingProfit, setEditingProfit] = useState<DailyProfit | null>(null);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const deleteMutation = useDeleteDailyProfit();
  const testDistributeMutation = useTestDistributeDailyProfit();

  const { data, isLoading } = useDeclaredDailyProfits({
    isDistributed: isDistributedFilter,
  });

  const declaredProfits = data?.dailyProfits || [];

  const handleEdit = (profit: DailyProfit) => {
    setEditingProfit(profit);
    setDeclareModalOpen(true);
  };

  const handleDelete = async (profit: DailyProfit) => {
    if (
      !confirm(`Are you sure you want to delete profit for ${profit.date}?`)
    ) {
      return;
    }

    // Don't manually prompt for 2FA - let the API interceptor handle it
    // It will prompt once if needed and retry automatically
    try {
      await deleteMutation.mutateAsync({
        date: profit.date,
        data: {
          // twoFACode will be added by the API interceptor if needed
        },
      });
      // Success message is handled by the mutation's onSuccess
    } catch (error: any) {
      // Error message is handled by the mutation's onError
      // But handle user cancellation gracefully
      if (error?.message === '2FA_CODE_REQUIRED') {
        // User cancelled 2FA prompt - don't show error
        return;
      }
    }
  };

  const handleRunDistribution = async (profit: DailyProfit) => {
    if (
      !confirm(
        `Run distribution for ${profit.date}? This will distribute profits to all eligible stakes.`
      )
    ) {
      return;
    }

    // Don't manually prompt for 2FA - let the API interceptor handle it
    // It will prompt once if needed and retry automatically
    try {
      await testDistributeMutation.mutateAsync({
        date: profit.date,
        // twoFACode will be added by the API interceptor if needed
      });
      // Success message is handled by the mutation's onSuccess
    } catch (error: any) {
      // Error message is handled by the mutation's onError
      // But we can add additional handling if needed
      if (error?.message === '2FA_CODE_REQUIRED') {
        // User cancelled 2FA prompt - don't show error
        return;
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Declared Profits
              </CardTitle>
              <CardDescription>
                View and manage all declared daily profits
              </CardDescription>
            </div>
            <Select
              value={
                isDistributedFilter === undefined
                  ? 'all'
                  : isDistributedFilter
                    ? 'distributed'
                    : 'pending'
              }
              onValueChange={(value) => {
                if (value === 'all') setIsDistributedFilter(undefined);
                else if (value === 'distributed') setIsDistributedFilter(true);
                else setIsDistributedFilter(false);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profits</SelectItem>
                <SelectItem value="distributed">
                  Distributed (locked)
                </SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingStates.List lines={5} />
          ) : declaredProfits.length === 0 ? (
            <EmptyStates.EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="No profits declared yet"
              description="Declared profits will appear here once they are added"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Premium Pool</TableHead>
                  <TableHead>Performance Pool</TableHead>
                  <TableHead>ROS %</TableHead>
                  <TableHead>Total Pool</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Declared By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declaredProfits.map((profit) => {
                  const todayUtc = utcDayString();
                  const isPast = isPastDate(profit.date, todayUtc);
                  const canEdit = !profit.isDistributed && !isPast;
                  const isMissedPending = !profit.isDistributed && isPast;

                  return (
                    <TableRow key={profit.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDateShort(profit.date)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatWeekday(profit.date)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        $
                        {profit.premiumPoolAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        $
                        {profit.performancePoolAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="font-semibold text-purple-600">
                        {pct4(profit.rosPercentage)}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                        $
                        {(
                          profit.premiumPoolAmount +
                          profit.performancePoolAmount
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {profit.description || '-'}
                      </TableCell>
                      <TableCell>
                        {profit.isDistributed ? (
                          <Badge className="bg-green-500 text-white">
                            <Lock className="mr-1 h-3 w-3" />
                            Distributed (locked)
                          </Badge>
                        ) : isMissedPending ? (
                          <Badge
                            variant="secondary"
                            className="bg-orange-500 text-white"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Pending (missed)
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-500 text-white"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Pending (scheduled)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{profit.declaredBy.email}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(profit.declaredAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {canEdit && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(profit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(profit)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          {isMissedPending && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRunDistribution(profit)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <ArrowRight className="h-4 w-4" />
                              <span className="ml-1 text-xs">
                                Run distribution
                              </span>
                            </Button>
                          )}
                          {!canEdit && !isMissedPending && (
                            <span className="text-xs text-gray-400">
                              {profit.isDistributed
                                ? 'Distributed (locked)'
                                : 'Past date'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeclareProfitModal
        open={declareModalOpen}
        onOpenChange={(open) => {
          setDeclareModalOpen(open);
          if (!open) setEditingProfit(null);
        }}
        editingProfit={editingProfit || undefined}
      />
    </>
  );
}

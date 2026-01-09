'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Edit,
  Trash,
  CheckCircle2,
  Clock,
  Filter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDeclaredDailyProfits } from '@/lib/queries';
import { useDeleteDailyProfit } from '@/lib/mutations';
import { use2FA } from '@/contexts/TwoFAContext';
import { LoadingStates } from '@/components/ui/loading-states';
import { EmptyStates } from '@/components/EmptyStates';
import { DeclareProfitModal } from './DeclareProfitModal';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import type { DailyProfit } from '@/types/dailyProfit';

export function DeclaredProfitsList() {
  const [isDistributedFilter, setIsDistributedFilter] = useState<
    boolean | undefined
  >(undefined);
  const [editingProfit, setEditingProfit] = useState<DailyProfit | null>(null);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const { promptFor2FA } = use2FA();
  const deleteMutation = useDeleteDailyProfit();

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

    try {
      const twoFACode = await promptFor2FA();
      if (!twoFACode) {
        toast.error('2FA code is required');
        return;
      }

      await deleteMutation.mutateAsync({
        date: profit.date,
        data: { twoFACode },
      });
      toast.success('Profit deleted successfully');
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete profit';
      toast.error(message);
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
                <SelectItem value="distributed">Distributed</SelectItem>
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
                  const dateObj = parseISO(profit.date);
                  const isPast = dateObj < new Date();
                  const canEdit = !profit.isDistributed && !isPast;

                  return (
                    <TableRow key={profit.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {format(dateObj, 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(dateObj, 'EEEE')}
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
                        {profit.rosPercentage.toFixed(2)}%
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
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Distributed
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-500 text-white"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{profit.declaredBy.email}</div>
                          <div className="text-xs text-gray-500">
                            {format(parseISO(profit.declaredAt), 'MMM d, yyyy')}
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
                          {!canEdit && (
                            <span className="text-xs text-gray-400">
                              {profit.isDistributed
                                ? 'Already distributed'
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

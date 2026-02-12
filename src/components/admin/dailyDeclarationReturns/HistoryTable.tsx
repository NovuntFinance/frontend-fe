'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dailyDeclarationReturnsService } from '@/services/dailyDeclarationReturnsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Eye,
} from 'lucide-react';
import type {
  HistoryFilters,
  HistoryEntry,
} from '@/types/dailyDeclarationReturns';
import { DistributionDetailsModal } from './DistributionDetailsModal';

const PAGE_LIMIT = 50;

export function HistoryTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<HistoryFilters>({
    status: 'ALL',
    page: 1,
    limit: PAGE_LIMIT,
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch history
  const {
    data: historyData,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['distribution-history', filters],
    queryFn: async () => {
      return await dailyDeclarationReturnsService.getHistory({
        ...filters,
        page: currentPage,
      });
    },
    staleTime: 30000,
    retry: 2,
  });

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<HistoryFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setCurrentPage(1);
    },
    []
  );

  // Apply date range filter
  const handleApplyDateRange = useCallback(() => {
    handleFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  }, [startDate, endDate, handleFilterChange]);

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      const downloadUrl =
        await dailyDeclarationReturnsService.exportHistory(format);

      // Open download link
      window.open(downloadUrl, '_blank');
      toast.success(`Export started: ${format.toUpperCase()}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.message ||
        `Failed to export ${format.toUpperCase()}`;
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const records = historyData?.data?.records || [];
  const totalRecords = historyData?.data?.totalRecords || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_LIMIT));

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📊 Distribution History</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting || totalRecords === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isExporting || totalRecords === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Start Date */}
            <div>
              <Label htmlFor="start-date" className="text-xs">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            {/* End Date */}
            <div>
              <Label htmlFor="end-date" className="text-xs">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="text-xs">
                Status
              </Label>
              <Select
                value={filters.status || 'ALL'}
                onValueChange={(value) =>
                  handleFilterChange({
                    status: value as 'COMPLETED' | 'FAILED' | 'ALL',
                  })
                }
              >
                <SelectTrigger id="status" className="mt-1 text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                  <SelectItem value="FAILED">❌ Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <Button
                onClick={handleApplyDateRange}
                disabled={isLoading}
                className="w-full"
                size="sm"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Failed to Load History
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {error instanceof Error
                    ? error.message
                    : 'Unable to fetch distribution history. The endpoint may not be implemented yet.'}
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          ) : isLoading && records.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-600">
              <p>No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      ROS %
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Pools $
                    </th>
                    <th className="px-4 py-2 text-right font-semibold">
                      Users
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Executed At
                    </th>
                    <th className="px-4 py-2 text-center font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: HistoryEntry) => {
                    // Defensive checks for record data
                    const rosPercent = record?.rosPercentage ?? 0;
                    const poolsAmount = record?.poolsAmount ?? 0;
                    const usersCount = record?.usersCount ?? 0;

                    return (
                      <tr
                        key={record?.date || `record-${Math.random()}`}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {record?.date || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {record?.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
                              ✅ Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900 dark:text-red-100">
                              ❌ Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {rosPercent.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          $
                          {poolsAmount.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right">{usersCount}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                          {record?.executedAt || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              record?.date && setSelectedDate(record.date)
                            }
                            disabled={!record?.date}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages} ({totalRecords} total records)
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page =
                  currentPage <= 3 ? i + 1 : Math.max(1, currentPage - 2 + i);
                return page <= totalPages ? (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ) : null;
              })}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      {selectedDate && (
        <DistributionDetailsModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

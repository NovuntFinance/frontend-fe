'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  X,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tradingSignalsAPI, TradingSignal } from '@/services/tradingSignalsAPI';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

type MarketType = 'forex' | 'crypto' | 'metals' | 'commodities' | 'all';

interface FilterState {
  profitableOnly: boolean;
  dayTradesOnly: boolean;
  marketType: MarketType;
  symbol: string;
  search: string;
}

const getMarketTypeBadge = (type: MarketType) => {
  const badges = {
    forex: {
      label: 'Forex',
      className:
        'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    crypto: {
      label: 'Crypto',
      className:
        'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    },
    metals: {
      label: 'Metals',
      className:
        'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    },
    commodities: {
      label: 'Commodities',
      className:
        'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
    },
    all: {
      label: 'All',
      className:
        'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30',
    },
  };
  return badges[type];
};

const isDayTrade = (entryTime: string, exitTime: string): boolean => {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  return entry.toDateString() === exit.toDateString();
};

const getTimeAgo = (date: Date): string => {
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
};

export default function TradingSignalsHistoryPage() {
  const [filters, setFilters] = useState<FilterState>({
    profitableOnly: false,
    dayTradesOnly: false,
    marketType: 'all',
    symbol: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'24h' | '7d'>('24h');
  const itemsPerPage = 20;

  // Fetch trading signals history from backend
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trading-signals-history', filters, page],
    queryFn: async () => {
      const response = await tradingSignalsAPI.getSignalsHistory({
        days: 100,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        profitableOnly: filters.profitableOnly || undefined,
        dayTradesOnly: filters.dayTradesOnly || undefined,
        marketType:
          filters.marketType !== 'all' ? filters.marketType : undefined,
        symbol: filters.symbol || undefined,
        search: filters.search || undefined,
      });

      // Debug logging
      console.log('🔍 [Trading Signals] API Response:', response);
      console.log('🔍 [Trading Signals] Response.data:', response?.data);
      console.log(
        '🔍 [Trading Signals] Response.data length:',
        response?.data?.length
      );
      console.log('🔍 [Trading Signals] Response.count:', response?.count);
      console.log('🔍 [Trading Signals] Response.success:', response?.success);

      return response;
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  // Backend returns paginated and filtered data
  // The response structure is: { success: true, data: TradingSignal[], count: number, page: number, totalPages: number, hasMore: boolean }
  const signals = data?.data || [];
  const totalCount = data?.count || 0;
  // Use backend's totalPages if available, otherwise calculate
  const totalPages = data?.totalPages || Math.ceil(totalCount / itemsPerPage);

  // Debug logging for component state
  console.log('🔍 [Trading Signals] Component State:', {
    hasData: !!data,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : [],
    signalsLength: signals.length,
    totalCount,
    isLoading,
    error: error?.message,
    rawData: data,
  });

  // Backend handles all filtering, so we just use the signals directly
  const filteredSignals = signals;

  // Calculate statistics - separate 24h and 7d stats
  const stats24h = useMemo(() => {
    // If backend provides aggregate statistics, use those (covers ALL matching signals)
    if (data?.stats) {
      // Prefer new nested structure (avg24h), fallback to flat structure for backward compatibility
      const statsData = data.stats.avg24h || {
        totalSignals: data.stats.totalSignals,
        profitableSignals: data.stats.profitableSignals,
        dayTrades: data.stats.dayTrades,
        totalProfit: data.stats.totalProfit,
        winRate: data.stats.winRate,
        label: 'Last 24 Hours',
        description: 'Totals for the last 24 hours',
      };

      return {
        total: statsData.totalSignals ?? 0,
        profitable: statsData.profitableSignals ?? 0,
        dayTrades: statsData.dayTrades ?? 0,
        totalProfit: statsData.totalProfit ?? 0, // NET profit (includes losses)
        winRate: statsData.winRate ?? 0,
        label: statsData.label || 'Last 24 Hours',
        description: statsData.description || 'Totals for the last 24 hours',
      };
    }

    // Fallback: Calculate from current page data (for backward compatibility)
    // This is less accurate but works if backend doesn't provide stats yet
    const profitable = filteredSignals.filter((s) => s.isProfitable).length;
    const dayTrades = filteredSignals.filter((s) =>
      isDayTrade(s.entryTime, s.exitTime)
    ).length;
    const totalProfit = filteredSignals.reduce(
      (sum, s) => sum + (s.isProfitable ? s.profitUSD : 0),
      0
    );
    const winRate =
      filteredSignals.length > 0
        ? (profitable / filteredSignals.length) * 100
        : 0;

    return {
      total: totalCount, // Use total count from backend
      profitable, // Only current page - backend should provide total via stats
      dayTrades, // Only current page - backend should provide total via stats
      totalProfit, // Only current page - backend should provide total via stats
      winRate,
      label: 'Current Page',
      description: 'Statistics from current page only',
    };
  }, [data?.stats, filteredSignals, totalCount]);

  // Calculate 7-day statistics separately
  const stats7d = useMemo(() => {
    if (data?.stats?.avg7d) {
      const statsData = data.stats.avg7d;
      // Ensure we have valid data (not just empty object)
      if (
        statsData.totalSignals !== undefined ||
        statsData.profitableSignals !== undefined
      ) {
        return {
          total: statsData.totalSignals ?? 0,
          profitable: statsData.profitableSignals ?? 0,
          dayTrades: statsData.dayTrades ?? 0,
          totalProfit: statsData.totalProfit ?? 0, // NET profit (includes losses)
          winRate: statsData.winRate ?? 0,
          label: statsData.label || 'Last 7 Days',
          description:
            statsData.description || 'Cumulative totals for the last 7 days',
        };
      }
    }
    return null;
  }, [data?.stats?.avg7d]);

  // Get current stats based on active tab
  const currentStats = activeTab === '24h' ? stats24h : stats7d || stats24h;

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      profitableOnly: false,
      dayTradesOnly: false,
      marketType: 'all',
      symbol: '',
      search: '',
    });
    setPage(1);
  };

  return (
    <div className="from-background via-background to-primary/5 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Trading Signals History
          </h1>
          <p className="text-muted-foreground">
            100 days of verified trading signals with real market data
          </p>
        </motion.div>

        {/* Statistics Cards with Tabs */}
        <div className="mb-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as '24h' | '7d')}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="24h">
                {stats24h.label || 'Last 24 Hours'}
              </TabsTrigger>
              {stats7d && (
                <TabsTrigger value="7d">
                  {stats7d.label || 'Last 7 Days'}
                </TabsTrigger>
              )}
            </TabsList>

            {/* 24-Hour Stats Tab */}
            <TabsContent value="24h" className="space-y-4">
              {currentStats?.description && (
                <p className="text-muted-foreground text-sm">
                  {currentStats.description}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Total Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentStats?.total.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Profitable
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {currentStats?.profitable.toLocaleString() || 0}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {currentStats?.winRate.toFixed(1) || '0.0'}% win rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Day Trades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {currentStats?.dayTrades.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-muted-foreground text-sm font-medium">
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        (currentStats?.totalProfit ?? 0) >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {(currentStats?.totalProfit ?? 0) >= 0 ? '+' : ''}$
                      {(currentStats?.totalProfit ?? 0).toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Includes losses
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 7-Day Stats Tab */}
            <TabsContent value="7d" className="space-y-4">
              {stats7d?.description && (
                <p className="text-muted-foreground text-sm">
                  {stats7d.description}
                </p>
              )}
              {stats7d ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-muted-foreground text-sm font-medium">
                        Total Signals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats7d.total.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-muted-foreground text-sm font-medium">
                        Profitable
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats7d.profitable.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {stats7d.winRate.toFixed(1)}% win rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-muted-foreground text-sm font-medium">
                        Day Trades
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats7d.dayTrades.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-muted-foreground text-sm font-medium">
                        Net Profit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${
                          stats7d.totalProfit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {stats7d.totalProfit >= 0 ? '+' : ''}$
                        {stats7d.totalProfit.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Includes losses
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      7-day statistics are not available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search symbols, pairs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Market Type */}
              <Select
                value={filters.marketType}
                onValueChange={(value) =>
                  handleFilterChange('marketType', value as MarketType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Market Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Markets</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="metals">Metals</SelectItem>
                  <SelectItem value="commodities">Commodities</SelectItem>
                </SelectContent>
              </Select>

              {/* Symbol Filter */}
              <Input
                placeholder="Filter by symbol (e.g., EUR/USD)"
                value={filters.symbol}
                onChange={(e) => handleFilterChange('symbol', e.target.value)}
              />

              {/* Toggle Filters */}
              <div className="flex gap-2">
                <Button
                  variant={filters.profitableOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    handleFilterChange(
                      'profitableOnly',
                      !filters.profitableOnly
                    )
                  }
                  className="flex-1"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Profits Only
                </Button>
                <Button
                  variant={filters.dayTradesOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    handleFilterChange('dayTradesOnly', !filters.dayTradesOnly)
                  }
                  className="flex-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Day Trades
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Signals List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trading Signals</CardTitle>
                <CardDescription>
                  Showing {filteredSignals.length} of {totalCount} signals
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="text-muted-foreground mx-auto mb-2 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Loading trading signals...
                </p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-destructive mb-2">
                  Failed to load trading signals
                </p>
                <p className="text-muted-foreground mb-4 text-sm">
                  {error instanceof Error
                    ? error.message
                    : 'Unable to connect to the trading signals service'}
                </p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            ) : filteredSignals.length === 0 ? (
              <div className="py-12 text-center">
                <TrendingUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground mb-2">
                  No trading signals found
                </p>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredSignals.map((signal) => (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                        signal.isProfitable
                          ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                          : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
                      } `}
                    >
                      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12">
                        {/* Symbol & Type */}
                        <div className="flex items-center gap-3 lg:col-span-3">
                          <div
                            className={`flex-shrink-0 rounded-lg p-2 ${
                              signal.direction === 'LONG'
                                ? 'bg-emerald-500/20'
                                : 'bg-blue-500/20'
                            }`}
                          >
                            {signal.direction === 'LONG' ? (
                              <TrendingUp
                                className={`h-5 w-5 ${
                                  signal.isProfitable
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              />
                            ) : (
                              <TrendingDown
                                className={`h-5 w-5 ${
                                  signal.isProfitable
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-bold">
                                {signal.symbol}
                              </p>
                              <Badge
                                variant="outline"
                                className={
                                  getMarketTypeBadge(signal.marketType)
                                    .className
                                }
                              >
                                {getMarketTypeBadge(signal.marketType).label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs font-semibold uppercase">
                              {signal.direction}
                            </p>
                          </div>
                        </div>

                        {/* Entry */}
                        <div className="lg:col-span-2">
                          <p className="text-muted-foreground mb-1 text-xs">
                            Entry
                          </p>
                          <p className="font-bold">
                            {signal.entryPrice.toFixed(
                              signal.symbol.includes('JPY') ? 3 : 5
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(signal.entryTime).toLocaleString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              }
                            )}
                          </p>
                        </div>

                        {/* Exit */}
                        <div className="lg:col-span-2">
                          <p className="text-muted-foreground mb-1 text-xs">
                            Exit
                          </p>
                          <p className="font-bold">
                            {signal.exitPrice.toFixed(
                              signal.symbol.includes('JPY') ? 3 : 5
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(signal.exitTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>

                        {/* Pips/Points */}
                        <div className="lg:col-span-2">
                          <p className="text-muted-foreground mb-1 text-xs">
                            Pips/Points
                          </p>
                          <p
                            className={`font-bold ${
                              signal.isProfitable
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {signal.isProfitable ? '+' : ''}
                            {signal.pipsPoints.toFixed(1)}{' '}
                            {signal.marketType === 'forex' ? 'pips' : 'pts'}
                          </p>
                        </div>

                        {/* Profit */}
                        <div className="lg:col-span-2">
                          <p className="text-muted-foreground mb-1 text-xs">
                            Profit
                          </p>
                          <p
                            className={`text-lg font-black ${
                              signal.isProfitable
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {signal.isProfitable ? '+' : ''}
                            {signal.profitUSD >= 0 ? '$' : '-$'}
                            {Math.abs(signal.profitUSD).toLocaleString()}
                          </p>
                        </div>

                        {/* Status & Time */}
                        <div className="flex items-center justify-between gap-2 lg:col-span-1 lg:justify-end">
                          <div className="flex flex-col items-end">
                            {signal.isProfitable ? (
                              <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              <span>
                                {getTimeAgo(new Date(signal.exitTime))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-6">
                    <p className="text-muted-foreground text-sm">
                      Page {data?.page || page} of {totalPages}
                      {data?.count !== undefined && (
                        <span className="ml-2">
                          ({data.count.toLocaleString()} total signals)
                        </span>
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages || data?.hasMore === false}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent" />

          <CardHeader className="relative p-3 sm:p-6">
            <CardTitle className="text-foreground mb-1.5 text-xl font-bold sm:mb-2 sm:text-2xl md:text-3xl">
              Trading Signals History
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              100 days of verified trading signals with real market data
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Statistics Cards with Tabs */}
      <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
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
            <TabsContent value="24h" className="space-y-3 sm:space-y-4">
              {currentStats?.description && (
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {currentStats.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                  <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Total Signals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <div className="text-lg font-bold sm:text-2xl">
                      {currentStats?.total.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                  <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Profitable
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <div className="text-lg font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
                      {currentStats?.profitable.toLocaleString() || 0}
                    </div>
                    <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                      {currentStats?.winRate.toFixed(1) || '0.0'}% win rate
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                  <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Day Trades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <div className="text-lg font-bold sm:text-2xl">
                      {currentStats?.dayTrades.toLocaleString() || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                  <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                    <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <div
                      className={`text-lg font-bold sm:text-2xl ${
                        (currentStats?.totalProfit ?? 0) >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {(currentStats?.totalProfit ?? 0) >= 0 ? '+' : ''}$
                      {(currentStats?.totalProfit ?? 0).toLocaleString()}
                    </div>
                    <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                      Includes losses
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 7-Day Stats Tab */}
            <TabsContent value="7d" className="space-y-3 sm:space-y-4">
              {stats7d?.description && (
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {stats7d.description}
                </p>
              )}
              {stats7d ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                  <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                    <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                      <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Total Signals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-lg font-bold sm:text-2xl">
                        {stats7d.total.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                    <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                      <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Profitable
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-lg font-bold text-emerald-600 sm:text-2xl dark:text-emerald-400">
                        {stats7d.profitable.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                        {stats7d.winRate.toFixed(1)}% win rate
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                    <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                      <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Day Trades
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div className="text-lg font-bold sm:text-2xl">
                        {stats7d.dayTrades.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                    <CardHeader className="p-3 pb-2 sm:p-6 sm:pb-3">
                      <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">
                        Net Profit
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                      <div
                        className={`text-lg font-bold sm:text-2xl ${
                          stats7d.totalProfit >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {stats7d.totalProfit >= 0 ? '+' : ''}$
                        {stats7d.totalProfit.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground mt-1 text-[10px] sm:text-xs">
                        Includes losses
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-card/50 border-0 shadow-md backdrop-blur-sm">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      7-day statistics are not available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm sm:gap-2 sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs sm:h-9 sm:text-sm"
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6">
          <div className="grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  handleFilterChange('profitableOnly', !filters.profitableOnly)
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
      <Card className="bg-card/50 border-0 shadow-lg backdrop-blur-sm">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Trading Signals
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Showing {filteredSignals.length} of {totalCount} signals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="text-muted-foreground border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground">
                Loading trading signals...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive mb-2">
                Failed to load trading signals
              </p>
              <p className="text-muted-foreground text-sm">
                {error instanceof Error
                  ? error.message
                  : 'Unable to connect to the trading signals service'}
              </p>
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
              <div className="space-y-2 sm:space-y-3">
                {filteredSignals.map((signal) => (
                  <motion.div
                    key={signal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg border-0 p-2.5 backdrop-blur-sm transition-all hover:shadow-lg sm:rounded-xl sm:p-4 ${
                      signal.isProfitable
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/15 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10'
                        : 'bg-red-500/10 hover:bg-red-500/15 dark:bg-red-500/5 dark:hover:bg-red-500/10'
                    } `}
                  >
                    {/* Mobile Layout - Stacked */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      {/* Top Row: Symbol, Direction, Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex-shrink-0 rounded-md p-1.5 ${
                              signal.direction === 'LONG'
                                ? 'bg-emerald-500/20'
                                : 'bg-blue-500/20'
                            }`}
                          >
                            {signal.direction === 'LONG' ? (
                              <TrendingUp
                                className={`h-3.5 w-3.5 ${
                                  signal.isProfitable
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              />
                            ) : (
                              <TrendingDown
                                className={`h-3.5 w-3.5 ${
                                  signal.isProfitable
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold">
                                {signal.symbol}
                              </p>
                              <Badge
                                variant="outline"
                                className={`px-1.5 py-0 text-[10px] ${
                                  getMarketTypeBadge(signal.marketType)
                                    .className
                                }`}
                              >
                                {getMarketTypeBadge(signal.marketType).label}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-[10px] font-semibold uppercase">
                              {signal.direction}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {signal.isProfitable ? (
                            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                          <p
                            className={`text-base font-black ${
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
                      </div>

                      {/* Middle Row: Entry & Exit */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-muted-foreground mb-0.5 text-[10px]">
                            Entry
                          </p>
                          <p className="text-xs font-bold">
                            {signal.entryPrice.toFixed(
                              signal.symbol.includes('JPY') ? 3 : 5
                            )}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
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
                        <div>
                          <p className="text-muted-foreground mb-0.5 text-[10px]">
                            Exit
                          </p>
                          <p className="text-xs font-bold">
                            {signal.exitPrice.toFixed(
                              signal.symbol.includes('JPY') ? 3 : 5
                            )}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            {new Date(signal.exitTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Row: Pips & Time */}
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-bold ${
                            signal.isProfitable
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {signal.isProfitable ? '+' : ''}
                          {signal.pipsPoints.toFixed(1)}{' '}
                          {signal.marketType === 'forex' ? 'pips' : 'pts'}
                        </p>
                        <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{getTimeAgo(new Date(signal.exitTime))}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout - Grid */}
                    <div className="hidden grid-cols-1 items-center gap-4 sm:grid lg:grid-cols-12">
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
                            <p className="text-base font-bold sm:text-lg">
                              {signal.symbol}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                getMarketTypeBadge(signal.marketType).className
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
                        <p className="text-sm font-bold sm:text-base">
                          {signal.entryPrice.toFixed(
                            signal.symbol.includes('JPY') ? 3 : 5
                          )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(signal.entryTime).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>

                      {/* Exit */}
                      <div className="lg:col-span-2">
                        <p className="text-muted-foreground mb-1 text-xs">
                          Exit
                        </p>
                        <p className="text-sm font-bold sm:text-base">
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
                          className={`text-sm font-bold sm:text-base ${
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
                          className={`text-base font-black sm:text-lg ${
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
                            <span>{getTimeAgo(new Date(signal.exitTime))}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination - Wallet Style */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Showing {(page - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(page * itemsPerPage, totalCount)} of {totalCount}{' '}
                    signals
                  </p>
                  <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 text-xs sm:h-9 sm:text-sm"
                    >
                      <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                    <span className="bg-muted flex items-center rounded-md px-2 text-xs sm:px-4 sm:text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages || data?.hasMore === false}
                      className="h-8 text-xs sm:h-9 sm:text-sm"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

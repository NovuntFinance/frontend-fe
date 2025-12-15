'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  X,
  TrendingUp as ActivityIcon,
  Star as ZapIcon,
  RefreshCw,
  ArrowRight,
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
import { tradingSignalsAPI, TradingSignal } from '@/services/tradingSignalsAPI';
import { useRouter } from 'next/navigation';

// Trading instrument types
type MarketType = 'forex' | 'crypto' | 'metals' | 'commodities';

const getTimeAgo = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${hours}h ${remainingMins}m ago`;
};

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
  };
  return badges[type];
};

export function LiveTradingSignals() {
  const router = useRouter();
  const [trades, setTrades] = useState<TradingSignal[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch trading signals from backend
  const loadSignals = async () => {
    try {
      setError(null);
      setIsLoadingPrices(true);

      console.log('[Trading Signals] 🔄 Fetching from backend...');

      const response = await tradingSignalsAPI.getSignals(4);

      // Handle different response structures
      let signalsData: any[] = [];
      if (response && typeof response === 'object') {
        // Check if response has data property
        if ('data' in response && Array.isArray(response.data)) {
          signalsData = response.data;
        } else if (Array.isArray(response)) {
          // Response might be unwrapped array
          signalsData = response;
        } else if (
          'success' in response &&
          response.success &&
          'data' in response
        ) {
          signalsData = (response as any).data || [];
        }
      }

      if (signalsData.length > 0) {
        setTrades(signalsData);
        setLastUpdate(new Date());
        console.log(
          '[Trading Signals] ✅ Loaded',
          signalsData.length,
          'signals from backend'
        );
      } else {
        console.warn('[Trading Signals] ⚠️ No signals in response');
        // Don't set error if response is valid but empty - just keep existing data
      }
    } catch (error: any) {
      // Better error logging - extract useful information instead of logging empty object
      const err = error as {
        code?: string;
        message?: string;
        response?: { status?: number };
        statusCode?: number;
      };
      const statusCode = err?.response?.status || err?.statusCode;
      const isNetworkError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch') ||
        (!err?.response && !statusCode);

      if (isNetworkError) {
        // Only log in development to avoid console spam
        if (process.env.NODE_ENV === 'development') {
          console.debug(
            '[Trading Signals] Network error - backend may be unavailable'
          );
        }
        setError(
          'Unable to connect to trading signals service. The backend server might be down.'
        );
        // Don't clear existing trades on network error - keep showing last good data
        // The component will continue showing cached data while backend is unavailable
      } else if (statusCode === 404) {
        console.warn(
          '[Trading Signals] ⚠️ Trading signals endpoint not found (404)'
        );
        setError('Trading signals feature not available');
      } else {
        console.error('[Trading Signals] ❌ Failed to load signals:', {
          code: err?.code,
          message: err?.message,
          status: statusCode,
        });
        setError('Unable to load trading signals');
      }

      // Don't clear existing trades on error - keep showing last good data
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Load signals on mount and refresh every 30 seconds
  useEffect(() => {
    loadSignals();

    // Refresh every 30 seconds (backend generates new signal every 60 seconds)
    const interval = setInterval(() => {
      console.log('[Trading Signals] 🔄 Auto-refresh...');
      loadSignals();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card/50 group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-transparent" />

      {/* Animated Floating Blob */}
      <motion.div
        animate={{
          x: [0, -15, 0],
          y: [0, 10, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-emerald-500/30 blur-2xl"
      />

      <CardHeader className="relative p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -10 }}
              className="rounded-xl bg-gradient-to-br from-emerald-500/30 to-blue-500/20 p-2 shadow-lg backdrop-blur-sm sm:p-3"
            >
              <ActivityIcon className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CardTitle className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-sm font-bold text-transparent sm:text-base md:text-lg">
                  Live Trading Signals
                </CardTitle>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </motion.div>
              </div>
              <CardDescription className="text-[10px] sm:text-xs">
                <Check className="mr-1 inline h-3 w-3 flex-shrink-0 text-emerald-500" />
                {isLoadingPrices ? (
                  <>
                    <RefreshCw className="mr-1 inline h-3 w-3 animate-spin" />
                    Updating...
                  </>
                ) : error ? (
                  <span className="text-red-500">{error}</span>
                ) : (
                  <span className="truncate">
                    Real market data • Verifiable
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => router.push('/dashboard/trading-signals')}
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Button>
            <Badge className="w-fit self-start border-emerald-500/30 bg-emerald-500/20 text-emerald-700 sm:self-auto dark:text-emerald-300">
              <ZapIcon className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="custom-scrollbar relative max-h-[400px] space-y-2 overflow-y-auto px-3 pb-4 sm:max-h-[450px] sm:space-y-3 sm:px-6">
        {trades.length === 0 && !error ? (
          <div className="text-muted-foreground py-8 text-center">
            <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin" />
            <p className="text-sm">Loading live trades...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {trades.map((trade, index) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`rounded-xl border p-3 transition-all sm:p-4 ${
                  trade.isProfitable
                    ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:shadow-md'
                    : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40 hover:shadow-md'
                } `}
              >
                <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                    <div
                      className={`flex-shrink-0 rounded-lg p-1.5 sm:p-2 ${trade.direction === 'LONG' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}
                    >
                      {trade.direction === 'LONG' ? (
                        <TrendingUp
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                        />
                      ) : (
                        <TrendingDown
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <p className="text-foreground text-sm font-bold sm:text-base">
                          {trade.symbol}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getMarketTypeBadge(trade.marketType).className}`}
                        >
                          {getMarketTypeBadge(trade.marketType).label}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs font-semibold uppercase">
                        {trade.direction}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {trade.isProfitable ? (
                      <Check className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 dark:text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 sm:h-5 sm:w-5 dark:text-red-400" />
                    )}
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2 sm:mb-3 sm:gap-3">
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold">
                      Entry
                    </p>
                    <p className="text-foreground text-xs font-bold break-all sm:text-sm">
                      {trade.entryPrice.toFixed(
                        trade.symbol.includes('JPY') ? 3 : 5
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      @{' '}
                      {new Date(trade.entryTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <p className="text-muted-foreground text-xs font-semibold">
                      Exit
                    </p>
                    <p className="text-foreground text-xs font-bold break-all sm:text-sm">
                      {trade.exitPrice.toFixed(
                        trade.symbol.includes('JPY') ? 3 : 5
                      )}
                    </p>
                    <p className="text-muted-foreground text-xs whitespace-nowrap">
                      @{' '}
                      {new Date(trade.exitTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-border/50 flex flex-col gap-2 border-t pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:pt-3">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span
                      className={`text-xs font-bold sm:text-sm ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {trade.isProfitable ? '+' : ''}
                      {trade.pipsPoints.toFixed(1)}{' '}
                      {trade.marketType === 'forex' ? 'pips' : 'pts'}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span
                      className={`text-sm font-black sm:text-base ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {trade.isProfitable ? '+' : ''}
                      {trade.profitUSD >= 0 ? '$' : '-$'}
                      {Math.abs(trade.profitUSD).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {getTimeAgo(trade.minutesAgo)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        <div className="border-border/50 border-t pt-3">
          <p className="text-muted-foreground flex flex-wrap items-center justify-center gap-1 px-2 text-center text-xs sm:gap-1.5">
            <Check className="h-3 w-3 flex-shrink-0 text-emerald-500" />
            <strong className="whitespace-nowrap">Auto-updated</strong>
            <span className="text-muted-foreground/60 hidden sm:inline">•</span>
            <span className="whitespace-nowrap">Verifiable on TradingView</span>
            {lastUpdate && (
              <>
                <span className="text-muted-foreground/60 hidden sm:inline">
                  •
                </span>
                <span className="text-muted-foreground/80 text-xs whitespace-nowrap">
                  {lastUpdate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      </CardContent>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </Card>
  );
}

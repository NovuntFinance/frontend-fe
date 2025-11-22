/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { tradingSignalsAPI, TradingSignal } from '@/services/tradingSignalsAPI';

// Trading instrument types
type MarketType = 'forex' | 'crypto' | 'metals';

const getTimeAgo = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${hours}h ${remainingMins}m ago`;
};

const getMarketTypeBadge = (type: MarketType) => {
  const badges = {
    forex: { label: 'Forex', className: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    crypto: { label: 'Crypto', className: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
    metals: { label: 'Metals', className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' },
  };
  return badges[type];
};

export function LiveTradingSignals() {
  const [trades, setTrades] = useState<TradingSignal[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
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
        } else if ('success' in response && response.success && 'data' in response) {
          signalsData = (response as any).data || [];
        }
      }

      if (signalsData.length > 0) {
        setTrades(signalsData);
        setLastUpdate(new Date());
        console.log('[Trading Signals] ✅ Loaded', signalsData.length, 'signals from backend');
      } else {
        console.warn('[Trading Signals] ⚠️ No signals in response');
        // Don't set error if response is valid but empty - just keep existing data
      }
    } catch (error: any) {
      // Better error logging - extract useful information instead of logging empty object
      const err = error as { code?: string; message?: string; response?: { status?: number }; statusCode?: number };
      const statusCode = err?.response?.status || err?.statusCode;
      const isNetworkError = err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.message?.includes('Failed to fetch') ||
        (!err?.response && !statusCode);

      if (isNetworkError) {
        console.warn('[Trading Signals] ⚠️ Network error - backend might be unavailable', {
          code: err?.code || 'ERR_NETWORK',
          message: err?.message || 'Network Error',
        });
        setError('Unable to connect to trading signals service. The backend server might be down.');
        // Don't clear existing trades on network error - keep showing last good data
        // The component will continue showing cached data while backend is unavailable
      } else if (statusCode === 404) {
        console.warn('[Trading Signals] ⚠️ Trading signals endpoint not found (404)');
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
    <Card className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-transparent" />

      <motion.div
        animate={{ x: [0, 15, 0], y: [0, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"
      />

      <CardHeader className="relative pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-sm flex-shrink-0"
            >
              <ActivityIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span className="truncate">Live Trading Signals</span>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </motion.div>
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-1 sm:gap-2 flex-wrap mt-1">
                <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                {isLoadingPrices ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin inline" />
                    <span>Updating...</span>
                  </>
                ) : error ? (
                  <span className="text-red-500 text-xs">{error}</span>
                ) : (
                  <span className="truncate">Real market data • Verifiable</span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1 h-8 text-xs"
            >
              {isExpanded ? 'Hide Details' : 'Show Details'}
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 w-fit self-start sm:self-auto">
              <ZapIcon className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="relative space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[450px] overflow-y-auto custom-scrollbar px-3 sm:px-6 pb-4">
              {trades.length === 0 && !error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
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
                      className={`
                  p-3 sm:p-4 rounded-xl border transition-all
                  ${trade.isProfitable
                          ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-md'
                          : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 hover:shadow-md'
                        }
                `}
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${trade.direction === 'LONG' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                            {trade.direction === 'LONG' ? (
                              <TrendingUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                            ) : (
                              <TrendingDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <p className="font-bold text-sm sm:text-base text-foreground">{trade.symbol}</p>
                              <Badge variant="outline" className={`text-xs ${getMarketTypeBadge(trade.marketType).className}`}>
                                {getMarketTypeBadge(trade.marketType).label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold uppercase mt-0.5">
                              {trade.direction}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {trade.isProfitable ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="space-y-0.5 sm:space-y-1">
                          <p className="text-xs text-muted-foreground font-semibold">Entry</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground break-all">
                            {trade.entryPrice.toFixed(trade.symbol.includes('JPY') ? 3 : 5)}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            @ {new Date(trade.entryTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                          <p className="text-xs text-muted-foreground font-semibold">Exit</p>
                          <p className="text-xs sm:text-sm font-bold text-foreground break-all">
                            {trade.exitPrice.toFixed(trade.symbol.includes('JPY') ? 3 : 5)}
                          </p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            @ {new Date(trade.exitTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-2 sm:pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className={`text-xs sm:text-sm font-bold ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trade.isProfitable ? '+' : ''}{trade.pipsPoints.toFixed(1)} {trade.marketType === 'forex' ? 'pips' : 'pts'}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className={`text-sm sm:text-base font-black ${trade.isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trade.isProfitable ? '+' : ''}{trade.profitUSD >= 0 ? '$' : '-$'}{Math.abs(trade.profitUSD).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{getTimeAgo(trade.minutesAgo)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1 sm:gap-1.5 flex-wrap px-2">
                  <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                  <strong className="whitespace-nowrap">Auto-updated</strong>
                  <span className="text-muted-foreground/60 hidden sm:inline">•</span>
                  <span className="whitespace-nowrap">Verifiable on TradingView</span>
                  {lastUpdate && (
                    <>
                      <span className="text-muted-foreground/60 hidden sm:inline">•</span>
                      <span className="text-muted-foreground/80 whitespace-nowrap text-xs">
                        {lastUpdate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

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

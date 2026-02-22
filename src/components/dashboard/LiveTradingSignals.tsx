'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { tradingSignalsAPI, TradingSignal } from '@/services/tradingSignalsAPI';

// Trading instrument types
type MarketType = 'forex' | 'crypto' | 'metals' | 'commodities';

const getTimeAgo = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${hours}h ${remainingMins}m ago`;
};

/** Theme-aware neumorphic (uses CSS variables for light/dark) */
const NEU_CARD_SHADOW = `
  inset 8px 8px 16px var(--app-shadow-dark),
  inset -8px -8px 16px var(--app-shadow-light),
  inset 2px 2px 4px rgba(0, 0, 0, 0.15),
  inset -2px -2px 4px var(--app-shadow-light),
  0 0 0 1px var(--app-border)
`;

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

const ROTATE_INTERVAL_MS = 5000;
const LARGE_SCREEN_ROWS = 2;

function TradeRow({ trade }: { trade: TradingSignal }) {
  return (
    <div className="w-full space-y-1">
      {/* Row 1: Icon + Symbol + metadata */}
      <div className="flex items-center gap-1.5">
        <div
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
          style={{ background: 'var(--app-overlay)' }}
        >
          {trade.direction === 'LONG' ? (
            <TrendingUp className="h-3 w-3" style={{ color: 'var(--app-text-primary)' }} />
          ) : (
            <TrendingDown className="h-3 w-3" style={{ color: 'var(--app-text-primary)' }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-medium" style={{ color: 'var(--app-text-secondary)' }}>
            {trade.symbol} {trade.direction}
          </p>
          <p className="text-[9px]" style={{ color: 'var(--app-text-muted)' }}>
            {getTimeAgo(trade.minutesAgo)} • {getMarketTypeBadge(trade.marketType).label}
          </p>
        </div>
      </div>
      {/* Row 2: Entry | Exit compact */}
      <div className="grid grid-cols-2 gap-2 rounded border border-white/5 bg-black/20 px-2 py-1.5">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Entry</p>
          <p className="truncate text-[10px] font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {trade.entryPrice.toFixed(trade.symbol.includes('JPY') ? 3 : 5)}
          </p>
          <p className="text-[8px]" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
            @ {new Date(trade.entryTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Exit</p>
          <p className="truncate text-[10px] font-semibold" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {trade.exitPrice.toFixed(trade.symbol.includes('JPY') ? 3 : 5)}
          </p>
          <p className="text-[8px]" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
            @ {new Date(trade.exitTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </p>
        </div>
      </div>
      {/* Row 3: P/L + status */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <span
          className="text-sm font-bold"
          style={{ color: trade.isProfitable ? '#22c55e' : '#ef4444' }}
        >
          {trade.isProfitable ? '+' : ''}
          {trade.profitUSD >= 0 ? '$' : '-$'}
          {Math.abs(trade.profitUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[9px] font-medium" style={{ color: 'var(--app-text-muted)' }}>
          {trade.isProfitable ? 'Profitable' : 'Closed'}
        </span>
      </div>
    </div>
  );
}

export function LiveTradingSignals() {
  const [trades, setTrades] = useState<TradingSignal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

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

  // Large screen: show 4 rows (lg breakpoint)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = () => setIsLargeScreen(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  const tradesKey = React.useMemo(() => trades.map((t) => t.id).join(','), [trades]);
  useEffect(() => {
    if (trades.length > 0) setCurrentIndex(0);
  }, [tradesKey, trades.length]);

  // Auto-rotate every 5s (same on small and large screens)
  useEffect(() => {
    if (trades.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trades.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [trades.length]);

  const currentTrade = trades.length > 0 ? trades[currentIndex] : null;
  // Large screens: show 2 rows at a time, sliding window from currentIndex (same rotation as small)
  const tradesToShow = isLargeScreen && trades.length > 0
    ? Array.from({ length: LARGE_SCREEN_ROWS }, (_, i) => trades[(currentIndex + i) % trades.length])
    : [];

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border-0 transition-shadow duration-300 hover:shadow-xl"
      style={{ background: 'var(--app-surface)', boxShadow: NEU_CARD_SHADOW }}
    >
      <CardContent className="relative p-3 sm:p-4">
        <div className="min-h-[72px]">
          {trades.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-4 text-center" style={{ color: 'var(--app-text-muted)' }}>
              <RefreshCw className="mb-1.5 h-5 w-5 animate-spin" style={{ color: 'var(--app-accent)' }} />
              <p className="text-xs">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-4 text-center text-xs" style={{ color: 'var(--app-text-muted)' }}>
              <p>{error}</p>
            </div>
          ) : isLargeScreen && tradesToShow.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-2"
              >
                {tradesToShow.map((trade) => (
                  <div
                    key={trade.id}
                    className="rounded-lg border bg-black/10 p-2 dark:border-white/5" style={{ borderColor: 'var(--app-border)' }}
                  >
                    <TradeRow trade={trade} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : currentTrade ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentTrade.id}-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <TradeRow trade={currentTrade} />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

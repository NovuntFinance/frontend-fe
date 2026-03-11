'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { tradingSignalsAPI, TradingSignal } from '@/services/tradingSignalsAPI';
import { formatErrorForLog } from '@/lib/error-utils';

const getTimeAgo = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${hours}h ${remainingMins}m ago`;
};

/** Dashboard card style (match Activity Feed, Daily ROS, stake card) */
const CARD_STYLE = {
  background: 'var(--neu-bg)',
  boxShadow: 'var(--neu-shadow-raised)',
  border: '1px solid var(--neu-border)',
} as const;

const ROTATE_INTERVAL_MS = 5000;

const formatTime = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

/** Minimal signal row: label + entry/exit + value (P/L) + contextual icon */
function TradeRow({ trade }: { trade: TradingSignal }) {
  const isProfit = trade.profitUSD >= 0;
  const amountStr =
    (isProfit ? '+$' : '-$') +
    Math.abs(trade.profitUSD).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const decimals = trade.symbol.includes('JPY') ? 3 : 5;
  const entryTimeStr = formatTime(trade.entryTime);
  const exitTimeStr = formatTime(trade.exitTime);
  const SignalIcon = isProfit ? TrendingUp : TrendingDown;

  return (
    <div className="relative w-full min-w-0 pr-12 pb-3">
      {/* Contextual icon on the right */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2">
        <SignalIcon className="h-10 w-10" style={{ color: '#009BF2' }} />
      </div>

      <div className="mb-1">
        <p
          className="truncate text-left text-xs font-semibold sm:text-sm"
          style={{ color: 'var(--neu-accent)' }}
        >
          {trade.symbol} {trade.direction}
          <span
            className="ml-1.5 font-normal"
            style={{ color: 'var(--neu-text-secondary)' }}
          >
            · {getTimeAgo(trade.minutesAgo)}
          </span>
        </p>
      </div>

      {/* Compact Entry → Exit row with times */}
      <div
        className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-xs"
        style={{ color: 'var(--neu-text-secondary)' }}
      >
        <span className="shrink-0">
          Entry{' '}
          <span
            className="font-medium"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            {trade.entryPrice.toFixed(decimals)}
          </span>
          {entryTimeStr && (
            <span className="ml-0.5" style={{ color: 'var(--neu-text-muted)' }}>
              @ {entryTimeStr}
            </span>
          )}
        </span>
        <span className="shrink-0" style={{ color: 'var(--neu-text-muted)' }}>
          →
        </span>
        <span className="min-w-0 truncate">
          Exit{' '}
          <span
            className="font-medium"
            style={{ color: 'var(--neu-text-primary)' }}
          >
            {trade.exitPrice.toFixed(decimals)}
          </span>
          {exitTimeStr && (
            <span className="ml-0.5" style={{ color: 'var(--neu-text-muted)' }}>
              @ {exitTimeStr}
            </span>
          )}
        </span>
      </div>

      <span
        className="text-sm font-black sm:text-base"
        style={{ color: 'var(--neu-text-primary)' }}
      >
        {amountStr}
      </span>
    </div>
  );
}

export function LiveTradingSignals() {
  const [trades, setTrades] = useState<TradingSignal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
        console.error(
          '[Trading Signals] ❌ Failed to load signals:',
          formatErrorForLog(error, { status: statusCode })
        );
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

  const tradesKey = React.useMemo(
    () => trades.map((t) => t.id).join(','),
    [trades]
  );
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
  const router = useRouter();

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-2xl transition-shadow duration-300"
      style={CARD_STYLE}
      onClick={() => router.push('/dashboard/trading-signals')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push('/dashboard/trading-signals');
        }
      }}
      role="link"
      tabIndex={0}
      aria-label="View all trading signals"
    >
      <div className="px-7 py-3 sm:px-8 sm:py-4">
        <div className="relative min-h-[56px]">
          {trades.length === 0 && !error ? (
            <>
              <div className="mb-1">
                <p
                  className="text-left text-xs font-semibold sm:text-sm"
                  style={{ color: 'var(--neu-accent)' }}
                >
                  Live Trading Signals
                </p>
              </div>
              <p
                className="text-left text-sm"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                Loading...
              </p>
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <TrendingUp
                  className="h-10 w-10"
                  style={{ color: '#009BF2' }}
                />
              </div>
            </>
          ) : error ? (
            <>
              <div className="mb-1">
                <p
                  className="text-left text-xs font-semibold sm:text-sm"
                  style={{ color: 'var(--neu-accent)' }}
                >
                  Live Trading Signals
                </p>
              </div>
              <p
                className="text-left text-xs"
                style={{ color: 'var(--neu-text-secondary)' }}
              >
                {error}
              </p>
              <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <TrendingUp
                  className="h-10 w-10"
                  style={{ color: '#009BF2' }}
                />
              </div>
            </>
          ) : currentTrade ? (
            <AnimatePresence initial={false}>
              <motion.div
                key={`${currentTrade.id}-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 w-full"
              >
                <TradeRow trade={currentTrade} />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      </div>
    </div>
  );
}

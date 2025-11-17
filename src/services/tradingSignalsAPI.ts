/**
 * Trading Signals API Service
 * 
 * Connects to the backend trading signals system
 * Backend automatically fetches real prices and generates trades
 * 
 * @see FRONTEND_INTEGRATION_PACKAGE.md for full documentation
 */

import { api } from '@/lib/api';

export interface MarketPrice {
  symbol: string;
  marketType: 'forex' | 'crypto' | 'metals';
  currentPrice: number;
  high24h?: number;
  low24h?: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
  volume24h?: number;
  lastUpdated: string;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  marketType: 'forex' | 'crypto' | 'metals';
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  pipsPoints: number;
  profitUSD: number;
  isProfitable: boolean;
  duration: number;
  minutesAgo: number;
}

export interface TradingStatistics {
  totalSignals: number;
  profitableSignals: number;
  winRate: string;
  signals24h: number;
  totalProfit: number;
}

export interface MarketPricesResponse {
  success: boolean;
  data: {
    crypto: MarketPrice[];
    forex: MarketPrice[];
    metals: MarketPrice[];
  };
  lastUpdate: string;
  count: number;
}

export interface SignalsResponse {
  success: boolean;
  data: TradingSignal[];
  count: number;
}

export interface StatisticsResponse {
  success: boolean;
  stats: TradingStatistics;
}

/**
 * Trading Signals API Client
 */
export const tradingSignalsAPI = {
  /**
   * Get all market prices
   * Backend auto-updates every 5 minutes
   */
  getMarketPrices: async (marketType?: string): Promise<MarketPricesResponse> => {
    try {
      const url = marketType 
        ? `/trading-signals/market-prices?marketType=${marketType}`
        : `/trading-signals/market-prices`;
      
      const response = await api.get<MarketPricesResponse>(url);
      return response;
    } catch (error: any) {
      const err = error as { code?: string; message?: string; response?: { status?: number }; statusCode?: number };
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.message?.includes('Network Error') ||
                            err?.message?.includes('Failed to fetch') ||
                            (!err?.response && !err?.statusCode);
      
      if (isNetworkError) {
        console.warn('[Trading Signals API] ⚠️ Network error fetching market prices - backend might be unavailable');
      } else {
        console.error('[Trading Signals API] Failed to fetch market prices:', {
          code: err?.code,
          message: err?.message,
          status: err?.response?.status || err?.statusCode,
        });
      }
      throw error;
    }
  },

  /**
   * Get recent trading signals
   * Backend auto-generates new signal every 60 seconds
   */
  getSignals: async (limit: number = 4): Promise<SignalsResponse> => {
    try {
      const response = await api.get<SignalsResponse>(
        `/trading-signals/signals?limit=${limit}`
      );
      return response;
    } catch (error: any) {
      // Better error logging for network errors
      const err = error as { code?: string; message?: string; response?: { status?: number }; statusCode?: number };
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.message?.includes('Network Error') ||
                            err?.message?.includes('Failed to fetch') ||
                            (!err?.response && !err?.statusCode);
      
      if (isNetworkError) {
        console.warn('[Trading Signals API] ⚠️ Network error - backend might be unavailable', {
          code: err?.code,
          message: err?.message,
          endpoint: '/trading-signals/signals',
          limit,
        });
      } else {
        console.error('[Trading Signals API] Failed to fetch signals:', {
          code: err?.code,
          message: err?.message,
          status: err?.response?.status || err?.statusCode,
          endpoint: '/trading-signals/signals',
          limit,
        });
      }
      throw error;
    }
  },

  /**
   * Get trading statistics
   */
  getStatistics: async (): Promise<StatisticsResponse> => {
    try {
      const response = await api.get<StatisticsResponse>(
        `/trading-signals/statistics`
      );
      return response;
    } catch (error: any) {
      const err = error as { code?: string; message?: string; response?: { status?: number }; statusCode?: number };
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.message?.includes('Network Error') ||
                            err?.message?.includes('Failed to fetch') ||
                            (!err?.response && !err?.statusCode);
      
      if (isNetworkError) {
        console.warn('[Trading Signals API] ⚠️ Network error fetching statistics - backend might be unavailable');
      } else {
        console.error('[Trading Signals API] Failed to fetch statistics:', {
          code: err?.code,
          message: err?.message,
          status: err?.response?.status || err?.statusCode,
        });
      }
      throw error;
    }
  },

  /**
   * Get specific instrument price
   */
  getPrice: async (symbol: string): Promise<{ success: boolean; data: MarketPrice }> => {
    try {
      const response = await api.get<{ success: boolean; data: MarketPrice }>(
        `/trading-signals/price/${symbol}`
      );
      return response;
    } catch (error: any) {
      const err = error as { code?: string; message?: string; response?: { status?: number }; statusCode?: number };
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.message?.includes('Network Error') ||
                            err?.message?.includes('Failed to fetch') ||
                            (!err?.response && !err?.statusCode);
      
      if (isNetworkError) {
        console.warn('[Trading Signals API] ⚠️ Network error fetching price - backend might be unavailable', { symbol });
      } else {
        console.error('[Trading Signals API] Failed to fetch price:', {
          code: err?.code,
          message: err?.message,
          status: err?.response?.status || err?.statusCode,
          symbol,
        });
      }
      throw error;
    }
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<{ success: boolean; status: string; message: string }> => {
    try {
      const response = await api.get<{ success: boolean; status: string; message: string }>(
        `/trading-signals/health`
      );
      return response;
    } catch (error: any) {
      const err = error as { code?: string; message?: string; response?: { status?: number }; statusCode?: number };
      const isNetworkError = err?.code === 'ERR_NETWORK' || 
                            err?.message?.includes('Network Error') ||
                            err?.message?.includes('Failed to fetch') ||
                            (!err?.response && !err?.statusCode);
      
      if (isNetworkError) {
        console.warn('[Trading Signals API] ⚠️ Network error during health check - backend might be unavailable');
      } else {
        console.error('[Trading Signals API] Health check failed:', {
          code: err?.code,
          message: err?.message,
          status: err?.response?.status || err?.statusCode,
        });
      }
      throw error;
    }
  }
};


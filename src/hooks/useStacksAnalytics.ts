'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStacksTransactions } from './useStacksTransactions';
import { calculateWalletAnalytics, WalletAnalytics } from '@/lib/stacksAnalytics';

export interface UseStacksAnalyticsResult {
  analytics: WalletAnalytics | null;
  isLoading: boolean;
  error: string | null;
  timeRange: '7d' | '30d' | 'all';
  setTimeRange: (range: '7d' | '30d' | 'all') => void;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useStacksAnalytics(
  address: string | null,
  network: 'mainnet' | 'testnet' = 'mainnet'
): UseStacksAnalyticsResult {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { transactions, isLoading: transactionsLoading } = useStacksTransactions(address, network, 1000);

  // Compute analytics whenever transactions change
  const computeAnalytics = useCallback(() => {
    if (transactions.length === 0) {
      setAnalytics(null);
      return;
    }

    console.log('[useStacksAnalytics] Computing analytics for', transactions.length, 'transactions');
    
    try {
      let filteredTransactions = transactions;
      
      // Filter by time range
      const now = Date.now();
      if (timeRange === '7d') {
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => tx.timestamp >= sevenDaysAgo);
      } else if (timeRange === '30d') {
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        filteredTransactions = transactions.filter(tx => tx.timestamp >= thirtyDaysAgo);
      }
      // 'all' uses all transactions

      const analyticsData = calculateWalletAnalytics(filteredTransactions);
      console.log('[useStacksAnalytics] Computed analytics:', analyticsData);
      
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('[useStacksAnalytics] Error computing analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to compute analytics');
    } finally {
      setIsLoading(false);
    }
  }, [transactions, timeRange]);

  const refetch = useCallback(async () => {
    console.log('[useStacksAnalytics] Refetching analytics');
    setError(null);
    await computeAnalytics();
  }, [computeAnalytics]);

  const clearCache = useCallback(() => {
    console.log('[useStacksAnalytics] Clearing analytics cache');
    // Import and clear transaction cache
    import('@/lib/stacksApi').then(({ clearTransactionCache }) => {
      clearTransactionCache();
    });
  }, []);

  // Auto-compute analytics when transactions change
  useEffect(() => {
    if (transactions.length > 0 && !isLoading) {
      setIsLoading(true);
      computeAnalytics();
    }
  }, [transactions, computeAnalytics, isLoading]);

  return {
    analytics,
    isLoading: isLoading || transactionsLoading,
    error,
    timeRange,
    setTimeRange,
    refetch,
    clearCache,
  };
}

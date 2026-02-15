'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchWalletTransactions, StacksTransaction } from '@/lib/stacksApi';

export interface UseStacksTransactionsResult {
  transactions: StacksTransaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useStacksTransactions(
  address: string | null, 
  network: 'mainnet' | 'testnet' = 'mainnet',
  limit: number = 20
): UseStacksTransactionsResult {
  const [transactions, setTransactions] = useState<StacksTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (forceRefresh = false) => {
    if (!address) {
      console.log('[useStacksTransactions] No address provided, skipping fetch');
      return;
    }

    console.log(`[useStacksTransactions] Fetching transactions for ${address}`);
    setIsLoading(true);
    setError(null);

    try {
      const walletTransactions = await fetchWalletTransactions(address, network, limit);
      
      console.log(`[useStacksTransactions] Fetched ${walletTransactions.length} transactions`);
      
      setTransactions(walletTransactions);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      console.error('[useStacksTransactions] Error:', errorMessage);
      setError(errorMessage);
      
      // Reset to default values on error
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, network, limit]);

  const refetch = useCallback(async () => {
    await fetchTransactions(true);
  }, [fetchTransactions]);

  const clearCache = useCallback(() => {
    // Import and call the clear cache function
    import('@/lib/stacksApi').then(({ clearTransactionCache }) => {
      clearTransactionCache();
    });
  }, []);

  // Fetch transactions when address, network, or limit changes
  useEffect(() => {
    if (address) {
      fetchTransactions();
    } else {
      // Reset state when no address
      setTransactions([]);
      setError(null);
      setIsLoading(false);
    }
  }, [address, network, limit, fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch,
    clearCache,
  };
}

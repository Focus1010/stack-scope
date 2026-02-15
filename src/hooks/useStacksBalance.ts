'use client';

import { useState, useCallback, useEffect } from 'react';
import { fetchAccountBalance, formatStxBalance, AccountBalance } from '@/lib/stacksApi';

export interface UseStacksBalanceResult {
  balance: string;
  formattedBalance: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export function useStacksBalance(address: string | null, network: 'mainnet' | 'testnet' = 'mainnet'): UseStacksBalanceResult {
  const [balance, setBalance] = useState<string>('0');
  const [formattedBalance, setFormattedBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (forceRefresh = false) => {
    if (!address) {
      console.log('[useStacksBalance] No address provided, skipping fetch');
      return;
    }

    console.log(`[useStacksBalance] Fetching balance for ${address}`);
    setIsLoading(true);
    setError(null);

    try {
      const accountBalance = await fetchAccountBalance(address, network);
      const stxBalance = accountBalance.stx.balance;
      
      console.log(`[useStacksBalance] Raw STX balance: ${stxBalance}`);
      
      setBalance(stxBalance);
      setFormattedBalance(formatStxBalance(stxBalance));
      
      console.log(`[useStacksBalance] Formatted balance: ${formatStxBalance(stxBalance)}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      console.error('[useStacksBalance] Error:', errorMessage);
      setError(errorMessage);
      
      // Reset to default values on error
      setBalance('0');
      setFormattedBalance('0');
    } finally {
      setIsLoading(false);
    }
  }, [address, network]);

  const refetch = useCallback(async () => {
    await fetchBalance(true);
  }, [fetchBalance]);

  const clearCache = useCallback(() => {
    // Import and call the clear cache function
    import('@/lib/stacksApi').then(({ clearBalanceCache }) => {
      clearBalanceCache();
    });
  }, []);

  // Fetch balance when address changes
  useEffect(() => {
    if (address) {
      fetchBalance();
    } else {
      // Reset state when no address
      setBalance('0');
      setFormattedBalance('0');
      setError(null);
      setIsLoading(false);
    }
  }, [address, fetchBalance]);

  return {
    balance,
    formattedBalance,
    isLoading,
    error,
    refetch,
    clearCache,
  };
}

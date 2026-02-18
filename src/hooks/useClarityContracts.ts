'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStacksTransactions } from './useStacksTransactions';
import { useStacksWallet } from './useStacksWallet';
import { getContractNotes, addContractNote, updateContractNote, deleteContractNote, getAllContracts, clearAllContracts, getContractData } from '@/lib/clarityContracts';
import { ClarityContract, ContractData } from '@/lib/clarityContracts';

export interface UseClarityContractsResult {
  contracts: ClarityContract[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addNote: (contractId: string, note: string) => Promise<void>;
  updateNote: (contractId: string, note: string) => Promise<void>;
  deleteNote: (contractId: string) => Promise<void>;
  clearCache: () => void;
}

export function useClarityContracts(): UseClarityContractsResult {
  const [contracts, setContracts] = useState<ClarityContract[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useStacksWallet();
  const { transactions } = useStacksTransactions(address);

  const refetch = useCallback(async () => {
    console.log('[useClarityContracts] Refetching contracts...');
    setError(null);
    setIsLoading(true);
    
    try {
      const contractData = getContractData(transactions);
      setContracts(contractData?.contracts || []);
      console.log('[useClarityContracts] Fetched', contractData?.contracts?.length || 0, 'contracts');
    } catch (err) {
      console.error('[useClarityContracts] Error fetching contracts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  const addNote = useCallback(async (contractId: string, note: string) => {
    console.log('[useClarityContracts] Adding note to contract:', contractId);
    
    try {
      if (!address) {
        throw new Error('No wallet connected');
      }
      
      addContractNote(contractId, note, address, Date.now());
      const updatedContracts = getContractData(transactions);
      setContracts(updatedContracts?.contracts || []);
      console.log('[useClarityContracts] Added note to contract:', contractId);
    } catch (err) {
      console.error('[useClarityContracts] Error adding note:', err);
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsLoading(false);
    }
  }, [address, transactions]);

  const updateNote = useCallback(async (contractId: string, note: string) => {
    console.log('[useClarityContracts] Updating note in contract:', contractId);
    
    try {
      updateContractNote(contractId, note, Date.now());
      const updatedContracts = getContractData(transactions);
      setContracts(updatedContracts?.contracts || []);
      console.log('[useClarityContracts] Updated note in contract:', contractId);
    } catch (err) {
      console.error('[useClarityContracts] Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to update note');
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  const deleteNote = useCallback(async (contractId: string) => {
    console.log('[useClarityContracts] Deleting note from contract:', contractId);
    
    try {
      deleteContractNote(contractId);
      const updatedContracts = getContractData(transactions);
      setContracts(updatedContracts?.contracts || []);
      console.log('[useClarityContracts] Deleted note from contract:', contractId);
    } catch (err) {
      console.error('[useClarityContracts] Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  const clearCache = useCallback(() => {
    console.log('[useClarityContracts] Clearing contract cache');
    clearAllContracts();
    setContracts([]);
    setError(null);
  }, []);

  // Auto-fetch when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      refetch();
    }
  }, [transactions, refetch]);

  return {
    contracts,
    isLoading,
    error,
    refetch,
    addNote,
    updateNote,
    deleteNote,
    clearCache,
  };
}

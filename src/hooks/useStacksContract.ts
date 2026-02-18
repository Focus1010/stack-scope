import { useState, useCallback } from 'react';
import { useStacksWallet } from './useStacksWallet';
import { 
  addNote, 
  getNote, 
  updateNote, 
  deleteNote, 
  getContractInfo,
  ContractResponse,
  NoteData,
  generateTestTxid
} from '../lib/stacksContract';

export interface ContractNote {
  txid: string;
  note: string;
  owner: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface ContractState {
  notes: ContractNote[];
  isLoading: boolean;
  error: string | null;
  contractInfo: {
    address: string;
    name: string;
    network: string;
    explorerUrl: string;
  };
}

export function useStacksContract() {
  const { address, isConnected } = useStacksWallet();
  const [state, setState] = useState<ContractState>({
    notes: [],
    isLoading: false,
    error: null,
    contractInfo: getContractInfo(),
  });

  // Add a note
  const addContractNote = useCallback(async (note: string, txid?: string) => {
    if (!isConnected) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    const noteTxid = txid || generateTestTxid();
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      notes: [...prev.notes, {
        txid: noteTxid,
        note,
        owner: address || '',
        timestamp: Date.now(),
        isLoading: true,
      }]
    }));

    try {
      const result = await addNote(noteTxid, note);
      
      if (result.isOk) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          notes: prev.notes.map(n => 
            n.txid === noteTxid 
              ? { ...n, isLoading: false }
              : n
          ),
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.value as string,
          notes: prev.notes.filter(n => n.txid !== noteTxid),
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as string,
        notes: prev.notes.filter(n => n.txid !== noteTxid),
      }));
    }
  }, [isConnected, address]);

  // Get a note
  const getContractNote = useCallback(async (txid: string): Promise<NoteData | null> => {
    try {
      const result = await getNote(txid);
      if (result.isOk) {
        return result.value as NoteData;
      }
      return null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  }, []);

  // Update a note
  const updateContractNote = useCallback(async (txid: string, note: string) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const result = await updateNote(txid, note);
      
      if (result.isOk) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          notes: prev.notes.map(n => 
            n.txid === txid 
              ? { ...n, note, timestamp: Date.now() }
              : n
          ),
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.value as string,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as string,
      }));
    }
  }, []);

  // Delete a note
  const deleteContractNote = useCallback(async (txid: string) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const result = await deleteNote(txid);
      
      if (result.isOk) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          notes: prev.notes.filter(n => n.txid !== txid),
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.value as string,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as string,
      }));
    }
  }, []);

  // Load notes for the current user
  const loadUserNotes = useCallback(async () => {
    if (!isConnected || !address) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // This would typically fetch notes from the contract
      // For now, we'll use the local state
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as string,
      }));
    }
  }, [isConnected, address]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh contract info
  const refreshContractInfo = useCallback(() => {
    setState(prev => ({
      ...prev,
      contractInfo: getContractInfo(),
    }));
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    addContractNote,
    getContractNote,
    updateContractNote,
    deleteContractNote,
    loadUserNotes,
    clearError,
    refreshContractInfo,
    
    // Computed
    hasNotes: state.notes.length > 0,
    userNotes: state.notes.filter(note => note.owner === address),
    canInteract: isConnected && !state.isLoading,
  };
}

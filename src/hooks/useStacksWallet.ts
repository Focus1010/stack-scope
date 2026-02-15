'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { UserSession } from '@stacks/connect';
import { StacksWalletState } from '@/types/stacks';
import '@/types/window';
import { detectWallets, getFirstAvailableWallet } from '@/lib/walletDetection';

export function useStacksWallet() {
  const [state, setState] = useState<StacksWalletState>({
    isConnected: false,
    address: null,
    network: 'mainnet',
    isLoading: false,
    error: null,
  });

  // Use useRef to prevent userSession recreation on every render
  const userSessionRef = useRef<UserSession | null>(null);

  if (!userSessionRef.current) {
    userSessionRef.current = new UserSession({
      appConfig: {
        appDetails: {
          name: 'StackScope',
          icon: '/icon.png',
          description: 'Stacks blockchain portfolio dashboard',
        },
      },
    });
  }

  const userSession = userSessionRef.current;

  const checkConnection = useCallback(() => {
    try {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        setState({
          isConnected: true,
          address: userData.profile.stxAddress.mainnet,
          network: userData.profile.stxAddress.mainnet ? 'mainnet' : 'testnet',
          isLoading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          address: null,
          isLoading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to check wallet connection',
        isLoading: false,
      }));
    }
  }, [userSession]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Detect available wallets
      const availableWallet = getFirstAvailableWallet();
      
      if (availableWallet && availableWallet.provider) {
        const response = await availableWallet.provider.request({
          method: 'stx_requestAccounts',
          params: {},
        });
        
        if (response && response.length > 0) {
          setState({
            isConnected: true,
            address: response[0],
            network: 'mainnet',
            isLoading: false,
            error: null,
          });
          return;
        }
      }

      // Fallback to simulated connection for demo
      setTimeout(() => {
        setState({
          isConnected: true,
          address: 'SP1234567890ABCDEF1234567890ABCDEF12345678',
          network: 'mainnet',
          isLoading: false,
          error: null,
        });
      }, 1500);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        isLoading: false,
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    try {
      if (userSession.isUserSignedIn()) {
        userSession.signUserOut();
      }
      
      setState({
        isConnected: false,
        address: null,
        network: 'mainnet',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
      }));
    }
  }, [userSession]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    userSession,
  };
}

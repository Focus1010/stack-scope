'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { UserSession } from '@stacks/connect';
import { StacksWalletState } from '@/types/stacks';

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
        const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
        const network = userData.profile.stxAddress.mainnet ? 'mainnet' : 'testnet';
        
        setState({
          isConnected: true,
          address: address,
          network: network,
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
      // Use the proper Stacks Connect API for real wallet connection
      const { connect } = await import('@stacks/connect');
      
      connect({
        appDetails: {
          name: 'StackScope',
          icon: '/icon.png',
          description: 'Stacks blockchain portfolio dashboard',
        },
        userSession: userSession,
        onFinish: (payload) => {
          console.log('Wallet connected successfully:', payload);
          checkConnection();
        },
        onCancel: () => {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Connection cancelled by user'
          }));
        },
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        isLoading: false,
      }));
    }
  }, [userSession, checkConnection]);

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

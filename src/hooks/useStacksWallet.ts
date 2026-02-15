'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { UserSession } from '@stacks/auth';
import { AppConfig } from '@stacks/auth';
import { StacksWalletState } from '@/types/stacks';

// App configuration for Stacks authentication
const appConfig = new AppConfig(['store_write', 'publish_data'], undefined);
const userSession = new UserSession({ appConfig });

export function useStacksWallet() {
  const [state, setState] = useState<StacksWalletState>({
    isConnected: false,
    address: null,
    network: 'mainnet',
    isLoading: false,
    error: null,
  });

  // Debug logging function (dev only)
  const debugLog = useCallback((message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[StacksWallet] ${message}`, data || '');
    }
  }, []);

  // Check and restore existing session
  const checkConnection = useCallback(() => {
    debugLog('Checking wallet connection...');
    
    try {
      if (userSession.isUserSignedIn()) {
        debugLog('User is signed in, loading user data...');
        const userData = userSession.loadUserData();
        const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
        const network = userData.profile.stxAddress.mainnet ? 'mainnet' : 'testnet';
        
        debugLog('Wallet connected successfully', { address, network });
        
        setState({
          isConnected: true,
          address: address,
          network: network,
          isLoading: false,
          error: null,
        });
      } else {
        debugLog('User is not signed in');
        setState(prev => ({
          ...prev,
          isConnected: false,
          address: null,
          isLoading: false,
        }));
      }
    } catch (error) {
      debugLog('Error checking connection', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to check wallet connection',
        isLoading: false,
      }));
    }
  }, [debugLog]);

  // Handle authentication response from URL
  const handleAuthResponse = useCallback(() => {
    debugLog('Handling authentication response...');
    
    try {
      if (userSession.isSignInPending()) {
        debugLog('Sign-in is pending, processing...');
        userSession.handlePendingSignIn();
        debugLog('Sign-in processed successfully');
        checkConnection();
      } else {
        debugLog('No pending sign-in');
        checkConnection();
      }
    } catch (error) {
      debugLog('Error handling auth response', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to handle authentication response',
        isLoading: false,
      }));
    }
  }, [checkConnection, debugLog]);

  // Initialize connection on mount and handle URL auth response
  useEffect(() => {
    debugLog('Initializing wallet connection...');
    handleAuthResponse();
  }, [handleAuthResponse, debugLog]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    debugLog('Starting wallet connection...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use Stacks Connect for proper wallet extension integration
      const { connect } = await import('@stacks/connect');
      
      connect({
        appDetails: {
          name: 'StackScope',
          icon: '/icon.png',
          description: 'Stacks blockchain portfolio dashboard',
        },
        onFinish: (payload: any) => {
          debugLog('Wallet connected successfully', payload);
          checkConnection();
        },
        onCancel: () => {
          debugLog('Connection cancelled by user');
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Connection cancelled by user'
          }));
        },
        onClose: () => {
          debugLog('Connection popup closed');
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Connection popup closed'
          }));
        },
      });
      
    } catch (error) {
      debugLog('Wallet connection error', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        isLoading: false,
      }));
    }
  }, [debugLog, checkConnection]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    debugLog('Disconnecting wallet...');
    
    try {
      if (userSession.isUserSignedIn()) {
        userSession.signUserOut();
        debugLog('User signed out successfully');
      }
      
      setState({
        isConnected: false,
        address: null,
        network: 'mainnet',
        isLoading: false,
        error: null,
      });
    } catch (error) {
      debugLog('Error disconnecting wallet', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
      }));
    }
  }, [debugLog]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    userSession,
  };
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AppConfig,
  UserSession,
} from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export function useStacksWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');

  // Force check connection state
  const forceCheckConnection = useCallback(() => {
    console.log('[useStacksWallet] Force checking connection state...');
    
    if (userSession.isUserSignedIn()) {
      console.log('[useStacksWallet] User is signed in, updating state...');
      const userData = userSession.loadUserData();
      console.log('[useStacksWallet] User data:', userData);

      const stxAddress =
        userData.profile?.stxAddress?.mainnet ||
        userData.profile?.stxAddress?.testnet;

      if (stxAddress) {
        console.log('[useStacksWallet] Updating connected state:', stxAddress);
        setAddress(stxAddress);
        setIsConnected(true);
        setIsLoading(false);
      }
    } else {
      console.log('[useStacksWallet] User is not signed in, updating disconnected state...');
      setAddress(null);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, []);

  // Restore session on load
  useEffect(() => {
    async function restoreSession() {
      console.log('[useStacksWallet] Restoring session...');
      
      if (userSession.isSignInPending()) {
        console.log('[useStacksWallet] Sign-in is pending, processing...');
        try {
          setIsLoading(true);

          await userSession.handlePendingSignIn();
          console.log('[useStacksWallet] Pending sign-in handled');
          const userData = userSession.loadUserData();
          console.log('[useStacksWallet] User data loaded:', userData);

          const stxAddress =
            userData.profile?.stxAddress?.mainnet ||
            userData.profile?.stxAddress?.testnet;

          if (stxAddress) {
            console.log('[useStacksWallet] Setting address and connected state:', stxAddress);
            setAddress(stxAddress);
            setIsConnected(true);
          }
        } catch (err) {
          console.error('[useStacksWallet] Auth restore failed:', err);
          userSession.signUserOut();
        } finally {
          setIsLoading(false);
        }
      }

      if (userSession.isUserSignedIn()) {
        console.log('[useStacksWallet] User is already signed in');
        const userData = userSession.loadUserData();
        console.log('[useStacksWallet] User data loaded:', userData);

        const stxAddress =
          userData.profile?.stxAddress?.mainnet ||
            userData.profile?.stxAddress?.testnet;

        if (stxAddress) {
          console.log('[useStacksWallet] Setting address and connected state:', stxAddress);
          setAddress(stxAddress);
          setIsConnected(true);
        }
      } else {
        console.log('[useStacksWallet] User is not signed in');
      }
    }

    restoreSession();
  }, []);

  // Add periodic check to ensure state stays in sync
  useEffect(() => {
    const interval = setInterval(() => {
      forceCheckConnection();
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [forceCheckConnection]);

  // Connect
  const connectWallet = useCallback(async () => {
    console.log('[useStacksWallet] Starting wallet connection...');
    setIsLoading(true);

    try {
      // Try different methods for @stacks/connect v8
      const stacksConnect = await import('@stacks/connect');
      console.log('[useStacksWallet] @stacks/connect imported successfully');
      console.log('[useStacksWallet] Available methods:', Object.keys(stacksConnect));
      
      // Try using authenticate method if available
      if (stacksConnect.authenticate) {
        console.log('[useStacksWallet] Using authenticate method');
        stacksConnect.authenticate({
          appDetails: {
            name: 'StackScope',
            icon: window.location.origin + '/logo.png',
          },
          onFinish: (payload: any) => {
            console.log('[useStacksWallet] Authentication finished, payload:', payload);
            
            // Force check connection state immediately
            setTimeout(() => {
              forceCheckConnection();
            }, 100);
          },
          onCancel: () => {
            console.log('[useStacksWallet] Authentication cancelled by user');
            setIsLoading(false);
          },
        });
      } else if (stacksConnect.connect) {
        console.log('[useStacksWallet] Using connect method');
        // Use the correct connect API
        stacksConnect.connect({
          onFinish: (payload: any) => {
            console.log('[useStacksWallet] Connection finished, payload:', payload);
            
            // Force check connection state immediately
            setTimeout(() => {
              forceCheckConnection();
            }, 100);
          },
          onCancel: () => {
            console.log('[useStacksWallet] Connection cancelled by user');
            setIsLoading(false);
          },
        } as any);
      } else {
        console.error('[useStacksWallet] No connect or authenticate method found');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[useStacksWallet] Connection error:', error);
      setIsLoading(false);
    }
  }, []);

  // Disconnect
  const disconnectWallet = useCallback(() => {
    console.log('[useStacksWallet] Disconnecting wallet...');
    try {
      userSession.signUserOut();
      console.log('[useStacksWallet] User signed out successfully');
      
      // Force check connection state immediately
      setTimeout(() => {
        forceCheckConnection();
      }, 100);
      
      console.log('[useStacksWallet] State updated after disconnect');
    } catch (error) {
      console.error('[useStacksWallet] Disconnect error:', error);
    }
  }, [forceCheckConnection]);

  return {
    address,
    isConnected,
    isLoading,
    network,
    connectWallet,
    disconnectWallet,
  };
}

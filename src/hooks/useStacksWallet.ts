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

  // Connect
  const connectWallet = useCallback(async () => {
    console.log('[useStacksWallet] Starting wallet connection...');
    setIsLoading(true);

    try {
      // Use the correct @stacks/connect v8 API
      const { connect } = await import('@stacks/connect');
      console.log('[useStacksWallet] @stacks/connect imported successfully');
      
      connect({
        appDetails: {
          name: 'StackScope',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (payload: any) => {
          console.log('[useStacksWallet] Connection finished, payload:', payload);
          const userData = userSession.loadUserData();
          console.log('[useStacksWallet] User data loaded after connection:', userData);

          const stxAddress =
            userData.profile?.stxAddress?.mainnet ||
            userData.profile?.stxAddress?.testnet;

          if (stxAddress) {
            console.log('[useStacksWallet] Setting address and connected state:', stxAddress);
            setAddress(stxAddress);
            setIsConnected(true);
          }

          setIsLoading(false);
        },
        onCancel: () => {
          console.log('[useStacksWallet] Connection cancelled by user');
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('[useStacksWallet] Connection error:', error);
      setIsLoading(false);
    }
  }, []);

  // Disconnect
  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setAddress(null);
    setIsConnected(false);
  }, []);

  return {
    address,
    isConnected,
    isLoading,
    network,
    connectWallet,
    disconnectWallet,
  };
}

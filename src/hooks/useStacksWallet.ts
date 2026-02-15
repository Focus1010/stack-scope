'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AppConfig,
  UserSession,
  showConnect,
} from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

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
      if (userSession.isSignInPending()) {
        try {
          setIsLoading(true);

          await userSession.handlePendingSignIn();
          const userData = userSession.loadUserData();

          const stxAddress =
            userData.profile?.stxAddress?.mainnet ||
            userData.profile?.stxAddress?.testnet;

          if (stxAddress) {
            setAddress(stxAddress);
            setIsConnected(true);
          }
        } catch (err) {
          console.error('Auth restore failed:', err);
          userSession.signUserOut();
        } finally {
          setIsLoading(false);
        }
      }

      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();

        const stxAddress =
          userData.profile?.stxAddress?.mainnet ||
            userData.profile?.stxAddress?.testnet;

        if (stxAddress) {
          setAddress(stxAddress);
          setIsConnected(true);
        }
      }
    }

    restoreSession();
  }, []);

  // Connect
  const connectWallet = useCallback(() => {
    setIsLoading(true);

    showConnect({
      userSession,
      appDetails: {
        name: 'StackScope',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: () => {
        const userData = userSession.loadUserData();

        const stxAddress =
          userData.profile?.stxAddress?.mainnet ||
            userData.profile?.stxAddress?.testnet;

        if (stxAddress) {
          setAddress(stxAddress);
          setIsConnected(true);
        }

        setIsLoading(false);
      },
      onCancel: () => {
        setIsLoading(false);
      },
    });
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

'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';

export function WalletButton() {
  const { isConnected, isLoading, connectWallet, disconnectWallet } = useStacksWallet();

  console.log('[WalletButton] State:', { isConnected, isLoading });

  if (isConnected) {
    return (
      <button
        onClick={disconnectWallet}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        Disconnect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

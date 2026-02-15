'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';

export function WalletButton() {
  const { isConnected, address, isLoading, error, connectWallet, disconnectWallet } = useStacksWallet();

  if (isLoading) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
      >
        Connecting...
      </button>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={connectWallet}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Connect Wallet
        </button>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500">Connected</span>
          <span className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  );
}

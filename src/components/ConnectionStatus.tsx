'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';

export function ConnectionStatus() {
  const { isConnected, address, network, isLoading } = useStacksWallet();

  console.log('[ConnectionStatus] State:', { isConnected, address, network, isLoading });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-gray-600">Connecting to wallet...</span>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-gray-600">
          Connected to {network} • {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      <span className="text-gray-600">Not connected</span>
    </div>
  );
}

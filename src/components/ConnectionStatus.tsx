'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';

export function ConnectionStatus() {
  const { isConnected, address, network, isLoading } = useStacksWallet();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-gray-600 text-sm">Connecting...</span>
      </div>
    );
  }

  if (isConnected && address) {
    // Format address as SP25***VFF3 (only 3 asterisks)
    const formattedAddress = address.length > 8 
      ? `${address.slice(0, 4)}***${address.slice(-4)}`
      : address;

    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-gray-900 font-medium text-sm">{formattedAddress}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
      <span className="text-gray-500 text-sm">Not connected</span>
    </div>
  );
}

'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksBalance } from '@/hooks/useStacksBalance';

export function BalanceCard() {
  const { address, network, isConnected } = useStacksWallet();
  const { formattedBalance, isLoading, error, refetch } = useStacksBalance(address, network);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-500">Connect wallet to view balance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">STX Balance</h3>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-20">
          <div className="text-red-500 text-sm mb-2">Error loading balance</div>
          <div className="text-gray-500 text-xs">{error}</div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formattedBalance} STX
          </div>
          <div className="text-sm text-gray-500">
            {network === 'mainnet' ? 'Mainnet' : 'Testnet'} Balance
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksTransactions } from '@/hooks/useStacksTransactions';
import { StacksTransaction } from '@/lib/stacksApi';

export function TransactionHistory() {
  const { address, network, isConnected } = useStacksWallet();
  const { transactions, isLoading, error, refetch, clearCache } = useStacksTransactions(address, network, 20);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return days === 1 ? 'Yesterday' : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? '1h ago' : `${hours}h ago`;
    } else if (minutes > 0) {
      return minutes === 1 ? '1m ago' : `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  // Helper function to format amount
  const formatAmount = (amount: string): string => {
    const microStx = parseInt(amount, 10);
    const stx = microStx / 1_000_000;
    
    if (stx === 0) return '0 STX';
    
    return stx.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' STX';
  };

  // Helper function to get transaction type color
  const getTypeColor = (type: StacksTransaction['type']): string => {
    switch (type) {
      case 'send': return 'text-red-600';
      case 'receive': return 'text-green-600';
      case 'contract': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: StacksTransaction['status']): string => {
    switch (status) {
      case 'success': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  // Helper function to copy transaction ID
  const copyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
    // You could add a toast notification here
  };

  // Helper function to get transaction type label
  const getTypeLabel = (type: StacksTransaction['type']): string => {
    switch (type) {
      case 'send': return 'Sent';
      case 'receive': return 'Received';
      case 'contract': return 'Contract';
      default: return 'Other';
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction History</h3>
          <p className="text-gray-600 text-sm mb-6">Connect your wallet to view transaction history</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Transactions</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent border-r-transparent animate-spin rounded-full"></div>
                <span>Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5.586a2 2 0 0 0 2 2h5.586l-1.293 1.293a1 1 0 0 1-1.414 0l-1.293-1.293H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                </svg>
                <span>Refresh</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : transactions.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="text-gray-500 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
            <p className="text-gray-600 text-sm mb-6">Your transaction history will appear here once you start using your wallet.</p>
            <a
              href="https://explorer.hiro.so/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Explore Stacks Explorer →
            </a>
          </div>
        ) : (
          // Transaction list
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="group hover:bg-gray-50 transition-colors duration-200 p-4 rounded-lg border border border-gray-200 hover:border-gray-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left side: Type and Amount */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(tx.type)}`}></div>
                      <span className={`font-medium ${getTypeColor(tx.type)}`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </div>
                    <div className={`font-semibold ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'send' ? '-' : '+'}
                      {formatAmount(tx.amount)}
                    </div>
                  </div>

                  {/* Right side: Status and Time */}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span>{getStatusIcon(tx.status)}</span>
                      <span className="capitalize text-gray-600">{tx.status}</span>
                    </div>
                    <span className="text-gray-500">{formatTimestamp(tx.timestamp)}</span>
                  </div>
                </div>

                {/* Transaction ID - Desktop only */}
                <div className="hidden sm:flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 font-mono">
                    ID: {tx.id.slice(0, 10)}...{tx.id.slice(-8)}
                  </div>
                  <button
                    onClick={() => copyTransactionId(tx.id)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    title="Copy transaction ID"
                  >
                    Copy ID
                  </button>
                </div>

                {/* Mobile Transaction ID */}
                <div className="sm:hidden mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-mono truncate flex-1">
                      {tx.id.slice(0, 6)}...{tx.id.slice(-4)}
                    </div>
                    <button
                      onClick={() => copyTransactionId(tx.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2 transition-colors"
                      title="Copy transaction ID"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA for first transaction */}
      {transactions.length === 0 && (
        <div className="mt-6 text-center">
          <a
            href="https://www leather.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5.5M12 22l10-5.5M12 2v20" />
            </svg>
            Make Your First Transaction
          </a>
        </div>
      )}
    </div>
  );
}

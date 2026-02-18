'use client';

import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useStacksAnalytics } from '@/hooks/useStacksAnalytics';
import { formatStxBalance } from '@/lib/stacksApi';

export function WalletAnalytics() {
  const { isConnected, address } = useStacksWallet();
  const { analytics, isLoading, error, timeRange, setTimeRange, refetch, clearCache } = useStacksAnalytics(address);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center py-8">
          <div className="text-gray-500 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Analytics</h3>
          <p className="text-gray-600 text-sm mb-6">Connect your wallet to view analytics</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Analytics</h3>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="all">All Time</option>
          </select>
          
          {/* Action Buttons */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5a1 1 0 011-1h2a1 1 0 01-1V4a1 1 0 01-1h2a1 1 0 01-1V4a1 1 0 01-1H5a1 1 0 01-1V4a1 1 0 01-1zm-1 1 0 01-1h2a1 1 0 01-1V4a1 1 0 01-1zm-1 1 0 01-1h2a1 1 0 01-1V4a1 1 0 01-1z" />
                </svg>
                <span>Refresh</span>
              </div>
            )}
          </button>
          
          <button
            onClick={clearCache}
            className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-red-600 text-lg">⚠️</div>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="h-4 bg-gray-200 rounded mb-4 w-20"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Sent */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Total Sent</h4>
                <div className="text-red-600 text-lg font-bold">↓</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatStxBalance(analytics.totalSent)}
              </div>
            </div>

            {/* Total Received */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Total Received</h4>
                <div className="text-green-600 text-lg font-bold">↑</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatStxBalance(analytics.totalReceived)}
              </div>
            </div>

            {/* Net Balance */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Net Balance</h4>
                <div className="text-blue-600 text-lg font-bold">
                  {parseFloat(analytics.netBalance) >= 0 ? '+' : ''}
                  {formatStxBalance(analytics.netBalance)}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatStxBalance(analytics.netBalance)}
              </div>
            </div>

            {/* Transaction Count */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Transactions</h4>
                <div className="text-purple-600 text-lg font-bold">#</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.transactionCount}
              </div>
            </div>

            {/* Total Fees */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-600">Total Fees</h4>
                <div className="text-orange-600 text-lg font-bold">⚡</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatStxBalance(analytics.totalFeesSpent)}
              </div>
            </div>
          </div>

          {/* Time Range Stats */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {timeRange === '7d' ? '7-Day' : timeRange === '30d' ? '30-Day' : 'All Time'} Statistics
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sent Stats */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Sent</div>
                <div className="text-2xl font-bold text-red-600">
                  {timeRange === 'all' ? analytics.totalSent : 
                   timeRange === '7d' ? analytics.sevenDayStats.sent.toString() :
                   analytics.thirtyDayStats.sent.toString()}
                </div>
                <div className="text-sm text-gray-600">
                  {timeRange === 'all' ? 'transactions' : 
                   timeRange === '7d' ? 'transactions' : 'transactions'}
                </div>
              </div>

              {/* Received Stats */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Received</div>
                <div className="text-2xl font-bold text-green-600">
                  {timeRange === 'all' ? analytics.totalReceived : 
                   timeRange === '7d' ? analytics.sevenDayStats.received.toString() :
                   analytics.thirtyDayStats.received.toString()}
                </div>
                <div className="text-sm text-gray-600">
                  {timeRange === 'all' ? 'transactions' : 
                   timeRange === '7d' ? 'transactions' : 'transactions'}
                </div>
              </div>

              {/* Net Change */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Net Change</div>
                <div className={`text-2xl font-bold ${
                  timeRange === 'all' ? 'text-gray-900' :
                  parseFloat(analytics.netBalance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {timeRange === 'all' ? analytics.netBalance : 
                   timeRange === '7d' ? analytics.sevenDayStats.netChange :
                   analytics.thirtyDayStats.netChange}
                </div>
                <div className="text-sm text-gray-600">
                  {timeRange === 'all' ? 'overall' : 
                   timeRange === '7d' ? 'net change' : 'net change'}
                </div>
              </div>
            </div>
          </div>

          {/* Largest Transaction */}
          {analytics.largestTransaction.amount !== '0' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Largest Transaction</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatStxBalance(analytics.largestTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date</span>
                  <span className="text-sm text-gray-900">
                    {new Date(analytics.largestTransaction.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ID</span>
                  <span className="text-sm text-gray-500 font-mono truncate">
                    {analytics.largestTransaction.id.slice(0, 10)}...{analytics.largestTransaction.id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transaction Data</h3>
          <p className="text-gray-600 text-sm">Start making transactions to see your analytics here.</p>
        </div>
      )}
    </div>
  );
}

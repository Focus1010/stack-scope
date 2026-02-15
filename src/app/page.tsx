'use client';

import { WalletButton } from '@/components/WalletButton';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionHistory } from '@/components/TransactionHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">StackScope</h1>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Stacks Portfolio Dashboard
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Track your Stacks blockchain assets, monitor portfolio performance, 
                  and analyze your digital wealth in one comprehensive dashboard.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-blue-600 text-3xl mb-2">📊</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Portfolio Tracking</h3>
                    <p className="text-gray-600 text-sm">Monitor your STX holdings and token performance</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-green-600 text-3xl mb-2">🎨</div>
                    <h3 className="font-semibold text-gray-900 mb-2">NFT Gallery</h3>
                    <p className="text-gray-600 text-sm">View and manage your digital collectibles</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-purple-600 text-3xl mb-2">📈</div>
                    <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                    <p className="text-gray-600 text-sm">Deep insights into your blockchain activity</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <p className="text-gray-500 text-sm">
                    Connect your Leather wallet to get started with your portfolio analysis.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <BalanceCard />
              <TransactionHistory />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2026 StackScope. Built for the Stacks blockchain.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

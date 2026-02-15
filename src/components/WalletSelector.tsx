'use client';

import { useState } from 'react';
import { detectWallets, getWalletInstallUrl } from '@/lib/walletDetection';

interface WalletSelectorProps {
  onConnect: (walletName: string) => void;
  onClose: () => void;
}

export function WalletSelector({ onConnect, onClose }: WalletSelectorProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const wallets = detectWallets();

  const handleWalletClick = (walletName: string) => {
    setSelectedWallet(walletName);
    onConnect(walletName);
    onClose();
  };

  const handleInstallClick = (walletName: string) => {
    const installUrl = getWalletInstallUrl(walletName);
    window.open(installUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div key={wallet.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <h4 className="font-medium">{wallet.name}</h4>
                    <p className="text-sm text-gray-500">
                      {wallet.isInstalled ? 'Installed' : 'Not installed'}
                    </p>
                  </div>
                </div>
                
                {wallet.isInstalled ? (
                  <button
                    onClick={() => handleWalletClick(wallet.name)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstallClick(wallet.name)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Install
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Don't have a wallet?{' '}
          <a
            href="https://www.stacks.co/wallets"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View all wallets
          </a>
        </div>
      </div>
    </div>
  );
}

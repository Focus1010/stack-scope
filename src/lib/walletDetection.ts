export interface WalletInfo {
  name: string;
  isInstalled: boolean;
  icon: string;
  description: string;
  installUrl: string;
}

export function detectWallets(): WalletInfo[] {
  const wallets: WalletInfo[] = [
    {
      name: 'Leather',
      isInstalled: typeof window !== 'undefined' && !!(window as any).LeatherProvider,
      icon: '🦊',
      description: 'Popular Stacks wallet',
      installUrl: 'https://leather.io/install',
    },
    {
      name: 'Xverse',
      isInstalled: typeof window !== 'undefined' && !!(window as any).XverseProviders,
      icon: '⚡',
      description: 'Mobile and desktop wallet',
      installUrl: 'https://www.xverse.app/download',
    },
    {
      name: 'Hiro',
      isInstalled: typeof window !== 'undefined' && !!(window as any).HiroWalletProvider,
      icon: '🗾',
      description: 'Legacy Stacks wallet',
      installUrl: 'https://hiro.so/wallet/install',
    },
  ];

  return wallets;
}

export function getFirstAvailableWallet(): WalletInfo | null {
  const wallets = detectWallets();
  return wallets.find(wallet => wallet.isInstalled) || null;
}

export function getWalletInstallUrl(walletName: string): string {
  const wallets = detectWallets();
  const wallet = wallets.find(w => w.name === walletName);
  return wallet?.installUrl || 'https://www.stacks.co/wallets';
}

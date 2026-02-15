import { WalletProvider, XverseProviders } from '@/types/window';

export interface WalletInfo {
  name: string;
  provider: WalletProvider | null;
  isInstalled: boolean;
  icon: string;
}

export function detectWallets(): WalletInfo[] {
  const wallets: WalletInfo[] = [
    {
      name: 'Leather',
      provider: typeof window !== 'undefined' ? window.LeatherProvider || null : null,
      isInstalled: typeof window !== 'undefined' ? !!window.LeatherProvider : false,
      icon: '🦊',
    },
    {
      name: 'Xverse',
      provider: typeof window !== 'undefined' ? window.XverseProviders?.StacksProvider || null : null,
      isInstalled: typeof window !== 'undefined' ? !!window.XverseProviders : false,
      icon: '⚡',
    },
    {
      name: 'Hiro',
      provider: typeof window !== 'undefined' ? window.HiroWalletProvider || null : null,
      isInstalled: typeof window !== 'undefined' ? !!window.HiroWalletProvider : false,
      icon: '🗾',
    },
  ];

  return wallets;
}

export function getFirstAvailableWallet(): WalletInfo | null {
  const wallets = detectWallets();
  return wallets.find(wallet => wallet.isInstalled) || null;
}

export function getWalletInstallUrl(walletName: string): string {
  const installUrls: Record<string, string> = {
    'Leather': 'https://leather.io/install',
    'Xverse': 'https://www.xverse.app/download',
    'Hiro': 'https://hiro.so/wallet/install',
  };
  
  return installUrls[walletName] || 'https://www.stacks.co/wallets';
}

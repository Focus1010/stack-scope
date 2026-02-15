export interface StacksWalletState {
  isConnected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';
  isLoading: boolean;
  error: string | null;
}

export interface WalletConnectOptions {
  appDetails: {
    name: string;
    icon: string;
    description?: string;
  };
  network?: 'mainnet' | 'testnet';
  onFinish?: (payload: any) => void;
  onCancel?: () => void;
}

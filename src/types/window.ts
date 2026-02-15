export interface WalletProvider {
  request: (args: { method: string; params?: any }) => Promise<any>;
}

export interface XverseProviders {
  StacksProvider: WalletProvider;
}

declare global {
  interface Window {
    LeatherProvider?: WalletProvider;
    XverseProviders?: XverseProviders;
    HiroWalletProvider?: WalletProvider;
  }
}

export {};

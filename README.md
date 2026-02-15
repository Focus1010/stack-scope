# StackScope - Stacks Portfolio Dashboard

A production-ready starter project for building a Stacks blockchain portfolio dashboard with Next.js, TypeScript, and Leather wallet integration.

## Features

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS** for modern, responsive styling
- **Leather Wallet** integration for Stacks blockchain
- **Real-time Balance Display** - Fetch and display STX balance from Stacks API
- **Clean Architecture** with reusable components and hooks
- **Production Ready** with ESLint, Prettier, and TypeScript
- **Responsive Design** optimized for desktop and mobile
- **Comprehensive Testing** with Vitest and API test coverage

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Stacks (Clarity smart contracts ready)
- **Wallet**: Leather (formerly Hiro) wallet integration
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Leather wallet browser extension

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Focus1010/stack-scope.git
   cd stack-scope
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Stacks Network Configuration
   NEXT_PUBLIC_STACKS_NETWORK=mainnet
   NEXT_PUBLIC_STACKS_API_URL=https://api.mainnet.hiro.so

   # App Configuration
   NEXT_PUBLIC_APP_NAME=StackScope
   NEXT_PUBLIC_APP_ICON=/icon.png
   NEXT_PUBLIC_APP_DESCRIPTION=Stacks blockchain portfolio dashboard
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
stackscope/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   │   ├── WalletButton.tsx
│   │   ├── ConnectionStatus.tsx
│   │   └── WalletSelector.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useStacksWallet.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── stacks.ts
│   │   └── window.ts
│   ├── lib/                # Utility functions
│   │   └── walletDetection.ts
│   └── styles/             # Global styles
├── public/                 # Static assets
├── .env.example           # Environment variables template
└── README.md
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Run tests with UI interface

## Leather Wallet Integration

The app integrates with Leather wallet for Stacks blockchain interaction:

1. **Connect Wallet**: Click "Connect Wallet" to authenticate
2. **View Address**: See your connected Stacks address (formatted as SP25***VFF3)
3. **Connection Status**: Real-time connection status with green/gray indicators
4. **Balance Display**: View your STX balance fetched from Stacks API
5. **Disconnect**: Safely disconnect your wallet

## Balance Fetching

StackScope fetches and displays your STX balance in real-time:

- **API Integration**: Uses Stacks public API (mainnet/testnet)
- **Caching**: 30-second cache to reduce API calls
- **Error Handling**: Graceful error states with retry functionality
- **Formatting**: Proper number formatting (e.g., 1,234.57 STX)
- **Real-time Updates**: Balance updates when wallet connects/disconnects

### Balance Features

- **Automatic Fetching**: Balance loads when wallet connects
- **Manual Refresh**: Click "Refresh" button to update balance
- **Loading States**: Skeleton loaders during API calls
- **Error Display**: Clear error messages if API fails
- **Network Support**: Works with both mainnet and testnet

## Multi-Wallet Support

The application supports multiple Stacks wallets:

- **Leather**: Primary wallet with full feature support
- **Xverse**: Mobile and desktop wallet compatibility
- **Hiro**: Legacy wallet support

The app automatically detects available wallets and provides a seamless connection experience.

## Network Configuration

By default, the app connects to the Stacks mainnet. You can change this in your environment variables:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet  # For testnet
NEXT_PUBLIC_STACKS_NETWORK=mainnet  # For mainnet (default)
```

## Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Future Features

This foundation is ready for expansion:

- **Portfolio Tracking**: STX holdings and token performance
- **NFT Gallery**: Digital collectibles management
- **Analytics**: Blockchain activity insights
- **DeFi Integration**: Stacking and liquidity pools
- **Transaction History**: Detailed transaction logs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Useful Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Leather Wallet](https://leather.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

## Troubleshooting

### Wallet Connection Issues

**Problem: "Connecting..." state persists after wallet approval**
- **Solution**: The app uses URL-based authentication. After approving in your wallet, the page will reload and automatically detect the authentication state.

**Problem: Wallet popup doesn't appear**
- **Solution**: Ensure you have Leather, Xverse, or Hiro wallet installed and enabled in your browser.

**Problem: Connection lost on page refresh**
- **Solution**: The app automatically restores sessions on load. Check browser console for authentication errors.

**Problem: Console shows authentication errors**
- **Solution**: Clear browser storage and try reconnecting. Check that your wallet is unlocked.

### Debug Mode

Enable debug logging to trace connection issues:
- Open browser console (F12)
- Look for `[StacksWallet]` prefixed logs
- These logs show authentication flow details

### Common Issues

1. **Extension Not Installed**: Install Leather wallet from [leather.io](https://leather.io)
2. **Wrong Network**: Ensure wallet is on the same network as the app (mainnet/testnet)
3. **Browser Issues**: Try refreshing the page or clearing cache
4. **Permission Denied**: Grant the app permission to access your wallet

### Getting Help

If you encounter issues:
1. Check browser console for error messages
2. Ensure your wallet is unlocked and on the correct network
3. Try disconnecting and reconnecting
4. Open an issue on GitHub with console logs

## Support

If you have any questions or need help, please open an issue on GitHub.

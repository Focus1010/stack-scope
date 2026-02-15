# StackScope - Stacks Portfolio Dashboard

A production-ready starter project for building a Stacks blockchain portfolio dashboard with Next.js, TypeScript, and Leather wallet integration.

## 🚀 Features

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS** for modern, responsive styling
- **Leather Wallet** integration for Stacks blockchain
- **Clean Architecture** with reusable components and hooks
- **Production Ready** with ESLint, Prettier, and TypeScript
- **Responsive Design** optimized for desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Stacks (Clarity smart contracts ready)
- **Wallet**: Leather (formerly Hiro) wallet integration
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Leather wallet browser extension

## 🚀 Getting Started

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

## 📁 Project Structure

```
stackscope/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   │   ├── WalletButton.tsx
│   │   └── ConnectionStatus.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useStacksWallet.ts
│   ├── types/              # TypeScript type definitions
│   │   └── stacks.ts
│   └── styles/             # Global styles
├── public/                 # Static assets
├── .env.example           # Environment variables template
└── README.md
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## 🦊 Leather Wallet Integration

The app integrates with Leather wallet for Stacks blockchain interaction:

1. **Connect Wallet**: Click "Connect Wallet" to authenticate
2. **View Address**: See your connected Stacks address
3. **Connection Status**: Real-time connection status indicator
4. **Disconnect**: Safely disconnect your wallet

## 🌐 Network Configuration

By default, the app connects to the Stacks mainnet. You can change this in your environment variables:

```env
NEXT_PUBLIC_STACKS_NETWORK=testnet  # For testnet
NEXT_PUBLIC_STACKS_NETWORK=mainnet  # For mainnet (default)
```

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔮 Future Features

This foundation is ready for expansion:

- **Portfolio Tracking**: STX holdings and token performance
- **NFT Gallery**: Digital collectibles management
- **Analytics**: Blockchain activity insights
- **DeFi Integration**: Stacking and liquidity pools
- **Transaction History**: Detailed transaction logs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Leather Wallet](https://leather.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

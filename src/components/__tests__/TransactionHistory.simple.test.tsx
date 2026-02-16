import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionHistory } from '../TransactionHistory';

describe('TransactionHistory Component - Simple Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    // Mock the hooks to avoid import issues
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: [
          {
            id: '0x1234567890abcdef',
            type: 'send' as const,
            amount: '1000000',
            timestamp: Date.now() - 3600000,
            status: 'success' as const,
            from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
            to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
            fee: '1000',
            memo: 'Test transaction',
            block_height: 1000,
            tx_type: 'token_transfer',
          },
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<TransactionHistory />);
    
    // Basic render test - should not crash
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('should show transaction type and amount', () => {
    // Mock the hooks
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: [
          {
            id: '0x1234567890abcdef',
            type: 'send' as const,
            amount: '1000000',
            timestamp: Date.now() - 3600000,
            status: 'success' as const,
            from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
            to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
            fee: '1000',
            memo: 'Test transaction',
            block_height: 1000,
            tx_type: 'token_transfer',
          },
        ],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<TransactionHistory />);
    
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('1,000.00 STX')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    // Mock loading state
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<TransactionHistory />);
    
    expect(screen.getByText('Refreshing...')).toBeInTheDocument();
  });

  it('should show empty state when no transactions', () => {
    // Mock empty transactions
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<TransactionHistory />);
    
    expect(screen.getByText('No Transactions Yet')).toBeInTheDocument();
  });
});

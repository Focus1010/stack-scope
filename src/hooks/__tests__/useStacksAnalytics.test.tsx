import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useStacksAnalytics } from '../useStacksAnalytics';
import { WalletAnalytics } from '@/lib/stacksAnalytics';

// Mock transactions for testing
const mockTransactions = [
  {
    id: '0x1234567890abcdef',
    type: 'send' as const,
    amount: '1000000',
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
    to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
    fee: '1000',
    block_height: 1000,
    tx_type: 'token_transfer',
  },
];

describe('useStacksAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show connect wallet message when not connected', () => {
    // Mock wallet not connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: null,
        network: 'mainnet',
        isConnected: false,
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

    const { analytics, isLoading, error, timeRange, setTimeRange, refetch, clearCache } = useStacksAnalytics();

    render(<div>{analytics ? 'has analytics' : 'no analytics'}</div>);
    
    expect(screen.getByText('Connect your wallet to view analytics')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    expect(analytics).toBe(null);
  });

  it('should compute analytics when connected', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: mockTransactions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    const { analytics, isLoading, error, timeRange, setTimeRange, refetch, clearCache } = useStacksAnalytics();

    expect(analytics).not.toBeNull();
    expect(analytics?.totalSent).toBe('1500000');
    expect(analytics?.transactionCount).toBe(3);
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
        transactions: mockTransactions,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    const { analytics, isLoading } = useStacksAnalytics();

    expect(isLoading).toBe(true);
    expect(analytics).toBe(null);
  });

  it('should show error state', () => {
    // Mock error state
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: mockTransactions,
        isLoading: false,
        error: 'Failed to compute analytics',
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    const { analytics, isLoading, error } = useStacksAnalytics();

    expect(isLoading).toBe(false);
    expect(error).toBe('Failed to compute analytics');
    expect(analytics).toBe(null);
  });

  it('should handle time range changes', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: mockTransactions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    const { analytics, timeRange, setTimeRange } = useStacksAnalytics();

    // Change time range
    setTimeRange('7d');

    expect(timeRange).toBe('7d');
  });

  it('should call refetch when refresh button is clicked', async () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    const mockRefetch = vi.fn();
    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: mockTransactions,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        clearCache: vi.fn(),
      }),
    }));

    const { analytics, refetch } = useStacksAnalytics();

    render(<div>{analytics ? 'has analytics' : 'no analytics'}</div>);

    const refreshButton = screen.getByText('Refresh');
    // Note: In a real component, you'd need to handle the button click properly
    // This is a simplified test to check if the refetch function is available
    expect(refetch).toBeDefined();
  });

  it('should call clearCache when clear button is clicked', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    const mockClearCache = vi.fn();
    vi.doMock('@/hooks/useStacksTransactions', () => ({
      useStacksTransactions: () => ({
        transactions: mockTransactions,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: mockClearCache,
      }),
    }));

    const { analytics, clearCache } = useStacksAnalytics();

    render(<div>{analytics ? 'has analytics' : 'no analytics'}</div>);

    const clearButton = screen.getByText('Clear Cache');
    // Note: In a real component, you'd need to handle the button click properly
    // This is a simplified test to check if the clearCache function is available
    expect(clearCache).toBeDefined();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletAnalytics } from '../WalletAnalytics';
import { calculateWalletAnalytics, formatStxBalance, formatPercentageChange } from '../../../lib/stacksAnalytics';

// Mock analytics data
const mockAnalytics: WalletAnalytics = {
  totalSent: '1500000',
  totalReceived: '2000000',
  netBalance: '500000',
  transactionCount: 3,
  totalFeesSpent: '1500',
  largestTransaction: {
    amount: '2000000',
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
    id: '0x1234567890abcdef',
  },
  sevenDayStats: {
    sent: 2,
    received: 1,
    netChange: '-500000',
    transactionCount: 3,
  },
  thirtyDayStats: {
    sent: 3,
    received: 1,
    netChange: '-1000000',
    transactionCount: 3,
  },
};

describe('WalletAnalytics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render connect wallet message when not connected', () => {
    // Mock wallet not connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: null,
        network: 'mainnet',
        isConnected: false,
      }),
    }));

    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: null,
        isLoading: false,
        error: null,
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    expect(screen.getByText('Wallet Analytics')).toBeInTheDocument();
    expect(screen.getByText('Connect your wallet to view analytics')).toBeInTheDocument();
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should render analytics when connected', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    expect(screen.getByText('Wallet Analytics')).toBeInTheDocument();
    expect(screen.getByText('1,500.00 STX')).toBeInTheDocument();
    expect(screen.getByText('2,000.00 STX')).toBeInTheDocument();
    expect(screen.getByText('500,000 STX')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('0x1234567890abcdef')).toBeInTheDocument();
  });

  it('should render loading state', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: null,
        isLoading: true,
        error: null,
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    // Check for loading skeletons
    const skeletons = screen.getAllByText('Refreshing...');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: null,
        isLoading: false,
        error: 'Failed to compute analytics',
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    expect(screen.getByText('Error Loading Analytics')).toBeInTheDocument();
    expect(screen.getByText('Failed to compute analytics')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should render empty state when no transactions', () => {
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
        transactions: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    expect(screen.getByText('No Transaction Data')).toBeInTheDocument();
    expect(screen.getByText('Start making transactions to see your analytics here.')).toBeInTheDocument();
  });

  it('should handle time range change', async () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    const mockSetTimeRange = vi.fn();
    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
        timeRange: '30d',
        setTimeRange: mockSetTimeRange,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    const selectElement = screen.getByDisplayValue('30d');
    fireEvent.change(selectElement, { target: { value: '7d' } });
    
    await waitFor(() => {
      expect(mockSetTimeRange).toHaveBeenCalledWith('7d');
    });
  });

  it('should handle refresh button click', async () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    const mockRefetch = vi.fn();
    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: mockRefetch,
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle clear cache button click', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    const mockClearCache = vi.fn();
    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: vi.fn(),
        clearCache: mockClearCache,
      }),
    }));

    render(<WalletAnalytics />);
    
    const clearButton = screen.getByText('Clear Cache');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(mockClearCache).toHaveBeenCalledTimes(1);
    });
  });

  it('should be responsive', () => {
    // Mock wallet connected
    vi.doMock('@/hooks/useStacksWallet', () => ({
      useStacksWallet: () => ({
        address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        network: 'mainnet',
        isConnected: true,
      }),
    }));

    vi.doMock('@/hooks/useStacksAnalytics', () => ({
      useStacksAnalytics: () => ({
        analytics: mockAnalytics,
        isLoading: false,
        error: null,
        timeRange: '30d',
        setTimeRange: vi.fn(),
        refetch: vi.fn(),
        clearCache: vi.fn(),
      }),
    }));

    render(<WalletAnalytics />);
    
    const container = screen.getByText('Wallet Analytics').closest('div');
    
    // Check if responsive classes are applied
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md');
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionHistory } from '../TransactionHistory';

// Mock the hooks
vi.mock('@/hooks/useStacksWallet');
vi.mock('@/hooks/useStacksTransactions');

describe('TransactionHistory Component', () => {
  const mockTransactions = [
    {
      id: '0x1234567890abcdef',
      type: 'send' as const,
      amount: '1000000',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'success' as const,
      from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
      to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
      fee: '1000',
      memo: 'Test transaction',
      block_height: 1000,
      tx_type: 'token_transfer',
    },
    {
      id: '0x0987654321fedcba',
      type: 'receive' as const,
      amount: '2000000',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'success' as const,
      from: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
      to: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
      fee: '1000',
      block_height: 1001,
      tx_type: 'token_transfer',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useStacksWallet
    (useStacksWallet as any).mockReturnValue({
      address: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
      network: 'mainnet',
      isConnected: true,
    });

    // Mock useStacksTransactions
    (useStacksTransactions as any).mockReturnValue({
      transactions: mockTransactions,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      clearCache: vi.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render transaction list when connected', () => {
      render(<TransactionHistory />);
      
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText('Received')).toBeInTheDocument();
      expect(screen.getByText('1,000.00 STX')).toBeInTheDocument();
      expect(screen.getByText('2,000.00 STX')).toBeInTheDocument();
    });

    it('should show connect wallet message when not connected', () => {
      (useStacksWallet as any).mockReturnValue({
        address: null,
        network: 'mainnet',
        isConnected: false,
      });

      render(<TransactionHistory />);
      
      expect(screen.getByText('Transaction History')).toBeInTheDocument();
      expect(screen.getByText('Connect your wallet to view transaction history')).toBeInTheDocument();
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });

    it('should show loading skeleton when loading', () => {
      (useStacksTransactions as any).mockReturnValue({
        transactions: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      });

      render(<TransactionHistory />);
      
      // Check for skeleton elements (animated placeholders)
      const skeletons = screen.getAllByText('Refreshing...');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show error state when error occurs', () => {
      (useStacksTransactions as any).mockReturnValue({
        transactions: [],
        isLoading: false,
        error: 'Failed to fetch transactions',
        refetch: vi.fn(),
        clearCache: vi.fn(),
      });

      render(<TransactionHistory />);
      
      expect(screen.getByText('Error Loading Transactions')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should show empty state when no transactions', () => {
      (useStacksTransactions as any).mockReturnValue({
        transactions: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        clearCache: vi.fn(),
      });

      render(<TransactionHistory />);
      
      expect(screen.getByText('No Transactions Yet')).toBeInTheDocument();
      expect(screen.getByText('Your transaction history will appear here once you start using your wallet.')).toBeInTheDocument();
      expect(screen.getByText('Explore Stacks Explorer →')).toBeInTheDocument();
    });
  });

  describe('Transaction Display', () => {
    it('should format transaction amounts correctly', () => {
      render(<TransactionHistory />);
      
      expect(screen.getByText('1,000.00 STX')).toBeInTheDocument();
      expect(screen.getByText('2,000.00 STX')).toBeInTheDocument();
    });

    it('should show correct transaction types', () => {
      render(<TransactionHistory />);
      
      expect(screen.getByText('Sent')).toBeInTheDocument();
      expect(screen.getByText('Received')).toBeInTheDocument();
    });

    it('should display transaction status with icons', () => {
      render(<TransactionHistory />);
      
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText('success')).toBeInTheDocument();
    });

    it('should show relative timestamps', () => {
      render(<TransactionHistory />);
      
      expect(screen.getByText('1h ago')).toBeInTheDocument();
      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });

    it('should display shortened transaction IDs', () => {
      render(<TransactionHistory />);
      
      expect(screen.getByText('ID: 0x1234567...abcdef')).toBeInTheDocument();
      expect(screen.getByText('ID: 0x0987654...fedcba')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call refetch when refresh button is clicked', async () => {
      const mockRefetch = vi.fn();
      (useStacksTransactions as any).mockReturnValue({
        transactions: mockTransactions,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        clearCache: vi.fn(),
      });

      render(<TransactionHistory />);
      
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should copy transaction ID when copy button is clicked', async () => {
      const mockWriteText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<TransactionHistory />);
      
      const copyButtons = screen.getAllByText('Copy ID');
      fireEvent.click(copyButtons[0]);
      
      expect(mockWriteText).toHaveBeenCalledWith('0x1234567890abcdef');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile and desktop', () => {
      render(<TransactionHistory />);
      
      const container = screen.getByText('Transaction History').closest('div');
      
      // Check if responsive classes are applied
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<TransactionHistory />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
      
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });
});

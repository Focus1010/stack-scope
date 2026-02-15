import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchWalletTransactions, clearTransactionCache, StacksTransaction } from '../stacksApi';

// Mock fetch
global.fetch = vi.fn();

describe('Stacks Transactions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTransactionCache();
  });

  describe('fetchWalletTransactions', () => {
    const mockAddress = 'SP1234567890abcdefghijklmnopqrstuvwxyz';
    const mockTransactionResponse = {
      total: 1,
      results: [
        {
          tx_id: '0x1234567890abcdef',
          tx_type: 'token_transfer',
          tx_status: 'success',
          block_height: 1000,
          block_time: 1640995200, // 2022-01-01
          fee_rate: '1000',
          sender_address: mockAddress,
          recipient_address: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
          amount: '1000000', // 1 STX in microSTX
          memo: 'Test transaction',
        },
      ],
    };

    it('should fetch transactions successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactionResponse,
      });

      const result = await fetchWalletTransactions(mockAddress);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.mainnet.hiro.so/extended/v1/address/SP1234567890abcdefghijklmnopqrstuvwxyz/transactions?limit=20&order=desc'
      );
      expect(result).toHaveLength(1);
      
      const transaction = result[0];
      expect(transaction.id).toBe('0x1234567890abcdef');
      expect(transaction.type).toBe('send'); // User is sender
      expect(transaction.amount).toBe('1000000');
      expect(transaction.status).toBe('success');
      expect(transaction.from).toBe(mockAddress);
      expect(transaction.to).toBe('SP0987654321zyxwvutsrqponmlkjihgfedcba');
      expect(transaction.fee).toBe('1000');
      expect(transaction.memo).toBe('Test transaction');
      expect(transaction.block_height).toBe(1000);
      expect(transaction.tx_type).toBe('token_transfer');
    });

    it('should identify receive transactions correctly', async () => {
      const receiveResponse = {
        total: 1,
        results: [
          {
            tx_id: '0x1234567890abcdef',
            tx_type: 'token_transfer',
            tx_status: 'success',
            block_height: 1000,
            block_time: 1640995200,
            fee_rate: '1000',
            sender_address: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
            recipient_address: mockAddress,
            amount: '1000000',
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => receiveResponse,
      });

      const result = await fetchWalletTransactions(mockAddress);
      
      expect(result[0].type).toBe('receive'); // User is recipient
    });

    it('should handle contract transactions', async () => {
      const contractResponse = {
        total: 1,
        results: [
          {
            tx_id: '0x1234567890abcdef',
            tx_type: 'smart_contract',
            tx_status: 'success',
            block_height: 1000,
            block_time: 1640995200,
            fee_rate: '1000',
            sender_address: mockAddress,
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => contractResponse,
      });

      const result = await fetchWalletTransactions(mockAddress);
      
      expect(result[0].type).toBe('contract');
      expect(result[0].amount).toBe('0'); // No amount for contract calls
    });

    it('should use testnet URL for testnet network', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactionResponse,
      });

      await fetchWalletTransactions(mockAddress, 'testnet');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.testnet.hiro.so/extended/v1/address/SP1234567890abcdefghijklmnopqrstuvwxyz/transactions?limit=20&order=desc'
      );
    });

    it('should use custom limit parameter', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactionResponse,
      });

      await fetchWalletTransactions(mockAddress, 'mainnet', 10);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.mainnet.hiro.so/extended/v1/address/SP1234567890abcdefghijklmnopqrstuvwxyz/transactions?limit=10&order=desc'
      );
    });

    it('should handle API errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchWalletTransactions(mockAddress)).rejects.toThrow('Failed to fetch transactions: API request failed: 404 Not Found');
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchWalletTransactions(mockAddress)).rejects.toThrow('Failed to fetch transactions: Network error');
    });

    it('should handle empty wallet (no transactions)', async () => {
      const emptyResponse = {
        total: 0,
        results: [],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyResponse,
      });

      const result = await fetchWalletTransactions(mockAddress);

      expect(result).toHaveLength(0);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should cache results', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTransactionResponse,
      });

      // First call
      await fetchWalletTransactions(mockAddress);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await fetchWalletTransactions(mockAddress);
      expect(fetch).toHaveBeenCalledTimes(1); // Should not call fetch again
    });

    it('should handle different transaction statuses', async () => {
      const statusResponse = {
        total: 3,
        results: [
          {
            tx_id: '0x1111111111111111',
            tx_type: 'token_transfer',
            tx_status: 'success',
            block_height: 1000,
            block_time: 1640995200,
            fee_rate: '1000',
            sender_address: mockAddress,
            recipient_address: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
            amount: '1000000',
          },
          {
            tx_id: '0x2222222222222222',
            tx_type: 'token_transfer',
            tx_status: 'pending',
            block_height: undefined,
            block_time: undefined,
            fee_rate: '1000',
            sender_address: mockAddress,
            recipient_address: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
            amount: '2000000',
          },
          {
            tx_id: '0x3333333333333333',
            tx_type: 'token_transfer',
            tx_status: 'failed',
            block_height: undefined,
            block_time: undefined,
            fee_rate: '1000',
            sender_address: mockAddress,
            recipient_address: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
            amount: '3000000',
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => statusResponse,
      });

      const result = await fetchWalletTransactions(mockAddress);

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('success');
      expect(result[1].status).toBe('pending');
      expect(result[2].status).toBe('failed');
    });

    it('should handle transactions with operations', async () => {
      const operationsResponse = {
        total: 1,
        results: [
          {
            tx_id: '0x1234567890abcdef',
            tx_type: 'contract_call',
            tx_status: 'success',
            block_height: 1000,
            block_time: 1640995200,
            fee_rate: '1000',
            sender_address: mockAddress,
            operations: [
              {
                type: 'stx_transfer',
                address: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
                amount: '5000000',
              },
            ],
          },
        ],
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => operationsResponse,
      });

      const result = await fetchWalletTransactions(mockAddress);

      expect(result[0].type).toBe('other'); // Not token_transfer or smart_contract
      expect(result[0].amount).toBe('5000000'); // Extracted from operations
    });
  });

  describe('clearTransactionCache', () => {
    it('should clear the cache', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, results: [] }),
      });

      // First call to populate cache
      await fetchWalletTransactions('test-address');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearTransactionCache();

      // Mock fetch again for the second call
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, results: [] }),
      });

      // Second call should fetch again
      await fetchWalletTransactions('test-address');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchAccountBalance, formatStxBalance, clearBalanceCache } from '../stacksApi';

// Mock fetch
global.fetch = vi.fn();

describe('Stacks API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearBalanceCache();
  });

  describe('formatStxBalance', () => {
    it('should format zero balance correctly', () => {
      expect(formatStxBalance('0')).toBe('0');
    });

    it('should format small balances correctly', () => {
      expect(formatStxBalance('1000')).toBe('0.001'); // 0.001 STX
      expect(formatStxBalance('500')).toBe('<0.001'); // 0.0005 STX
    });

    it('should format medium balances correctly', () => {
      expect(formatStxBalance('1000000')).toBe('1.00'); // 1 STX
      expect(formatStxBalance('2500000')).toBe('2.50'); // 2.5 STX
      expect(formatStxBalance('1234567')).toBe('1.23'); // 1.23 STX
    });

    it('should format large balances correctly', () => {
      expect(formatStxBalance('1000000000')).toBe('1,000'); // 1000 STX
      expect(formatStxBalance('1234567890')).toBe('1,234.57'); // 1234.57 STX
    });
  });

  describe('fetchAccountBalance', () => {
    const mockAddress = 'SP1234567890abcdefghijklmnopqrstuvwxyz';
    const mockApiResponse = {
      stx_balance: '1000000',
      total_sent: '500000',
      total_received: '1500000',
      total_fees_spent: '10000',
      lock_height: null,
      fungible_tokens: {},
      non_fungible_tokens: {},
    };

    it('should fetch balance successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      const result = await fetchAccountBalance(mockAddress);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.mainnet.hiro.so/extended/v1/address/SP1234567890abcdefghijklmnopqrstuvwxyz/balances'
      );
      expect(result.stx.balance).toBe('1000000');
      expect(result.stx.total_sent).toBe('500000');
    });

    it('should use testnet URL for testnet network', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      await fetchAccountBalance(mockAddress, 'testnet');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.testnet.hiro.so/extended/v1/address/SP1234567890abcdefghijklmnopqrstuvwxyz/balances'
      );
    });

    it('should handle API errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(fetchAccountBalance(mockAddress)).rejects.toThrow('Failed to fetch balance: API request failed: 404 Not Found');
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchAccountBalance(mockAddress)).rejects.toThrow('Failed to fetch balance: Network error');
    });

    it('should cache results', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      });

      // First call
      await fetchAccountBalance(mockAddress);
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await fetchAccountBalance(mockAddress);
      expect(fetch).toHaveBeenCalledTimes(1); // Should not call fetch again
    });

    it('should handle missing API fields gracefully', async () => {
      const incompleteResponse = {
        stx_balance: '1000000',
        // Missing other fields
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteResponse,
      });

      const result = await fetchAccountBalance(mockAddress);

      expect(result.stx.balance).toBe('1000000');
      expect(result.stx.total_sent).toBe('0'); // Should default to 0
      expect(result.stx.total_received).toBe('0'); // Should default to 0
    });
  });

  describe('clearBalanceCache', () => {
    it('should clear the cache', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stx_balance: '1000000' }),
      });

      // First call to populate cache
      await fetchAccountBalance('test-address');
      expect(fetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearBalanceCache();

      // Mock fetch again for the second call
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ stx_balance: '1000000' }),
      });

      // Second call should fetch again
      await fetchAccountBalance('test-address');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});

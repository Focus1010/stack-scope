import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletAnalytics } from '../WalletAnalytics';
import { calculateWalletAnalytics, formatStxBalance, formatPercentageChange } from '../../lib/stacksAnalytics';

// Mock transactions for testing
const mockTransactions = [
  {
    id: '0x1234567890abcdef',
    type: 'send' as const,
    amount: '1000000', // 1 STX
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: 'success' as const,
    from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
    to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
    fee: '1000',
    block_height: 1000,
    tx_type: 'token_transfer',
  },
  {
    id: '0x0987654321fedcba',
    type: 'receive' as const,
    amount: '2000000', // 2 STX
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'success' as const,
    from: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
    to: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
    fee: '1000',
    block_height: 1001,
    tx_type: 'token_transfer',
  },
  {
    id: '0x1111111111111111',
    type: 'send' as const,
    amount: '500000', // 0.5 STX
    timestamp: Date.now() - (15 * 24 * 60 * 60 * 1000), // 15 days ago
    status: 'success' as const,
    from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
    to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
    fee: '500',
    block_height: 1002,
    tx_type: 'token_transfer',
  },
];

describe('Stacks Analytics', () => {
  describe('calculateWalletAnalytics', () => {
    it('should handle empty transactions', () => {
      const result = calculateWalletAnalytics([]);
      
      expect(result.totalSent).toBe('0');
      expect(result.totalReceived).toBe('0');
      expect(result.netBalance).toBe('0');
      expect(result.transactionCount).toBe(0);
      expect(result.totalFeesSpent).toBe('0');
      expect(result.largestTransaction.amount).toBe('0');
      expect(result.sevenDayStats.sent).toBe(0);
      expect(result.sevenDayStats.received).toBe(0);
      expect(result.sevenDayStats.netChange).toBe('0');
      expect(result.sevenDayStats.transactionCount).toBe(0);
      expect(result.thirtyDayStats.sent).toBe(0);
      expect(result.thirtyDayStats.received).toBe(0);
      expect(result.thirtyDayStats.netChange).toBe('0');
      expect(result.thirtyDayStats.transactionCount).toBe(0);
    });

    it('should calculate totals correctly', () => {
      const result = calculateWalletAnalytics(mockTransactions);
      
      expect(result.totalSent).toBe('1500000'); // 1.5 STX sent
      expect(result.totalReceived).toBe('2000000'); // 2 STX received
      expect(result.netBalance).toBe('500000'); // 0.5 STX net
      expect(result.transactionCount).toBe(3);
      expect(result.totalFeesSpent).toBe('1500'); // Total fees
    });

    it('should find largest transaction correctly', () => {
      const result = calculateWalletAnalytics(mockTransactions);
      
      expect(result.largestTransaction.amount).toBe('2000000'); // 2 STX (largest)
      expect(result.largestTransaction.id).toBe('0x1234567890abcdef');
      expect(result.largestTransaction.timestamp).toBeGreaterThan(0);
    });

    it('should calculate 7-day stats correctly', () => {
      const result = calculateWalletAnalytics(mockTransactions);
      
      expect(result.sevenDayStats.sent).toBe(2); // 2 send transactions in 7 days
      expect(result.sevenDayStats.received).toBe(1); // 1 receive transaction in 7 days
      expect(result.sevenDayStats.netChange).toBe('-500000'); // Net loss of 0.5 STX
      expect(result.sevenDayStats.transactionCount).toBe(3); // 3 transactions in 7 days
    });

    it('should calculate 30-day stats correctly', () => {
      const result = calculateWalletAnalytics(mockTransactions);
      
      expect(result.thirtyDayStats.sent).toBe(3); // 3 send transactions in 30 days
      expect(result.thirtyDayStats.received).toBe(1); // 1 receive transaction in 30 days
      expect(result.thirtyDayStats.netChange).toBe('-1000000'); // Net loss of 1 STX
      expect(result.thirtyDayStats.transactionCount).toBe(3); // 3 transactions in 30 days
    });
  });

  describe('formatStxBalance', () => {
    it('should format zero balance', () => {
      expect(formatStxBalance('0')).toBe('0 STX');
    });

    it('should format small balances', () => {
      expect(formatStxBalance('1000')).toBe('0.001 STX');
      expect(formatStxBalance('500000')).toBe('0.50 STX');
    });

    it('should format medium balances', () => {
      expect(formatStxBalance('1000000')).toBe('1,000.00 STX');
      expect(formatStxBalance('2500000')).toBe('2.50 STX');
    });

    it('should format large balances', () => {
      expect(formatStxBalance('100000000')).toBe('1,000,000 STX');
      expect(formatStxBalance('1234567890')).toBe('12,345.68 STX');
    });
  });

  describe('formatPercentageChange', () => {
    it('should format positive change', () => {
      expect(formatPercentageChange(25)).toBe('+25.0%');
    });

    it('should format negative change', () => {
      expect(formatPercentageChange(-25)).toBe('-25.0%');
    });

    it('should format zero change', () => {
      expect(formatPercentageChange(0)).toBe('0%');
    });

    it('should handle zero old value', () => {
      expect(formatPercentageChange(0, 100)).toBe('100%');
    });
  });
});

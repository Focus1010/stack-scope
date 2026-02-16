import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getContractNotes, 
  getContractData, 
  addContractNote, 
  updateContractNote, 
  deleteContractNote, 
  getContractById,
  getAllContracts,
  clearAllContracts
} from '../clarityContracts';

// Mock transactions for testing
const mockTransactions = [
  {
    id: '0x1234567890abcdef',
    type: 'contract' as const,
    amount: '1000000',
    timestamp: Date.now() - (7 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
    to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
    fee: '1000',
    memo: 'Contract deployment',
    block_height: 1000,
    tx_type: 'smart_contract',
  },
  {
    id: '0x0987654321fedcba',
    type: 'contract' as const,
    amount: '2000000',
    timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000),
    status: 'success' as const,
    from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
    to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
    fee: '1000',
    memo: 'Another contract',
    block_height: 1001,
    tx_type: 'smart_contract',
  },
];

describe('Clarity Contracts', () => {
  beforeEach(() => {
    // Clear contracts before each test
    clearAllContracts();
  });

  describe('getContractNotes', () => {
    it('should filter contract transactions', () => {
      const notes = getContractNotes(mockTransactions);
      
      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe('0x1234567890abcdef');
      expect(notes[0].note).toBe('Contract deployment');
      expect(notes[0].txId).toBe('0x1234567890abcdef');
      expect(notes[0].owner).toBe('SP1234567890abcdefghijklmnopqrstuvwxyz');
    });

    it('should return empty array for no contract transactions', () => {
      const nonContractTransactions = mockTransactions.filter(tx => tx.type !== 'contract');
      const notes = getContractNotes(nonContractTransactions);
      
      expect(notes).toHaveLength(0);
    });

    it('should handle empty memo field', () => {
      const emptyMemoTransactions = [
        {
          ...mockTransactions[0],
          memo: '',
        },
      ];
      
      const notes = getContractNotes(emptyMemoTransactions);
      
      expect(notes[0].note).toBe('');
      expect(notes[0].content).toBe('');
    });
  });

  describe('getContractData', () => {
    it('should calculate contract statistics', () => {
      const contractData = getContractData(mockTransactions);
      
      expect(contractData).not.toBeNull();
      expect(contractData?.contract).toHaveLength(2);
      expect(contractData?.totalSent).toBe('3000000'); // 3 STX total
      expect(contractData?.totalReceived).toBe('3000000'); // 3 STX total
      expect(contractData?.transactionCount).toBe(2);
      expect(contractData?.largestTransaction.amount).toBe('2000000'); // 2 STX largest
    });

    it('should return null for no contract transactions', () => {
      const nonContractTransactions = mockTransactions.filter(tx => tx.type !== 'contract');
      const contractData = getContractData(nonContractTransactions);
      
      expect(contractData).toBeNull();
    });
  });

  describe('addContractNote', () => {
    it('should create a new contract note', () => {
      const note = addContractNote('0x1234567890abcdef', 'Test note', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      expect(note.id).toBe('0x1234567890abcdef');
      expect(note.note).toBe('Test note');
      expect(note.owner).toBe('SP1234567890abcdefghijklmnopqrstuvwxyz');
      expect(note.timestamp).toBeGreaterThan(0);
    });

    it('should handle empty note', () => {
      const note = addContractNote('0x1234567890abcdef', '', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      expect(note.note).toBe('');
      expect(note.content).toBe('');
    });
  });

  describe('updateContractNote', () => {
    it('should update an existing contract note', () => {
      // First add a note
      addContractNote('0x1234567890abcdef', 'Original note', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      // Then update it
      updateContractNote('0x1234567890abcdef', 'Updated note', Date.now());
      
      const contract = getContractById('0x1234567890abcdef');
      
      expect(contract).not.toBeNull();
      expect(contract?.id).toBe('0x1234567890abcdef');
      expect(contract?.note || '').toBe('Updated note');
      expect(contract?.timestamp).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('deleteContractNote', () => {
    it('should delete a contract note', () => {
      // First add a note
      addContractNote('0x1234567890abcdef', 'Test note', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      // Then delete it
      deleteContractNote('0x1234567890abcdef');
      
      const contract = getContractById('0x1234567890abcdef');
      
      expect(contract).toBeNull();
    });
  });

  describe('getContractById', () => {
    it('should return contract by ID', () => {
      // First add a note
      addContractNote('0x1234567890abcdef', 'Test note', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      const contract = getContractById('0x1234567890abcdef');
      
      expect(contract).not.toBeNull();
      expect(contract?.id).toBe('0x1234567890abcdef');
      expect(contract?.note).toBe('Test note');
    });

    it('should return null for non-existent contract', () => {
      const contract = getContractById('0xnonexistent');
      
      expect(contract).toBeNull();
    });
  });

  describe('getAllContracts', () => {
    it('should return all contracts', () => {
      // Add multiple contracts
      addContractNote('0x1234567890abcdef', 'Contract 1', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      addContractNote('0x0987654321fedcba', 'Contract 2', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      const contracts = getAllContracts();
      
      expect(contracts).toHaveLength(2);
      expect(contracts[0].id).toBe('0x1234567890abcdef');
      expect(contracts[1].id).toBe('0x0987654321fedcba');
    });

    it('should return empty array when no contracts', () => {
      const contracts = getAllContracts();
      
      expect(contracts).toHaveLength(0);
    });
  });

  describe('clearAllContracts', () => {
    it('should clear all contracts', () => {
      // Add some contracts first
      addContractNote('0x1234567890abcdef', 'Test note', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      addContractNote('0x0987654321fedcba', 'Test note 2', 'SP1234567890abcdefghijklmnopqrstuvwxyz', Date.now());
      
      // Verify contracts exist
      expect(getAllContracts()).toHaveLength(2);
      
      // Clear all contracts
      clearAllContracts();
      
      // Verify contracts are cleared
      expect(getAllContracts()).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle large contract data', () => {
      const largeTransactions = Array.from({ length: 100 }, (_, index) => ({
        id: `0x${index.toString().padStart(16, '0')}`,
        type: 'contract' as const,
        amount: (index + 1).toString(),
        timestamp: Date.now() - (index * 24 * 60 * 60 * 1000),
        status: 'success' as const,
        from: 'SP1234567890abcdefghijklmnopqrstuvwxyz',
        to: 'SP0987654321zyxwvutsrqponmlkjihgfedcba',
        fee: '1000',
        memo: `Contract ${index + 1}`,
        block_height: 1000 + index,
        tx_type: 'smart_contract',
      }));
      
      const contractData = getContractData(largeTransactions);
      
      expect(contractData).not.toBeNull();
      expect(contractData?.contracts).toHaveLength(100);
      expect(contractData?.largestTransaction.amount).toBe('100'); // Largest contract
    });

    it('should handle empty transactions array', () => {
      const contractData = getContractData([]);
      
      expect(contractData).toBeNull();
    });
  });
});

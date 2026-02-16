import { StacksTransaction } from './stacksApi';

// Clarity contract interface
export interface ClarityContract {
  id: string;
  principal: string;
  code: string;
  name: string;
  description: string;
  balance: string;
  owner: string;
  txId: string;
  blockHeight: number;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  note?: string; // Optional note field
}

// Contract note interface
export interface ContractNote {
  id: string;
  note: string;
  txId: string;
  owner: string;
  timestamp: number;
  content: string;
}

// Contract data model
export interface ContractData {
  contract: ClarityContract;
  notes: ContractNote[];
  balance: string;
  totalSent: string;
  totalReceived: string;
  transactionCount: number;
  totalFeesSpent: string;
  largestTransaction: {
    amount: string;
    timestamp: number;
    id: string;
  };
}

/**
 * Get contract notes from transaction history
 */
export function getContractNotes(transactions: StacksTransaction[]): ContractNote[] {
  return transactions
    .filter(tx => tx.type === 'contract')
    .map(tx => ({
      id: tx.id,
      note: tx.memo || '',
      txId: tx.tx_id,
      owner: tx.from,
      timestamp: tx.timestamp,
      content: tx.memo || '',
    }));
}

/**
 * Get contract data from transaction history
 */
export function getContractData(transactions: StacksTransaction[]): ContractData | null {
  const contractTransactions = transactions.filter(tx => tx.type === 'contract');
  
  if (contractTransactions.length === 0) {
    return null;
  }

  // Group contracts by ID
  const contractMap = new Map<string, ClarityContract>();
  
  contractTransactions.forEach(tx => {
    const existingContract = contractMap.get(tx.id);
    
    if (existingContract) {
      // Update existing contract with latest data
      existingContract.balance = tx.amount || '0';
      existingContract.status = tx.status;
      existingContract.blockHeight = tx.block_height || 0;
      existingContract.timestamp = tx.timestamp;
    } else {
      // Create new contract entry
      contractMap.set(tx.id, {
        id: tx.id,
        principal: tx.from || '',
        code: tx.tx_type || 'contract',
        name: 'Smart Contract',
        description: tx.memo || 'Smart contract deployment',
        balance: tx.amount || '0',
        owner: tx.from || '',
        txId: tx.tx_id,
        blockHeight: tx.block_height || 0,
        timestamp: tx.timestamp,
        status: tx.status,
      });
    }
  });

  // Calculate contract statistics
  const contracts = Array.from(contractMap.values());
  const totalSent = contracts.reduce((sum, contract) => parseInt(contract.balance, 10), 0).toString();
  const totalReceived = contracts.reduce((sum, contract) => parseInt(contract.balance, 10), 0).toString();
  const totalFeesSpent = contracts.reduce((sum, contract) => parseInt(contract.fee || '0', 10)).toString();
  const transactionCount = contractTransactions.length;

  // Find largest contract by balance
  const largestContract = contracts.reduce((largest, contract) => {
    const contractAmount = parseInt(contract.balance, 10);
    const largestAmount = parseInt(largest.balance, 10);
    return contractAmount > largestAmount ? contract : largest;
  }, contracts[0]);

  // Sort contracts by balance (descending)
  contracts.sort((a, b) => parseInt(b.balance, 10) - parseInt(a.balance, 10));

  return {
    contracts,
    totalSent,
    totalReceived,
    netBalance: (parseInt(totalReceived, 10) - parseInt(totalSent, 10)).toString(),
    transactionCount,
    totalFeesSpent,
    largestTransaction,
  };
}

/**
 * Add a note to a contract
 */
export function addContractNote(
  contractId: string,
  note: string,
  owner: string
  timestamp: number
): ContractNote {
  return {
    id: contractId,
    note,
    owner,
    timestamp,
  };
  }
}

/**
 * Update a note in a contract
 */
export function updateContractNote(
  contractId: string,
  note: string,
  timestamp: number
): void {
  // Find the contract
  const contract = contractMap.get(contractId);
  if (!contract) return;

  // Update the note
  contract.note = note;
  contract.timestamp = Date.now();
  contractMap.set(contractId, contract);
}

/**
 * Delete a note from a contract
 */
export function deleteContractNote(
  contractId: string,
): void {
  const contract = contractMap.get(contractId);
  if (!contract) return;

  contractMap.delete(contractId);
}

/**
 * Get contract by ID
 */
export function getContractById(contractId: string): ClarityContract | null {
  return contractMap.get(contractId) || null;
}

/**
 * Get all contracts
 */
export function getAllContracts(): ClarityContract[] {
  return Array.from(contractMap.values());
}

/**
 * Clear all contracts
 */
export function clearAllContracts(): void {
  contractMap.clear();
}

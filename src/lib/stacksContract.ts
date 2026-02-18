import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { principalCV, stringUtf8CV, bufferCV, uintCV, responseOkCV, responseErrorCV, tupleCV } from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';

// Contract configuration
export const CONTRACT_CONFIG = {
  // Update this with your deployed contract address
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with your actual contract address
  contractName: 'stackscope-notes',
  network: new StacksTestnet(), // Use StacksMainnet() for mainnet
};

// Contract function interfaces
export interface NoteData {
  note: string;
  owner: string;
  timestamp: number;
}

export interface ContractResponse {
  isOk: boolean;
  value: any;
}

/**
 * Add a note to the contract
 */
export async function addNote(txid: string, note: string): Promise<ContractResponse> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'add-note',
      functionArgs: [
        bufferCV(Buffer.from(txid.replace('0x', ''), 'hex')),
        stringUtf8CV(note)
      ],
      network: CONTRACT_CONFIG.network,
      appDetails: {
        name: 'StackScope',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Note added successfully:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { isOk: true, value: 'Note added successfully' };
  } catch (error) {
    console.error('Error adding note:', error);
    return { isOk: false, value: error };
  }
}

/**
 * Get a note from the contract
 */
export async function getNote(txid: string): Promise<ContractResponse> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'get-note',
      functionArgs: [
        bufferCV(Buffer.from(txid.replace('0x', ''), 'hex'))
      ],
      network: CONTRACT_CONFIG.network,
      senderAddress: CONTRACT_CONFIG.contractAddress, // Read-only call
    };

    // For read-only calls, we need to use a different approach
    // This would typically be done via a read-only API call
    const result = await simulateReadOnlyCall(txOptions);
    return result;
  } catch (error) {
    console.error('Error getting note:', error);
    return { isOk: false, value: error };
  }
}

/**
 * Update a note in the contract
 */
export async function updateNote(txid: string, note: string): Promise<ContractResponse> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'update-note',
      functionArgs: [
        bufferCV(Buffer.from(txid.replace('0x', ''), 'hex')),
        stringUtf8CV(note)
      ],
      network: CONTRACT_CONFIG.network,
      appDetails: {
        name: 'StackScope',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Note updated successfully:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { isOk: true, value: 'Note updated successfully' };
  } catch (error) {
    console.error('Error updating note:', error);
    return { isOk: false, value: error };
  }
}

/**
 * Delete a note from the contract
 */
export async function deleteNote(txid: string): Promise<ContractResponse> {
  try {
    const txOptions = {
      contractAddress: CONTRACT_CONFIG.contractAddress,
      contractName: CONTRACT_CONFIG.contractName,
      functionName: 'delete-note',
      functionArgs: [
        bufferCV(Buffer.from(txid.replace('0x', ''), 'hex'))
      ],
      network: CONTRACT_CONFIG.network,
      appDetails: {
        name: 'StackScope',
        icon: window.location.origin + '/logo.png',
      },
      onFinish: (data: any) => {
        console.log('Note deleted successfully:', data);
      },
      onCancel: () => {
        console.log('Transaction cancelled');
      },
    };

    await openContractCall(txOptions);
    return { isOk: true, value: 'Note deleted successfully' };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { isOk: false, value: error };
  }
}

/**
 * Simulate a read-only contract call
 */
async function simulateReadOnlyCall(txOptions: any): Promise<ContractResponse> {
  try {
    // This would typically be done via the Stacks API
    // For now, return a mock response
    const response = await fetch(`${CONTRACT_CONFIG.network.coreApiUrl}/v2/contracts/call-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(txOptions),
    });

    if (response.ok) {
      const result = await response.json();
      return { isOk: true, value: result };
    } else {
      return { isOk: false, value: 'Read-only call failed' };
    }
  } catch (error) {
    console.error('Read-only call error:', error);
    return { isOk: false, value: error };
  }
}

/**
 * Get contract information
 */
export function getContractInfo() {
  return {
    address: CONTRACT_CONFIG.contractAddress,
    name: CONTRACT_CONFIG.contractName,
    network: CONTRACT_CONFIG.network.isMainnet() ? 'mainnet' : 'testnet',
    explorerUrl: CONTRACT_CONFIG.network.isMainnet() 
      ? `https://explorer.stacks.co/contract/${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}`
      : `https://explorer.stacks.co/contract/${CONTRACT_CONFIG.contractAddress}.${CONTRACT_CONFIG.contractName}?chain=testnet`,
  };
}

/**
 * Validate contract address format
 */
export function isValidContractAddress(address: string): boolean {
  // Basic validation for Stacks address format
  return /^ST[A-Z0-9]{21,}$/.test(address);
}

/**
 * Format transaction ID for contract calls
 */
export function formatTxid(txid: string): Buffer {
  // Remove 0x prefix if present and convert to buffer
  const cleanTxid = txid.replace('0x', '');
  return Buffer.from(cleanTxid, 'hex');
}

/**
 * Generate a random transaction ID for testing
 */
export function generateTestTxid(): string {
  const bytes = new Array(32).fill(0).map(() => Math.floor(Math.random() * 256));
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hex;
}

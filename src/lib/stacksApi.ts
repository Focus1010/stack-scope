import { Address } from '@stacks/transactions';

// Stacks API endpoints
const STACKS_API_BASE_URL = 'https://api.mainnet.hiro.so';
const STACKS_TESTNET_API_URL = 'https://api.testnet.hiro.so';

// Account balance interface
export interface AccountBalance {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    total_fees_spent: string;
    lock_height: number | null;
  };
  fungible_tokens: Record<string, {
    balance: string;
    total_sent: string;
    total_received: string;
    lock_height: number | null;
  }>;
  non_fungible_tokens: Record<string, {
    count: number;
  }>;
}

// Transaction interfaces
export interface StacksTransaction {
  id: string;
  type: 'send' | 'receive' | 'contract' | 'other';
  amount: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  from: string;
  to: string;
  fee: string;
  memo?: string;
  block_height?: number;
  tx_type: string;
}

// Raw API transaction response
interface RawTransaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height?: number;
  block_time?: number;
  fee_rate: string;
  sender_address: string;
  sponsor_address?: string;
  recipient_address?: string;
  amount?: string;
  memo?: string;
  token?: string;
  operations?: Array<{
    type: string;
    address?: string;
    amount?: string;
  }>;
}

// API response interface
interface ApiResponse {
  balance: string;
  total_sent: string;
  total_received: string;
  total_fees_spent: string;
  lock_height: number | null;
}

// Transaction API response
interface TransactionsApiResponse {
  total: number;
  results: RawTransaction[];
}

// Cache for balance data
const balanceCache = new Map<string, { data: AccountBalance; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Cache for transaction data
const transactionCache = new Map<string, { data: StacksTransaction[]; timestamp: number }>();

/**
 * Get the appropriate API URL based on network
 */
function getApiUrl(network: 'mainnet' | 'testnet'): string {
  return network === 'mainnet' ? STACKS_API_BASE_URL : STACKS_TESTNET_API_URL;
}

/**
 * Fetch account balance from Stacks API
 */
export async function fetchAccountBalance(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<AccountBalance> {
  // Check cache first
  const cacheKey = `${address}-${network}`;
  const cached = balanceCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[StacksAPI] Using cached balance for ${address}`);
    return cached.data;
  }

  console.log(`[StacksAPI] Fetching balance for ${address} on ${network}`);
  
  const apiUrl = getApiUrl(network);
  const url = `${apiUrl}/extended/v1/address/${address}/balances`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform API response to our interface
    const accountBalance: AccountBalance = {
      stx: {
        balance: data.stx_balance || '0',
        total_sent: data.total_sent || '0',
        total_received: data.total_received || '0',
        total_fees_spent: data.total_fees_spent || '0',
        lock_height: data.lock_height || null,
      },
      fungible_tokens: data.fungible_tokens || {},
      non_fungible_tokens: data.non_fungible_tokens || {},
    };
    
    // Cache the result
    balanceCache.set(cacheKey, {
      data: accountBalance,
      timestamp: Date.now(),
    });
    
    console.log(`[StacksAPI] Successfully fetched balance for ${address}`);
    return accountBalance;
    
  } catch (error) {
    console.error(`[StacksAPI] Error fetching balance for ${address}:`, error);
    throw new Error(`Failed to fetch balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format STX balance for display
 */
export function formatStxBalance(balance: string): string {
  const microStx = parseInt(balance, 10);
  const stx = microStx / 1_000_000; // Convert from microSTX to STX
  
  if (stx === 0) return '0';
  
  // Format with appropriate decimal places
  if (stx < 0.001) return '<0.001';
  if (stx < 1) return stx.toFixed(3);
  if (stx < 1000) return stx.toFixed(2);
  
  return stx.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Clear balance cache (useful for debugging or force refresh)
 */
export function clearBalanceCache(): void {
  balanceCache.clear();
  console.log('[StacksAPI] Balance cache cleared');
}

/**
 * Clear transaction cache (useful for debugging or force refresh)
 */
export function clearTransactionCache(): void {
  transactionCache.clear();
  console.log('[StacksAPI] Transaction cache cleared');
}

/**
 * Normalize raw transaction data into clean format
 */
function normalizeTransaction(raw: RawTransaction, userAddress: string): StacksTransaction {
  // Determine transaction type based on user's role
  let type: 'send' | 'receive' | 'contract' | 'other';
  
  if (raw.tx_type === 'token_transfer') {
    type = raw.sender_address === userAddress ? 'send' : 'receive';
  } else if (raw.tx_type === 'smart_contract') {
    type = 'contract';
  } else {
    type = 'other';
  }

  // Determine status
  let status: 'success' | 'pending' | 'failed';
  if (raw.tx_status === 'success') {
    status = 'success';
  } else if (raw.tx_status === 'pending') {
    status = 'pending';
  } else {
    status = 'failed';
  }

  // Extract amount (handle different formats)
  let amount = '0';
  if (raw.amount) {
    amount = raw.amount;
  } else if (raw.operations && raw.operations.length > 0) {
    const stxOp = raw.operations.find(op => op.type === 'stx_transfer');
    if (stxOp && stxOp.amount) {
      amount = stxOp.amount;
    }
  }

  return {
    id: raw.tx_id,
    type,
    amount,
    timestamp: raw.block_time ? raw.block_time * 1000 : Date.now(), // Convert to milliseconds
    status,
    from: raw.sender_address,
    to: raw.recipient_address || '',
    fee: raw.fee_rate || '0',
    memo: raw.memo,
    block_height: raw.block_height,
    tx_type: raw.tx_type,
  };
}

/**
 * Fetch wallet transactions from Stacks API
 */
export async function fetchWalletTransactions(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet',
  limit: number = 20
): Promise<StacksTransaction[]> {
  // Check cache first
  const cacheKey = `${address}-${network}-${limit}`;
  const cached = transactionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[StacksAPI] Using cached transactions for ${address}`);
    return cached.data;
  }

  console.log(`[StacksAPI] Fetching transactions for ${address} on ${network} (limit: ${limit})`);
  
  const apiUrl = getApiUrl(network);
  const url = `${apiUrl}/extended/v1/address/${address}/transactions?limit=${limit}&order=desc`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: TransactionsApiResponse = await response.json();
    
    // Normalize transactions
    const normalizedTransactions = data.results.map(raw => normalizeTransaction(raw, address));
    
    console.log(`[StacksAPI] Successfully fetched ${normalizedTransactions.length} transactions for ${address}`);
    
    // Cache the result
    transactionCache.set(cacheKey, {
      data: normalizedTransactions,
      timestamp: Date.now(),
    });
    
    return normalizedTransactions;
    
  } catch (error) {
    console.error(`[StacksAPI] Error fetching transactions for ${address}:`, error);
    throw new Error(`Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

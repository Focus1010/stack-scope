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

// API response interface
interface ApiResponse {
  balance: string;
  total_sent: string;
  total_received: string;
  total_fees_spent: string;
  lock_height: number | null;
}

// Cache for balance data
const balanceCache = new Map<string, { data: AccountBalance; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

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

import { StacksTransaction } from './stacksApi';

// Analytics data interfaces
export interface WalletAnalytics {
  totalSent: string;
  totalReceived: string;
  netBalance: string;
  transactionCount: number;
  totalFeesSpent: string;
  largestTransaction: {
    amount: string;
    timestamp: number;
    id: string;
  };
  sevenDayStats: {
    sent: number;
    received: number;
    netChange: string;
    transactionCount: number;
  };
  thirtyDayStats: {
    sent: number;
    received: number;
    netChange: string;
    transactionCount: number;
  };
}

/**
 * Calculate wallet analytics from transaction history
 */
export function calculateWalletAnalytics(transactions: StacksTransaction[]): WalletAnalytics {
  if (transactions.length === 0) {
    return {
      totalSent: '0',
      totalReceived: '0',
      netBalance: '0',
      transactionCount: 0,
      totalFeesSpent: '0',
      largestTransaction: {
        amount: '0',
        timestamp: Date.now(),
        id: '',
      },
      sevenDayStats: {
        sent: 0,
        received: 0,
        netChange: '0',
        transactionCount: 0,
      },
      thirtyDayStats: {
        sent: 0,
        received: 0,
        netChange: '0',
        transactionCount: 0,
      },
    };
  }

  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  // Calculate totals
  let totalSent = '0';
  let totalReceived = '0';
  let totalFees: string = '0';

  transactions.forEach(tx => {
    const amount = parseInt(tx.amount, 10);
    
    if (tx.type === 'send') {
      totalSent = (parseInt(totalSent, 10) + amount).toString();
      totalFees = (parseInt(totalFees, 10) + parseInt(tx.fee || '0', 10)).toString();
    } else if (tx.type === 'receive') {
      totalReceived = (parseInt(totalReceived, 10) + amount).toString();
    }
  });

  const totalSentNum = parseInt(totalSent, 10);
  const totalReceivedNum = parseInt(totalReceived, 10);
  const netBalanceNum = totalReceivedNum - totalSentNum;

  // Find largest transaction
  const largestTransaction = transactions.reduce((largest, tx) => {
    const txAmount = parseInt(tx.amount, 10);
    const largestAmount = parseInt(largest.amount, 10);
    return txAmount > largestAmount ? tx : largest;
  }, transactions[0]);

  // Filter transactions for time periods
  const sevenDayTransactions = transactions.filter(tx => tx.timestamp >= sevenDaysAgo);
  const thirtyDayTransactions = transactions.filter(tx => tx.timestamp >= thirtyDaysAgo);

  // Calculate 7-day stats
  const sevenDaySent = sevenDayTransactions
    .filter(tx => tx.type === 'send')
    .reduce((sum, tx) => sum + parseInt(tx.amount, 10), 0);
  
  const sevenDayReceived = sevenDayTransactions
    .filter(tx => tx.type === 'receive')
    .reduce((sum, tx) => sum + parseInt(tx.amount, 10), 0);
  
  const sevenDayNetChange = (sevenDayReceived - sevenDaySent).toString();

  // Calculate 30-day stats
  const thirtyDaySent = thirtyDayTransactions
    .filter(tx => tx.type === 'send')
    .reduce((sum, tx) => sum + parseInt(tx.amount, 10), 0);
  
  const thirtyDayReceived = thirtyDayTransactions
    .filter(tx => tx.type === 'receive')
    .reduce((sum, tx) => sum + parseInt(tx.amount, 10), 0);
  
  const thirtyDayNetChange = (thirtyDayReceived - thirtyDaySent).toString();

  return {
    totalSent,
    totalReceived,
    netBalance: netBalanceNum.toString(),
    transactionCount: transactions.length,
    totalFeesSpent,
    largestTransaction,
    sevenDayStats: {
      sent: sevenDayTransactions.filter(tx => tx.type === 'send').length,
      received: sevenDayTransactions.filter(tx => tx.type === 'receive').length,
      netChange: sevenDayNetChange,
      transactionCount: sevenDayTransactions.length,
    },
    thirtyDayStats: {
      sent: thirtyDayTransactions.filter(tx => tx.type === 'send').length,
      received: thirtyDayTransactions.filter(tx => tx.type === 'receive').length,
      netChange: thirtyDayNetChange,
      transactionCount: thirtyDayTransactions.length,
    },
  };
}

/**
 * Format microSTX to STX for display
 */
export function formatStxAmount(microStx: string): string {
  const stx = parseInt(microStx, 10) / 1_000_000;
  
  if (stx === 0) return '0 STX';
  
  return stx.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' STX';
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Format percentage change for display
 */
export function formatPercentageChange(percentage: number): string {
  if (percentage === 0) return '0%';
  
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${Math.abs(percentage).toFixed(1)}%`;
}

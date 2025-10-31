import { supabase } from '../lib/supabaseClient';
import crypto from 'crypto';

export interface LedgerEntry {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit' | 'transfer' | 'deposit' | 'withdrawal';
  reference?: string;
  relatedUser?: string;
  status: string;
  createdAt: string;
}

export interface UserBalance {
  userId: string;
  balance: number;
  currency: string;
}

export interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  description?: string;
}

export interface TransferResult {
  success: boolean;
  transactionId: string;
  fromBalance: number;
  toBalance: number;
  message: string;
}

/**
 * Calculates the current balance for a user in a specific currency
 * @param userId - User's unique identifier
 * @param currency - Currency code (default: 'USDT')
 * @returns Current balance
 */
export async function getUserBalance(
  userId: string, 
  currency: string = 'USDT'
): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_balance', {
        p_user_id: userId,
        p_currency: currency
      });

    if (error) {
      throw new Error(`Failed to get user balance: ${error.message}`);
    }

    return data || 0;
  } catch (error) {
    throw new Error(`Balance calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all balances for a user across different currencies
 * @param userId - User's unique identifier
 * @returns Array of user balances by currency
 */
export async function getUserBalances(userId: string): Promise<UserBalance[]> {
  try {
    const { data, error } = await supabase
      .from('ledger')
      .select('currency, amount')
      .eq('user_id', userId)
      .eq('status', 'posted');

    if (error) {
      throw new Error(`Failed to get user balances: ${error.message}`);
    }

    // Group by currency and sum amounts
    const balanceMap = new Map<string, number>();
    
    data.forEach(entry => {
      const current = balanceMap.get(entry.currency) || 0;
      balanceMap.set(entry.currency, current + parseFloat(entry.amount.toString()));
    });

    return Array.from(balanceMap.entries()).map(([currency, balance]) => ({
      userId,
      balance,
      currency
    }));
  } catch (error) {
    throw new Error(`Balances retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a ledger entry for deposits, withdrawals, or manual adjustments
 * @param userId - User's unique identifier
 * @param amount - Amount (positive for credit, negative for debit)
 * @param type - Type of transaction
 * @param currency - Currency code (default: 'USDT')
 * @param reference - Reference or transaction ID
 * @returns Created ledger entry
 */
export async function createLedgerEntry(
  userId: string,
  amount: number,
  type: 'credit' | 'debit' | 'deposit' | 'withdrawal',
  currency: string = 'USDT',
  reference?: string
): Promise<LedgerEntry> {
  try {
    const { data, error } = await supabase
      .from('ledger')
      .insert({
        user_id: userId,
        amount,
        currency,
        type,
        reference,
        status: 'posted'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ledger entry: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw new Error(`Ledger entry creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Performs an atomic transfer between two users
 * @param transferRequest - Transfer request details
 * @returns Transfer result with success status and balances
 */
export async function performTransfer(transferRequest: TransferRequest): Promise<TransferResult> {
  const {
    fromUserId,
    toUserId,
    amount,
    currency = 'USDT',
    idempotencyKey,
    description
  } = transferRequest;

  try {
    // Validate inputs
    if (!fromUserId || !toUserId) {
      throw new Error('Both sender and receiver user IDs are required');
    }

    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    if (fromUserId === toUserId) {
      throw new Error('Cannot transfer to the same user');
    }

    // Generate idempotency key if not provided
    const finalIdempotencyKey = idempotencyKey || crypto.randomUUID();

    // Check for duplicate transaction
    const { data: existingTransfer } = await supabase
      .from('ledger')
      .select('id')
      .eq('reference', finalIdempotencyKey)
      .limit(1);

    if (existingTransfer && existingTransfer.length > 0) {
      throw new Error('Duplicate transaction detected');
    }

    // Use the atomic transfer function from the database
    const { data, error } = await supabase
      .rpc('atomic_transfer', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_amount: amount,
        p_currency: currency,
        p_reference: finalIdempotencyKey
      });

    if (error) {
      throw new Error(`Transfer failed: ${error.message}`);
    }

    // Get updated balances
    const fromBalance = await getUserBalance(fromUserId, currency);
    const toBalance = await getUserBalance(toUserId, currency);

    return {
      success: true,
      transactionId: finalIdempotencyKey,
      fromBalance,
      toBalance,
      message: `Successfully transferred ${amount} ${currency}`
    };
  } catch (error) {
    return {
      success: false,
      transactionId: '',
      fromBalance: 0,
      toBalance: 0,
      message: error instanceof Error ? error.message : 'Unknown transfer error'
    };
  }
}

/**
 * Gets transaction history for a user
 * @param userId - User's unique identifier
 * @param currency - Currency filter (optional)
 * @param limit - Number of transactions to return (default: 50)
 * @param offset - Offset for pagination (default: 0)
 * @returns Array of ledger entries
 */
export async function getTransactionHistory(
  userId: string,
  currency?: string,
  limit: number = 50,
  offset: number = 0
): Promise<LedgerEntry[]> {
  try {
    let query = supabase
      .from('ledger')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'posted')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (currency) {
      query = query.eq('currency', currency);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Transaction history retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets pending transactions for a user
 * @param userId - User's unique identifier
 * @param currency - Currency filter (optional)
 * @returns Array of pending ledger entries
 */
export async function getPendingTransactions(
  userId: string,
  currency?: string
): Promise<LedgerEntry[]> {
  try {
    let query = supabase
      .from('ledger')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (currency) {
      query = query.eq('currency', currency);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get pending transactions: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Pending transactions retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a user has sufficient balance for a transaction
 * @param userId - User's unique identifier
 * @param amount - Amount to validate
 * @param currency - Currency code (default: 'USDT')
 * @returns True if user has sufficient balance
 */
export async function validateSufficientBalance(
  userId: string,
  amount: number,
  currency: string = 'USDT'
): Promise<boolean> {
  try {
    const balance = await getUserBalance(userId, currency);
    return balance >= amount;
  } catch (error) {
    return false;
  }
}

/**
 * Gets transfer details by reference/transaction ID
 * @param reference - Transaction reference or idempotency key
 * @returns Array of related ledger entries
 */
export async function getTransferByReference(reference: string): Promise<LedgerEntry[]> {
  try {
    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .eq('reference', reference)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get transfer by reference: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Transfer lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes a deposit from on-chain to user's platform balance
 * @param userId - User's unique identifier
 * @param amount - Deposit amount
 * @param currency - Currency code (default: 'USDT')
 * @param txHash - On-chain transaction hash
 * @returns Created ledger entry
 */
export async function processDeposit(
  userId: string,
  amount: number,
  currency: string = 'USDT',
  txHash: string
): Promise<LedgerEntry> {
  try {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    // Check if deposit already processed
    const { data: existingDeposit } = await supabase
      .from('ledger')
      .select('id')
      .eq('reference', txHash)
      .eq('type', 'deposit')
      .limit(1);

    if (existingDeposit && existingDeposit.length > 0) {
      throw new Error('Deposit already processed');
    }

    return await createLedgerEntry(userId, amount, 'deposit', currency, txHash);
  } catch (error) {
    throw new Error(`Deposit processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
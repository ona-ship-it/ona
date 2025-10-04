import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase';

export interface LedgerTransaction {
  id: string;
  user_id: string | null;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'payout';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Record a new transaction in the ledger
 */
export async function recordTransaction(
  userId: string | null,
  type: 'deposit' | 'withdrawal' | 'purchase' | 'payout',
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed' = 'pending',
  txHash?: string,
  metadata?: any
): Promise<LedgerTransaction | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Use a database transaction to ensure atomicity
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount,
      currency,
      status,
      tx_hash: txHash,
      metadata
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error recording transaction:', error);
    return null;
  }
  
  return data as unknown as LedgerTransaction;
}

/**
 * Update a transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'completed' | 'failed',
  txHash?: string
): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  const { error } = await supabase
    .from('transactions')
    .update({
      status,
      tx_hash: txHash
    })
    .eq('id', transactionId);
  
  if (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }
  
  return true;
}

/**
 * Get user transactions
 */
export async function getUserTransactions(userId: string): Promise<LedgerTransaction[]> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
  
  return data as unknown as LedgerTransaction[];
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<LedgerTransaction | null> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single();
  
  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
  
  return data as unknown as LedgerTransaction;
}

/**
 * Get transactions by status
 */
export async function getTransactionsByStatus(status: 'pending' | 'completed' | 'failed'): Promise<LedgerTransaction[]> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions by status:', error);
    return [];
  }
  
  return data as unknown as LedgerTransaction[];
}

/**
 * Get transactions by hash
 */
export async function getTransactionByHash(txHash: string): Promise<LedgerTransaction | null> {
  const supabase = createClientComponentClient<Database>();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('tx_hash', txHash)
    .single();
  
  if (error) {
    console.error('Error fetching transaction by hash:', error);
    return null;
  }
  
  return data as unknown as LedgerTransaction;
}

/**
 * Create a ticket purchase transaction and ticket in a single atomic operation
 */
export async function purchaseTicket(
  userId: string,
  raffleId: string,
  ticketNumber: string,
  amount: number,
  currency: string
): Promise<{ transaction: LedgerTransaction | null, ticketId: string | null }> {
  const supabase = createClientComponentClient<Database>();
  
  // Start a Supabase transaction
  const { data, error } = await supabase.rpc('purchase_ticket', {
    p_user_id: userId,
    p_raffle_id: raffleId,
    p_ticket_number: ticketNumber,
    p_amount: amount,
    p_currency: currency
  });
  
  if (error) {
    console.error('Error purchasing ticket:', error);
    return { transaction: null, ticketId: null };
  }
  
  return {
    transaction: data.transaction as unknown as LedgerTransaction,
    ticketId: data.ticket_id
  };
}

/**
 * Update user balance based on transaction
 * This should be called after a transaction is confirmed
 */
export async function updateUserBalance(
  userId: string,
  transactionId: string
): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  // Get the transaction
  const transaction = await getTransactionById(transactionId);
  if (!transaction || transaction.status !== 'completed') {
    return false;
  }
  
  // Update the user's balance based on transaction type
  if (transaction.type === 'deposit') {
    // Add to user's balance
    if (transaction.currency === 'USD') {
      await supabase.rpc('add_to_fiat_balance', {
        p_user_id: userId,
        p_amount: transaction.amount
      });
    } else {
      await supabase.rpc('add_to_crypto_balance', {
        p_user_id: userId,
        p_currency: transaction.currency,
        p_amount: transaction.amount
      });
    }
  } else if (transaction.type === 'withdrawal') {
    // Subtract from user's balance
    if (transaction.currency === 'USD') {
      await supabase.rpc('add_to_fiat_balance', {
        p_user_id: userId,
        p_amount: -transaction.amount
      });
    } else {
      await supabase.rpc('add_to_crypto_balance', {
        p_user_id: userId,
        p_currency: transaction.currency,
        p_amount: -transaction.amount
      });
    }
  }
  
  return true;
}
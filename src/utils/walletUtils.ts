import { SupabaseClient } from '@supabase/supabase-js';

export interface WalletData {
  id: string;
  user_id: string;
  fiat_balance: number;
  crypto_balances: {
    BTC?: number;
    ETH?: number;
    SOL?: number;
    [key: string]: number | undefined;
  };
  created_at: string;
}

/**
 * Get a user's wallet data
 */
export async function getUserWallet(supabase: SupabaseClient, userId: string): Promise<WalletData | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
  
  return data as WalletData;
}

/**
 * Update a user's fiat balance
 */
export async function updateFiatBalance(
  supabase: SupabaseClient, 
  userId: string, 
  amount: number
): Promise<boolean> {
  const { error } = await supabase
    .from('wallets')
    .update({ fiat_balance: amount })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating fiat balance:', error);
    return false;
  }
  
  return true;
}

/**
 * Update a specific cryptocurrency balance
 */
export async function updateCryptoBalance(
  supabase: SupabaseClient,
  userId: string,
  currency: string,
  amount: number
): Promise<boolean> {
  // First get the current wallet
  const wallet = await getUserWallet(supabase, userId);
  if (!wallet) return false;
  
  // Update the specific crypto balance
  const cryptoBalances = { ...wallet.crypto_balances };
  cryptoBalances[currency] = amount;
  
  // Save the updated balances
  const { error } = await supabase
    .from('wallets')
    .update({ crypto_balances: cryptoBalances })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating crypto balance:', error);
    return false;
  }
  
  return true;
}

/**
 * Add to a user's fiat balance (positive for deposit, negative for withdrawal)
 */
export async function addToFiatBalance(
  supabase: SupabaseClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const wallet = await getUserWallet(supabase, userId);
  if (!wallet) return false;
  
  const newBalance = (wallet.fiat_balance || 0) + amount;
  
  return updateFiatBalance(supabase, userId, newBalance);
}

/**
 * Add to a cryptocurrency balance (positive for deposit, negative for withdrawal)
 */
export async function addToCryptoBalance(
  supabase: SupabaseClient,
  userId: string,
  currency: string,
  amount: number
): Promise<boolean> {
  const wallet = await getUserWallet(supabase, userId);
  if (!wallet) return false;
  
  const currentBalance = wallet.crypto_balances[currency] || 0;
  const newBalance = currentBalance + amount;
  
  return updateCryptoBalance(supabase, userId, currency, newBalance);
}
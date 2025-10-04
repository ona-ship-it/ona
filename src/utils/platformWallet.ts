import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import crypto from 'crypto';

// Interface for platform wallet
export interface PlatformWallet {
  id: string;
  address: string;
  encrypted_private_key: string;
  currency: string;
  created_at: string;
}

// Interface for transaction records
export interface Transaction {
  id: string;
  user_id: string | null;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'payout';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
  metadata?: any;
  created_at: string;
}

/**
 * Encrypt a private key using AES-256 with PBKDF2
 * @param privateKey The private key to encrypt
 * @param passphrase The passphrase to use for encryption
 */
export function encryptPrivateKey(privateKey: string, passphrase: string): string {
  // In production, use a proper KMS solution
  // This is a temporary solution for development
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Store salt and IV with the encrypted data
  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a private key
 * @param encryptedData The encrypted private key
 * @param passphrase The passphrase used for encryption
 */
export function decryptPrivateKey(encryptedData: string, passphrase: string): string {
  // Split the stored data to get salt, IV, and encrypted data
  const [saltHex, ivHex, encryptedHex] = encryptedData.split(':');
  
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get the platform wallet for a specific currency
 */
export async function getPlatformWallet(currency: string = 'USDT'): Promise<PlatformWallet | null> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('platform_wallets')
    .select('*')
    .eq('currency', currency)
    .single();
  
  if (error) {
    console.error('Error fetching platform wallet:', error);
    return null;
  }
  
  return data as PlatformWallet;
}

/**
 * Create a new platform wallet (admin function)
 * Note: In production, this should be done in a secure environment
 */
export async function createPlatformWallet(
  currency: string,
  address: string,
  privateKey: string,
  passphrase: string
): Promise<PlatformWallet | null> {
  const supabase = createClientComponentClient();
  
  // Encrypt the private key
  const encryptedKey = encryptPrivateKey(privateKey, passphrase);
  
  const { data, error } = await supabase
    .from('platform_wallets')
    .insert({
      currency,
      address,
      encrypted_private_key: encryptedKey
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating platform wallet:', error);
    return null;
  }
  
  return data as PlatformWallet;
}

/**
 * Record a transaction in the ledger
 */
export async function recordTransaction(
  userId: string | null,
  type: 'deposit' | 'withdrawal' | 'purchase' | 'payout',
  amount: number,
  currency: string,
  status: 'pending' | 'completed' | 'failed' = 'pending',
  txHash?: string,
  metadata?: any
): Promise<Transaction | null> {
  const supabase = createClientComponentClient();
  
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
  
  return data as Transaction;
}

/**
 * Update a transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'completed' | 'failed',
  txHash?: string
): Promise<boolean> {
  const supabase = createClientComponentClient();
  
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
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
  
  return data as Transaction[];
}
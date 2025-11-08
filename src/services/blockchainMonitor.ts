import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { recordTransaction, updateTransactionStatus, getTransactionByHash } from '../utils/transactionLedger';
import { getPlatformWallet } from '../utils/platformWallet';

// Configuration for TronGrid API
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY || '';
const TRONGRID_API_URL = 'https://api.trongrid.io';
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT on Tron
const CONFIRMATION_BLOCKS = 10; // Number of confirmations required

interface TronTransaction {
  txID: string;
  blockNumber: number;
  blockTimestamp: number;
  contractAddress: string;
  toAddress: string;
  fromAddress: string;
  amount: number;
  tokenName: string;
  confirmed: boolean;
  data?: string; // For memo/reference code
}

interface TronGridTrc20Tx {
  transaction_id: string;
  block_number: number;
  block_timestamp: number;
  token_info: {
    address: string;
    symbol: string;
    decimals: number;
  };
  to: string;
  from: string;
  value: string;
  data?: string;
}

/**
 * Monitor the blockchain for incoming deposits to the platform wallet
 * This should be run as a background worker/cron job
 */
export async function monitorBlockchain() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  
  try {
    // Get the platform wallet address for USDT
    const platformWallet = await getPlatformWallet('USDT');
    if (!platformWallet) {
      console.error('Platform wallet not found');
      return;
    }
    
    // Get the latest transactions for the platform wallet
    const transactions = await fetchTronTransactions(platformWallet.address);
    
    // Process each transaction
    for (const tx of transactions) {
      await processTransaction(supabase, tx, platformWallet.address);
    }
    
    console.log('Blockchain monitoring completed successfully');
  } catch (error) {
    console.error('Error in blockchain monitoring:', error);
  }
}

/**
 * Fetch transactions from TronGrid API
 */
async function fetchTronTransactions(address: string): Promise<TronTransaction[]> {
  try {
    // Fetch TRC20 token transfers (USDT)
    const response = await fetch(
      `${TRONGRID_API_URL}/v1/accounts/${address}/transactions/trc20?limit=100&contract_address=${USDT_CONTRACT_ADDRESS}`,
      {
        headers: {
          'TRON-PRO-API-KEY': TRONGRID_API_KEY
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`TronGrid API error: ${response.status}`);
    }
    
    const data: { data: TronGridTrc20Tx[] } = await response.json();
    
    // Transform the data into our transaction format
    return data.data.map((tx: TronGridTrc20Tx) => ({
      txID: tx.transaction_id,
      blockNumber: tx.block_number,
      blockTimestamp: tx.block_timestamp,
      contractAddress: tx.token_info.address,
      toAddress: tx.to,
      fromAddress: tx.from,
      amount: parseInt(tx.value) / Math.pow(10, tx.token_info.decimals),
      tokenName: tx.token_info.symbol,
      confirmed: tx.block_number > 0,
      data: tx.data // Memo/reference code if available
    }));
  } catch (error) {
    console.error('Error fetching Tron transactions:', error);
    return [];
  }
}

/**
 * Process a transaction and update the ledger
 */
async function processTransaction(supabase: import('@supabase/supabase-js').SupabaseClient<Database>, tx: TronTransaction, platformAddress: string) {
  try {
    // Check if this transaction is a deposit to our platform wallet
    if (tx.toAddress !== platformAddress || tx.tokenName !== 'USDT' || !tx.confirmed) {
      return;
    }
    
    // Check if we've already processed this transaction
    const existingTx = await getTransactionByHash(tx.txID);
    if (existingTx) {
      // If it's pending, check if it has enough confirmations now
      if (existingTx.status === 'pending') {
        const currentBlock = await getCurrentTronBlock();
        if (currentBlock - tx.blockNumber >= CONFIRMATION_BLOCKS) {
          await updateTransactionStatus(existingTx.id, 'completed', tx.txID);
          
          // Update user balance if we can identify the user
          if (existingTx.user_id) {
            await supabase.rpc('add_to_crypto_balance', {
              p_user_id: existingTx.user_id,
              p_currency: 'USDT',
              p_amount: tx.amount
            });
          }
        }
      }
      return;
    }
    
    // This is a new transaction - try to identify the user from memo/data
    let userId = null;
    if (tx.data) {
      // Extract user ID or reference code from the transaction data
      // This depends on your implementation - could be a memo field, reference code, etc.
      userId = extractUserIdFromMemo(tx.data);
    }
    
    // Record the transaction in our ledger
    const status = tx.blockNumber > 0 ? 'pending' : 'completed';
    await recordTransaction(
      userId,
      'deposit',
      tx.amount,
      'USDT',
      status,
      tx.txID,
      { blockNumber: tx.blockNumber, timestamp: tx.blockTimestamp }
    );
    
    // If we have enough confirmations, mark as completed immediately
    const currentBlock = await getCurrentTronBlock();
    if (currentBlock - tx.blockNumber >= CONFIRMATION_BLOCKS) {
      const newTx = await getTransactionByHash(tx.txID);
      if (newTx) {
        await updateTransactionStatus(newTx.id, 'completed', tx.txID);
        
        // Update user balance if we identified the user
        if (userId) {
          await supabase.rpc('add_to_crypto_balance', {
            p_user_id: userId,
            p_currency: 'USDT',
            p_amount: tx.amount
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}

/**
 * Get the current block number on Tron
 */
async function getCurrentTronBlock(): Promise<number> {
  try {
    const response = await fetch(`${TRONGRID_API_URL}/wallet/getnowblock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': TRONGRID_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`TronGrid API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.block_header.raw_data.number;
  } catch (error) {
    console.error('Error getting current Tron block:', error);
    return 0;
  }
}

/**
 * Extract user ID from transaction memo/data
 * This is a simplified example - implement according to your reference code system
 */
function extractUserIdFromMemo(data: string): string | null {
  try {
    // Example: If data is in format "REF:user_id"
    if (data.startsWith('REF:')) {
      return data.substring(4);
    }
    return null;
  } catch (error) {
    console.error('Error extracting user ID from memo:', error);
    return null;
  }
}
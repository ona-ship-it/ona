import { createHash } from 'crypto';

// Interface for transaction data
interface Transaction {
  id: string;
  hash: string;
  amount: number;
  sender: string;
  recipient: string;
  timestamp: number;
}

// In-memory store for processed transactions (in production, use a database)
const processedTransactions = new Set<string>();

/**
 * Validates a transaction hash to prevent tampering
 * @param transaction Transaction data
 * @returns Boolean indicating if hash is valid
 */
export function validateTransactionHash(transaction: Omit<Transaction, 'hash'>, providedHash: string): boolean {
  // Recreate the hash from transaction data to verify integrity
  const calculatedHash = createHash('sha256')
    .update(`${transaction.id}${transaction.amount}${transaction.sender}${transaction.recipient}${transaction.timestamp}`)
    .digest('hex');
    
  // Compare with the provided hash
  return calculatedHash === providedHash;
}

/**
 * Checks if a transaction has already been processed to prevent replay attacks
 * @param transactionHash The transaction hash to check
 * @returns Boolean indicating if transaction is unique
 */
export function isUniqueTransaction(transactionHash: string): boolean {
  if (processedTransactions.has(transactionHash)) {
    return false;
  }
  return true;
}

/**
 * Records a transaction as processed to prevent future replay
 * @param transactionHash The transaction hash to record
 */
export function recordTransaction(transactionHash: string): void {
  processedTransactions.add(transactionHash);
}

/**
 * Verifies and processes a payment transaction
 * @param transaction The transaction to verify
 * @returns Boolean indicating successful verification
 */
export function verifyPayment(transaction: Transaction): boolean {
  // Step 1: Validate the transaction hash
  const { hash, ...transactionData } = transaction;
  if (!validateTransactionHash(transactionData, hash)) {
    throw new Error('Invalid transaction hash');
  }
  
  // Step 2: Check for replay attacks
  if (!isUniqueTransaction(transaction.hash)) {
    throw new Error('Transaction already processed');
  }
  
  // Step 3: Record the transaction to prevent future replays
  recordTransaction(transaction.hash);
  
  // Additional validation could be added here (e.g., checking balance)
  
  return true;
}
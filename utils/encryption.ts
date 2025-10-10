import CryptoJS from 'crypto-js';

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'REPLACE_WITH_STRONG_KEY_IN_PRODUCTION';

/**
 * Encrypts sensitive data like wallet private keys
 * @param plaintext The sensitive data to encrypt
 * @returns Encrypted string
 */
export function encryptData(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts encrypted data
 * @param ciphertext The encrypted data
 * @returns Decrypted string
 */
export function decryptData(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Safely stores a wallet private key
 * @param userId User ID
 * @param privateKey Private key to store
 * @returns Encrypted key identifier
 */
export async function storeWalletKey(userId: string, privateKey: string): Promise<string> {
  // Encrypt the private key
  const encryptedKey = encryptData(privateKey);
  
  // In a real implementation, you would store this in a secure database
  // with the userId as a reference
  
  // Return a reference ID (not the actual encrypted key in production)
  return `key_${userId}`;
}

/**
 * Retrieves and decrypts a stored wallet key
 * @param userId User ID
 * @param keyId Key identifier
 * @returns Decrypted private key
 */
export async function retrieveWalletKey(userId: string, keyId: string): Promise<string> {
  // In a real implementation, you would retrieve the encrypted key from a database
  // using the userId and keyId
  
  // This is a placeholder - in production, never return the actual private key
  // to API responses, only use it for signing transactions server-side
  throw new Error('Private keys should never be exposed in API responses');
}
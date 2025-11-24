import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a private key using AES-256-GCM encryption
 * @param plaintext - The private key to encrypt
 * @param passphrase - The encryption passphrase
 * @returns Encrypted string in format: iv:tag:ciphertext
 */
export function encryptPrivateKey(plaintext: string, passphrase: string): string {
  try {
    // Generate random IV (12 bytes for GCM)
    const iv = crypto.randomBytes(12);
    
    // Create key from passphrase
    const key = crypto.createHash('sha256').update(passphrase).digest();
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the plaintext
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Return in format: iv:tag:ciphertext
    return `${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a private key using AES-256-GCM decryption
 * @param encryptedData - The encrypted string in format: iv:tag:ciphertext
 * @param passphrase - The decryption passphrase
 * @returns Decrypted private key
 */
export function decryptPrivateKey(encryptedData: string, passphrase: string): string {
  try {
    // Split the encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format. Expected format: iv:tag:ciphertext');
    }
    
    const [ivHex, tagHex, ciphertext] = parts;
    
    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    // Create key from passphrase
    const key = crypto.createHash('sha256').update(passphrase).digest();
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt the ciphertext
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a secure random passphrase for encryption
 * @param length - Length of the passphrase (default: 32)
 * @returns Random hex string
 */
export function generateSecurePassphrase(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validates that an encrypted string has the correct format
 * @param encryptedData - The encrypted string to validate
 * @returns True if format is valid
 */
export function validateEncryptedFormat(encryptedData: string): boolean {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) return false;
  
  const [ivHex, tagHex, ciphertext] = parts;
  
  // Validate hex strings
  const hexRegex = /^[0-9a-fA-F]+$/;
  return (
    hexRegex.test(ivHex) &&
    hexRegex.test(tagHex) &&
    hexRegex.test(ciphertext) &&
    ivHex.length === 24 && // 12 bytes = 24 hex chars
    tagHex.length === 32   // 16 bytes = 32 hex chars
  );
}

/**
 * Securely compares two strings to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Derives a deterministic seed from user ID and salt
 * WARNING: This is for MVP purposes. For production, use proper HD wallet derivation
 * @param userId - User's unique identifier
 * @param salt - Secret salt from environment
 * @returns Deterministic seed as hex string
 */
export function deriveDeterministicSeed(userId: string, salt: string): string {
  if (!userId || !salt) {
    throw new Error('User ID and salt are required for seed derivation');
  }
  
  // Create deterministic seed using HMAC-SHA256
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(userId);
  return hmac.digest('hex');
}

/**
 * Generates a secure random salt for key derivation
 * @returns Random salt as hex string
 */
export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}
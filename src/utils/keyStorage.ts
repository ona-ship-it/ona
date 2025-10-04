import crypto from 'crypto';

/**
 * Secure key storage utility
 * For production, consider using a proper KMS solution like AWS KMS, GCP KMS, or HashiCorp Vault
 */

// AES-256 encryption for private keys
export function encryptKey(privateKey: string, passphrase: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Store salt and IV with the encrypted data
  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
}

// Decrypt a private key
export function decryptKey(encryptedData: string, passphrase: string): string {
  const [saltHex, ivHex, encryptedHex] = encryptedData.split(':');
  
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha512');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Get platform key from environment (encrypted)
export function getPlatformKeyEncrypted(): string {
  const encryptedKey = process.env.PLATFORM_ENCRYPTED_KEY;
  if (!encryptedKey) {
    throw new Error('Platform encrypted key not found in environment variables');
  }
  return encryptedKey;
}

// Decrypt platform key using admin passphrase
export function decryptPlatformKey(adminPassphrase: string): string {
  const encryptedKey = getPlatformKeyEncrypted();
  return decryptKey(encryptedKey, adminPassphrase);
}

// Generate a new key pair (for admin use only)
export function generateKeyPair() {
  // This is a simplified example - in production, use proper crypto libraries
  // For Tron/USDT, you would use TronWeb or similar library
  const privateKey = crypto.randomBytes(32).toString('hex');
  // Derive public key/address from private key (simplified)
  const publicKey = crypto.createHash('sha256').update(privateKey).digest('hex');
  const address = `T${publicKey.substring(0, 40)}`;
  
  return {
    privateKey,
    publicKey,
    address
  };
}
import { Wallet, HDNodeWallet } from 'ethers';
import crypto from 'crypto';
import { encryptPrivateKey, decryptPrivateKey, deriveDeterministicSeed } from '../utils/encryption';
import { supabase } from '../lib/supabaseClient';

// Re-export encryption utilities for use by other services
export { decryptPrivateKey };

export interface WalletCreationResult {
  address: string;
  encryptedPrivateKey: string;
  network: string;
}

export interface UserWallet {
  id: string;
  user_id: string;
  network: string;
  address: string;
  encrypted_private_key: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlatformWallet {
  id: string;
  user_id: string;
  balance_fiat: number;
  balance_tickets: number;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Creates a deterministic Ethereum wallet for a user
 * @param userId - User's unique identifier
 * @param network - Blockchain network (default: 'ethereum')
 * @returns Wallet creation result with address and encrypted private key
 */
export async function createUserWallet(
  userId: string, 
  network: string = 'ethereum'
): Promise<WalletCreationResult> {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get encryption passphrase from environment
    const walletPassphrase = process.env.WALLET_PASSPHRASE;
    if (!walletPassphrase) {
      throw new Error('WALLET_PASSPHRASE environment variable is required');
    }

    // Get secret salt from environment
    const secretSalt = process.env.SECRET_SALT;
    if (!secretSalt) {
      throw new Error('SECRET_SALT environment variable is required');
    }

    // Check if wallet already exists for this user and network
    const { data: existingWallet } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('network', network)
      .single();

    if (existingWallet) {
      throw new Error(`Wallet already exists for user ${userId} on ${network}`);
    }

    // Generate deterministic seed
    const seed = deriveDeterministicSeed(userId, secretSalt);
    
    // Create wallet from deterministic seed
    // Using HD wallet derivation for better security
    const hdNode = HDNodeWallet.fromSeed(`0x${seed}`);
    const wallet = hdNode.derivePath("m/44'/60'/0'/0/0"); // Standard Ethereum derivation path

    // Encrypt the private key
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey, walletPassphrase);

    // Store in database
    const { data: cryptoWallet, error } = await supabase
      .from('crypto_wallets')
      .insert({
        user_id: userId,
        network,
        address: wallet.address,
        encrypted_private_key: encryptedPrivateKey
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store crypto wallet: ${error.message}`);
    }

    // Also create or update the platform wallet (fiat/tickets)
    await createOrUpdatePlatformWallet(userId);

    return {
      address: wallet.address,
      encryptedPrivateKey,
      network
    };
  } catch (error) {
    throw new Error(`Wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates or updates a platform wallet for fiat and ticket balances
 * @param userId - User's unique identifier
 * @returns Platform wallet data
 */
export async function createOrUpdatePlatformWallet(userId: string): Promise<PlatformWallet> {
  try {
    // Check if platform wallet already exists
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingWallet) {
      return existingWallet;
    }

    // Create new platform wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        balance_fiat: 0,
        balance_tickets: 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create platform wallet: ${error.message}`);
    }

    return wallet;
  } catch (error) {
    throw new Error(`Platform wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves a user's crypto wallet
 * @param userId - User's unique identifier
 * @param network - Blockchain network (default: 'ethereum')
 * @returns User's crypto wallet data
 */
export async function getUserCryptoWallet(
  userId: string, 
  network: string = 'ethereum'
): Promise<UserWallet | null> {
  try {
    const { data: wallet, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('network', network)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to retrieve crypto wallet: ${error.message}`);
    }

    return wallet;
  } catch (error) {
    throw new Error(`Crypto wallet retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves a user's platform wallet
 * @param userId - User's unique identifier
 * @returns User's platform wallet data
 */
export async function getUserPlatformWallet(userId: string): Promise<PlatformWallet | null> {
  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to retrieve platform wallet: ${error.message}`);
    }

    return wallet;
  } catch (error) {
    throw new Error(`Platform wallet retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts a user's private key (use with extreme caution)
 * @param userId - User's unique identifier
 * @param network - Blockchain network (default: 'ethereum')
 * @returns Decrypted private key
 */
export async function decryptUserPrivateKey(
  userId: string, 
  network: string = 'ethereum'
): Promise<string> {
  try {
    // Get encryption passphrase from environment
    const walletPassphrase = process.env.WALLET_PASSPHRASE;
    if (!walletPassphrase) {
      throw new Error('WALLET_PASSPHRASE environment variable is required');
    }

    // Get user's crypto wallet
    const wallet = await getUserCryptoWallet(userId, network);
    if (!wallet) {
      throw new Error(`No crypto wallet found for user ${userId} on ${network}`);
    }

    if (!wallet.encrypted_private_key) {
      throw new Error(`No encrypted private key found for user ${userId} on ${network}`);
    }

    // Decrypt the private key
    const privateKey = decryptPrivateKey(wallet.encrypted_private_key, walletPassphrase);
    
    return privateKey;
  } catch (error) {
    throw new Error(`Private key decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a wallet instance from user's encrypted private key
 * @param userId - User's unique identifier
 * @param network - Blockchain network (default: 'ethereum')
 * @returns Ethers Wallet instance
 */
export async function createWalletInstance(
  userId: string, 
  network: string = 'ethereum'
): Promise<Wallet> {
  try {
    const privateKey = await decryptUserPrivateKey(userId, network);
    return new Wallet(privateKey);
  } catch (error) {
    throw new Error(`Wallet instance creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initializes wallets for a new user (both crypto and platform)
 * @param userId - User's unique identifier
 * @param networks - Array of networks to create wallets for (default: ['ethereum'])
 * @returns Array of wallet creation results
 */
export async function initializeUserWallets(
  userId: string,
  networks: string[] = ['ethereum']
): Promise<WalletCreationResult[]> {
  try {
    const results: WalletCreationResult[] = [];
    
    for (const network of networks) {
      const result = await createUserWallet(userId, network);
      results.push(result);
    }
    
    return results;
  } catch (error) {
    throw new Error(`Wallet initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that a wallet address belongs to a user
 * @param userId - User's unique identifier
 * @param address - Wallet address to validate
 * @param network - Blockchain network (default: 'ethereum')
 * @returns True if address belongs to user
 */
export async function validateUserWalletAddress(
  userId: string,
  address: string,
  network: string = 'ethereum'
): Promise<boolean> {
  try {
    const wallet = await getUserCryptoWallet(userId, network);
    return wallet?.address.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
}
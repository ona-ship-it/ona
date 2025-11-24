/**
 * Wallet Services Startup
 * 
 * Initializes and starts all wallet services when the application boots up.
 * This should be called during the application initialization process.
 */

import { initializeWalletServiceManager, WalletServiceManager } from '../services/walletServiceManager';

interface WalletStartupConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  rpcUrl: string;
  usdtContractAddress: string;
  hotWalletPrivateKey: string;
  encryptionKey: string;
  networkName: string;
  chainId: number;
  autoStart?: boolean;
}

let isInitialized = false;
let walletManager: WalletServiceManager | null = null;

/**
 * Initialize wallet services
 */
export async function initializeWalletServices(config: WalletStartupConfig): Promise<void> {
  if (isInitialized) {
    console.log('🔄 Wallet services already initialized');
    return;
  }

  try {
    console.log('🚀 Starting wallet services initialization...');

    // Validate configuration
    validateConfig(config);

    // Initialize wallet service manager
    walletManager = initializeWalletServiceManager({
      supabaseUrl: config.supabaseUrl,
      supabaseServiceKey: config.supabaseServiceKey,
      rpcUrl: config.rpcUrl,
      usdtContractAddress: config.usdtContractAddress,
      hotWalletPrivateKey: config.hotWalletPrivateKey,
      encryptionKey: config.encryptionKey,
      networkName: config.networkName,
      chainId: config.chainId
    });

    // Initialize all services
    await walletManager.initialize();

    // Auto-start services if configured
    if (config.autoStart !== false) {
      await walletManager.startAll();
    }

    isInitialized = true;
    console.log('🎉 Wallet services initialization completed successfully');

  } catch (error) {
    console.error('❌ Failed to initialize wallet services:', error);
    throw error;
  }
}

/**
 * Get the initialized wallet manager
 */
export function getInitializedWalletManager(): WalletServiceManager | null {
  return walletManager;
}

/**
 * Check if wallet services are initialized
 */
export function isWalletServicesInitialized(): boolean {
  return isInitialized && walletManager !== null;
}

/**
 * Gracefully shutdown wallet services
 */
export async function shutdownWalletServices(): Promise<void> {
  if (!walletManager) {
    console.log('🔄 Wallet services not initialized, nothing to shutdown');
    return;
  }

  try {
    console.log('⏹️ Shutting down wallet services...');
    await walletManager.stopAll();
    walletManager = null;
    isInitialized = false;
    console.log('✅ Wallet services shutdown completed');

  } catch (error) {
    console.error('❌ Error during wallet services shutdown:', error);
    throw error;
  }
}

/**
 * Validate startup configuration
 */
function validateConfig(config: WalletStartupConfig): void {
  const requiredFields = [
    'supabaseUrl',
    'supabaseServiceKey',
    'rpcUrl',
    'usdtContractAddress',
    'hotWalletPrivateKey',
    'encryptionKey',
    'networkName',
    'chainId'
  ];

  for (const field of requiredFields) {
    if (!config[field as keyof WalletStartupConfig]) {
      throw new Error(`Missing required configuration field: ${field}`);
    }
  }

  // Validate URLs
  try {
    new URL(config.supabaseUrl);
    new URL(config.rpcUrl);
  } catch (error) {
    throw new Error('Invalid URL in configuration');
  }

  // Validate chain ID
  if (typeof config.chainId !== 'number' || config.chainId <= 0) {
    throw new Error('Invalid chain ID');
  }

  // Validate private key format (basic check)
  // Accept either plain private key (0x...) or encrypted format (iv:authTag:encrypted)
  const isPlainKey = config.hotWalletPrivateKey.startsWith('0x') && config.hotWalletPrivateKey.length === 66;
  const isEncryptedKey = config.hotWalletPrivateKey.split(':').length === 3;
  
  if (!isPlainKey && !isEncryptedKey) {
    throw new Error('Invalid hot wallet private key format - must be either plain (0x...) or encrypted (iv:authTag:encrypted)');
  }

  // Validate contract address format (basic check)
  if (!config.usdtContractAddress.startsWith('0x') || config.usdtContractAddress.length !== 42) {
    throw new Error('Invalid USDT contract address format');
  }
}

/**
 * Create configuration from environment variables
 */
export function createConfigFromEnv(): WalletStartupConfig {
  const isTestnet = !!process.env.TESTNET_RPC_URL;

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    rpcUrl: process.env.RPC_URL || process.env.ETHEREUM_RPC_URL || process.env.TESTNET_RPC_URL || '',
    usdtContractAddress: process.env.USDT_CONTRACT_ADDRESS || process.env.TESTNET_USDT_ADDRESS || '',
    hotWalletPrivateKey: process.env.HOT_WALLET_PRIVATE_KEY || process.env.TESTNET_HOT_WALLET_PRIVATE_KEY || '',
    encryptionKey: process.env.ENCRYPTION_KEY || process.env.WALLET_ENCRYPTION_KEY || '',
    networkName: process.env.NETWORK_NAME || (isTestnet ? 'sepolia' : 'ethereum'),
    chainId: parseInt(process.env.CHAIN_ID || (isTestnet ? '11155111' : '1')),
    autoStart: process.env.WALLET_AUTO_START !== 'false'
  };
}

/**
 * Initialize wallet services from environment variables
 */
export async function initializeFromEnv(): Promise<void> {
  const config = createConfigFromEnv();
  await initializeWalletServices(config);
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('📡 Received SIGTERM, shutting down wallet services...');
    await shutdownWalletServices();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('📡 Received SIGINT, shutting down wallet services...');
    await shutdownWalletServices();
    process.exit(0);
  });
}

export default {
  initializeWalletServices,
  getInitializedWalletManager,
  isWalletServicesInitialized,
  shutdownWalletServices,
  createConfigFromEnv,
  initializeFromEnv
};
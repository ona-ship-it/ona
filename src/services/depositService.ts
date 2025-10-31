import { ethers } from 'ethers';
import { supabase } from '../lib/supabaseClient';
import { createLedgerEntry } from './ledgerService';
import { validateBalanceIncrease } from './limitsService';
import { getUserCryptoWallet, decryptPrivateKey } from './walletService';

export interface DepositTransaction {
  id: string;
  userId: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  currency: string;
  network: string;
  blockNumber: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'processed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface DepositProcessingResult {
  success: boolean;
  txHash: string;
  amount: number;
  userId?: string;
  error?: string;
}

// Minimum confirmations required for different networks
const CONFIRMATION_REQUIREMENTS = {
  ethereum: 12,
  polygon: 20,
  bsc: 15
};

// Supported ERC-20 token contracts (USDT addresses)
const TOKEN_CONTRACTS = {
  ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
  polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',   // USDT on Polygon
  bsc: '0x55d398326f99059fF775485246999027B3197955'        // USDT on BSC
};

/**
 * Creates a provider for the specified network
 * @param network - Network name (ethereum, polygon, bsc)
 * @returns Ethers provider instance
 */
function createProvider(network: string): ethers.JsonRpcProvider {
  const rpcUrls = {
    ethereum: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    polygon: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
    bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org'
  };

  const rpcUrl = rpcUrls[network as keyof typeof rpcUrls];
  if (!rpcUrl) {
    throw new Error(`Unsupported network: ${network}`);
  }

  return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Creates USDT token contract instance
 * @param network - Network name
 * @param provider - Ethers provider
 * @returns Token contract instance
 */
function createTokenContract(network: string, provider: ethers.JsonRpcProvider): ethers.Contract {
  const contractAddress = TOKEN_CONTRACTS[network as keyof typeof TOKEN_CONTRACTS];
  if (!contractAddress) {
    throw new Error(`USDT contract not configured for network: ${network}`);
  }

  // ERC-20 ABI for USDT (minimal)
  const abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
    'event Transfer(address indexed from, address indexed to, uint256 value)'
  ];

  return new ethers.Contract(contractAddress, abi, provider);
}

/**
 * Records a deposit transaction in the database
 * @param depositData - Deposit transaction data
 * @returns Created deposit record
 */
export async function recordDepositTransaction(depositData: {
  userId: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  currency: string;
  network: string;
  blockNumber: number;
  confirmations: number;
  status: string;
}): Promise<DepositTransaction> {
  try {
    const { data, error } = await supabase
      .from('deposit_transactions')
      .insert({
        user_id: depositData.userId,
        tx_hash: depositData.txHash,
        from_address: depositData.fromAddress,
        to_address: depositData.toAddress,
        amount: depositData.amount,
        currency: depositData.currency,
        network: depositData.network,
        block_number: depositData.blockNumber,
        confirmations: depositData.confirmations,
        status: depositData.status
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record deposit transaction: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      txHash: data.tx_hash,
      fromAddress: data.from_address,
      toAddress: data.to_address,
      amount: data.amount,
      currency: data.currency,
      network: data.network,
      blockNumber: data.block_number,
      confirmations: data.confirmations,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    throw new Error(`Deposit recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates deposit transaction status and confirmations
 * @param txHash - Transaction hash
 * @param updates - Fields to update
 * @returns Updated deposit record
 */
export async function updateDepositTransaction(
  txHash: string,
  updates: {
    confirmations?: number;
    status?: string;
    blockNumber?: number;
  }
): Promise<DepositTransaction> {
  try {
    const updateData: any = {};
    if (updates.confirmations !== undefined) updateData.confirmations = updates.confirmations;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.blockNumber !== undefined) updateData.block_number = updates.blockNumber;

    const { data, error } = await supabase
      .from('deposit_transactions')
      .update(updateData)
      .eq('tx_hash', txHash)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deposit transaction: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      txHash: data.tx_hash,
      fromAddress: data.from_address,
      toAddress: data.to_address,
      amount: data.amount,
      currency: data.currency,
      network: data.network,
      blockNumber: data.block_number,
      confirmations: data.confirmations,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    throw new Error(`Deposit update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Finds user by their wallet address
 * @param address - Wallet address
 * @param network - Network name
 * @returns User ID if found
 */
export async function findUserByAddress(address: string, network: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('user_id')
      .eq('address', address.toLowerCase())
      .eq('network', network)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to find user by address: ${error.message}`);
    }

    return data?.user_id || null;
  } catch (error) {
    console.error('Error finding user by address:', error);
    return null;
  }
}

/**
 * Monitors blockchain for incoming deposits to user addresses
 * @param network - Network to monitor
 * @param fromBlock - Starting block number
 * @returns Array of detected deposits
 */
export async function scanForDeposits(
  network: string,
  fromBlock: number
): Promise<DepositTransaction[]> {
  try {
    const provider = createProvider(network);
    const tokenContract = createTokenContract(network, provider);
    const currentBlock = await provider.getBlockNumber();

    // Get all user addresses for this network
    const { data: wallets, error } = await supabase
      .from('crypto_wallets')
      .select('user_id, address')
      .eq('network', network);

    if (error) {
      throw new Error(`Failed to get user wallets: ${error.message}`);
    }

    const userAddresses = new Map(
      wallets.map(wallet => [wallet.address.toLowerCase(), wallet.user_id])
    );

    // Scan for Transfer events to user addresses
    const filter = tokenContract.filters.Transfer(null, null);
    const events = await tokenContract.queryFilter(filter, fromBlock, currentBlock);

    const deposits: DepositTransaction[] = [];

    for (const event of events) {
      if (!event.args) continue;

      const [from, to, value] = event.args;
      const toAddress = to.toLowerCase();
      const userId = userAddresses.get(toAddress);

      if (userId) {
        // This is a deposit to one of our user addresses
        const amount = ethers.formatUnits(value, 6); // USDT has 6 decimals
        const confirmations = currentBlock - (event.blockNumber || 0);

        // Check if we already recorded this transaction
        const { data: existing } = await supabase
          .from('deposit_transactions')
          .select('id')
          .eq('tx_hash', event.transactionHash)
          .single();

        if (!existing) {
          const deposit = await recordDepositTransaction({
            userId,
            txHash: event.transactionHash || '',
            fromAddress: from,
            toAddress: to,
            amount,
            currency: 'USDT',
            network,
            blockNumber: event.blockNumber || 0,
            confirmations,
            status: confirmations >= CONFIRMATION_REQUIREMENTS[network as keyof typeof CONFIRMATION_REQUIREMENTS] 
              ? 'confirmed' : 'pending'
          });

          deposits.push(deposit);
        }
      }
    }

    return deposits;
  } catch (error) {
    throw new Error(`Deposit scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes confirmed deposits by crediting user balances
 * @param txHash - Transaction hash to process
 * @returns Processing result
 */
export async function processConfirmedDeposit(txHash: string): Promise<DepositProcessingResult> {
  try {
    // Get deposit transaction
    const { data: deposit, error } = await supabase
      .from('deposit_transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .eq('status', 'confirmed')
      .single();

    if (error) {
      return {
        success: false,
        txHash,
        amount: 0,
        error: `Deposit not found or not confirmed: ${error.message}`
      };
    }

    const amount = parseFloat(deposit.amount);

    // Validate balance increase against user limits
    const balanceValidation = await validateBalanceIncrease(
      deposit.user_id,
      amount,
      deposit.currency
    );

    if (!balanceValidation.isValid) {
      // Update status to failed
      await updateDepositTransaction(txHash, { status: 'failed' });
      
      return {
        success: false,
        txHash,
        amount,
        userId: deposit.user_id,
        error: balanceValidation.reason
      };
    }

    // Create ledger entry for the deposit
    await createLedgerEntry(
      deposit.user_id,
      amount,
      'deposit',
      deposit.currency,
      txHash
    );

    // Update deposit status to processed
    await updateDepositTransaction(txHash, { status: 'processed' });

    return {
      success: true,
      txHash,
      amount,
      userId: deposit.user_id
    };
  } catch (error) {
    return {
      success: false,
      txHash,
      amount: 0,
      error: `Deposit processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets pending deposits for a user
 * @param userId - User's unique identifier
 * @param network - Network name (optional)
 * @returns Array of pending deposits
 */
export async function getPendingDeposits(
  userId: string,
  network?: string
): Promise<DepositTransaction[]> {
  try {
    let query = supabase
      .from('deposit_transactions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false });

    if (network) {
      query = query.eq('network', network);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get pending deposits: ${error.message}`);
    }

    return data.map(deposit => ({
      id: deposit.id,
      userId: deposit.user_id,
      txHash: deposit.tx_hash,
      fromAddress: deposit.from_address,
      toAddress: deposit.to_address,
      amount: deposit.amount,
      currency: deposit.currency,
      network: deposit.network,
      blockNumber: deposit.block_number,
      confirmations: deposit.confirmations,
      status: deposit.status,
      createdAt: deposit.created_at,
      updatedAt: deposit.updated_at
    }));
  } catch (error) {
    throw new Error(`Pending deposits retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sweeps funds from user wallets to hot wallet
 * @param network - Network to sweep
 * @param hotWalletAddress - Hot wallet address
 * @returns Array of sweep transaction hashes
 */
export async function sweepUserWallets(
  network: string,
  hotWalletAddress: string
): Promise<string[]> {
  try {
    const provider = createProvider(network);
    const tokenContract = createTokenContract(network, provider);
    const sweepTxHashes: string[] = [];

    // Get all user wallets for this network
    const { data: wallets, error } = await supabase
      .from('crypto_wallets')
      .select('user_id, address, encrypted_private_key')
      .eq('network', network)
      .not('encrypted_private_key', 'is', null);

    if (error) {
      throw new Error(`Failed to get user wallets: ${error.message}`);
    }

    for (const wallet of wallets) {
      try {
        // Check balance
        const balance = await tokenContract.balanceOf(wallet.address);
        const balanceFormatted = parseFloat(ethers.formatUnits(balance, 6));

        // Only sweep if balance is significant (> 1 USDT)
        if (balanceFormatted > 1) {
          // Decrypt private key
          const privateKey = decryptPrivateKey(wallet.encrypted_private_key);
          const userWallet = new ethers.Wallet(privateKey, provider);

          // Check ETH balance for gas
          const ethBalance = await provider.getBalance(wallet.address);
          const gasPrice = await provider.getFeeData();
          const estimatedGas = 65000n; // Approximate gas for ERC-20 transfer
          const gasRequired = estimatedGas * (gasPrice.gasPrice || 0n);

          if (ethBalance < gasRequired) {
            console.warn(`Insufficient ETH for gas in wallet ${wallet.address}`);
            continue;
          }

          // Create token contract with user's wallet
          const userTokenContract = tokenContract.connect(userWallet);

          // Transfer tokens to hot wallet
          const tx = await userTokenContract.transfer(hotWalletAddress, balance);
          await tx.wait();

          sweepTxHashes.push(tx.hash);
          console.log(`Swept ${balanceFormatted} USDT from ${wallet.address} to ${hotWalletAddress}`);
        }
      } catch (error) {
        console.error(`Failed to sweep wallet ${wallet.address}:`, error);
        continue;
      }
    }

    return sweepTxHashes;
  } catch (error) {
    throw new Error(`Wallet sweep failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates confirmation counts for pending deposits
 * @param network - Network to update
 * @returns Number of deposits updated
 */
export async function updateDepositConfirmations(network: string): Promise<number> {
  try {
    const provider = createProvider(network);
    const currentBlock = await provider.getBlockNumber();

    // Get pending deposits for this network
    const { data: deposits, error } = await supabase
      .from('deposit_transactions')
      .select('*')
      .eq('network', network)
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Failed to get pending deposits: ${error.message}`);
    }

    let updatedCount = 0;
    const requiredConfirmations = CONFIRMATION_REQUIREMENTS[network as keyof typeof CONFIRMATION_REQUIREMENTS];

    for (const deposit of deposits) {
      const confirmations = currentBlock - deposit.block_number;
      
      if (confirmations !== deposit.confirmations) {
        const newStatus = confirmations >= requiredConfirmations ? 'confirmed' : 'pending';
        
        await updateDepositTransaction(deposit.tx_hash, {
          confirmations,
          status: newStatus
        });
        
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (error) {
    throw new Error(`Confirmation update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
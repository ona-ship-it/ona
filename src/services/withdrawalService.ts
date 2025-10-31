import { ethers } from 'ethers';
import { supabase } from '../lib/supabaseClient';
import { createLedgerEntry, getUserBalance } from './ledgerService';
import { validateDailyWithdrawalLimit, validateTransactionAmount } from './limitsService';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  toAddress: string;
  network: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  idempotencyKey: string;
  txHash?: string;
  gasUsed?: number;
  gasFee?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalProcessingResult {
  success: boolean;
  withdrawalId: string;
  txHash?: string;
  error?: string;
}

// Hot wallet configuration
const HOT_WALLET_CONFIG = {
  ethereum: {
    privateKey: process.env.HOT_WALLET_PRIVATE_KEY_ETH,
    rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    gasLimit: 65000,
    maxGasPrice: ethers.parseUnits('50', 'gwei')
  },
  polygon: {
    privateKey: process.env.HOT_WALLET_PRIVATE_KEY_POLYGON,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
    tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
    gasLimit: 65000,
    maxGasPrice: ethers.parseUnits('100', 'gwei')
  },
  bsc: {
    privateKey: process.env.HOT_WALLET_PRIVATE_KEY_BSC,
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    tokenAddress: '0x55d398326f99059fF775485246999027B3197955', // USDT
    gasLimit: 65000,
    maxGasPrice: ethers.parseUnits('10', 'gwei')
  }
};

/**
 * Creates a withdrawal request
 * @param userId - User's unique identifier
 * @param amount - Withdrawal amount
 * @param toAddress - Destination address
 * @param currency - Currency code (default: 'USDT')
 * @param network - Network name (default: 'ethereum')
 * @param idempotencyKey - Unique key to prevent duplicate requests
 * @returns Created withdrawal request
 */
export async function createWithdrawalRequest(
  userId: string,
  amount: number,
  toAddress: string,
  currency: string = 'USDT',
  network: string = 'ethereum',
  idempotencyKey: string
): Promise<WithdrawalRequest> {
  try {
    // Validate amount is positive
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    // Validate address format
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid destination address');
    }

    // Check for duplicate idempotency key
    const { data: existing } = await supabase
      .from('withdrawals')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existing) {
      throw new Error('Duplicate withdrawal request');
    }

    // Validate user has sufficient balance
    const currentBalance = await getUserBalance(userId, currency);
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Validate transaction amount limits
    const amountValidation = await validateTransactionAmount(userId, amount, currency);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.reason || 'Amount exceeds limits');
    }

    // Validate daily withdrawal limits
    const dailyValidation = await validateDailyWithdrawalLimit(userId, amount, currency);
    if (!dailyValidation.isValid) {
      throw new Error(dailyValidation.reason || 'Daily withdrawal limit exceeded');
    }

    // Create withdrawal request
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount: amount.toString(),
        currency,
        to_address: toAddress,
        network,
        status: 'pending',
        idempotency_key: idempotencyKey
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create withdrawal request: ${error.message}`);
    }

    // Create debit ledger entry to reserve funds
    await createLedgerEntry(
      userId,
      -amount,
      'withdrawal',
      currency,
      data.id
    );

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      toAddress: data.to_address,
      network: data.network,
      status: data.status,
      idempotencyKey: data.idempotency_key,
      txHash: data.tx_hash,
      gasUsed: data.gas_used,
      gasFee: data.gas_fee ? parseFloat(data.gas_fee) : undefined,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    throw new Error(`Withdrawal request creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates withdrawal request status
 * @param withdrawalId - Withdrawal request ID
 * @param updates - Fields to update
 * @returns Updated withdrawal request
 */
export async function updateWithdrawalRequest(
  withdrawalId: string,
  updates: {
    status?: string;
    txHash?: string;
    gasUsed?: number;
    gasFee?: number;
    errorMessage?: string;
  }
): Promise<WithdrawalRequest> {
  try {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.txHash !== undefined) updateData.tx_hash = updates.txHash;
    if (updates.gasUsed !== undefined) updateData.gas_used = updates.gasUsed;
    if (updates.gasFee !== undefined) updateData.gas_fee = updates.gasFee.toString();
    if (updates.errorMessage !== undefined) updateData.error_message = updates.errorMessage;

    const { data, error } = await supabase
      .from('withdrawals')
      .update(updateData)
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update withdrawal request: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      toAddress: data.to_address,
      network: data.network,
      status: data.status,
      idempotencyKey: data.idempotency_key,
      txHash: data.tx_hash,
      gasUsed: data.gas_used,
      gasFee: data.gas_fee ? parseFloat(data.gas_fee) : undefined,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    throw new Error(`Withdrawal update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets pending withdrawal requests
 * @param network - Network to filter by (optional)
 * @param limit - Maximum number of requests to return
 * @returns Array of pending withdrawal requests
 */
export async function getPendingWithdrawals(
  network?: string,
  limit: number = 50
): Promise<WithdrawalRequest[]> {
  try {
    let query = supabase
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (network) {
      query = query.eq('network', network);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get pending withdrawals: ${error.message}`);
    }

    return data.map(withdrawal => ({
      id: withdrawal.id,
      userId: withdrawal.user_id,
      amount: parseFloat(withdrawal.amount),
      currency: withdrawal.currency,
      toAddress: withdrawal.to_address,
      network: withdrawal.network,
      status: withdrawal.status,
      idempotencyKey: withdrawal.idempotency_key,
      txHash: withdrawal.tx_hash,
      gasUsed: withdrawal.gas_used,
      gasFee: withdrawal.gas_fee ? parseFloat(withdrawal.gas_fee) : undefined,
      errorMessage: withdrawal.error_message,
      createdAt: withdrawal.created_at,
      updatedAt: withdrawal.updated_at
    }));
  } catch (error) {
    throw new Error(`Pending withdrawals retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets user's withdrawal history
 * @param userId - User's unique identifier
 * @param limit - Maximum number of records to return
 * @param offset - Number of records to skip
 * @returns Array of withdrawal requests
 */
export async function getUserWithdrawals(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<WithdrawalRequest[]> {
  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get user withdrawals: ${error.message}`);
    }

    return data.map(withdrawal => ({
      id: withdrawal.id,
      userId: withdrawal.user_id,
      amount: parseFloat(withdrawal.amount),
      currency: withdrawal.currency,
      toAddress: withdrawal.to_address,
      network: withdrawal.network,
      status: withdrawal.status,
      idempotencyKey: withdrawal.idempotency_key,
      txHash: withdrawal.tx_hash,
      gasUsed: withdrawal.gas_used,
      gasFee: withdrawal.gas_fee ? parseFloat(withdrawal.gas_fee) : undefined,
      errorMessage: withdrawal.error_message,
      createdAt: withdrawal.created_at,
      updatedAt: withdrawal.updated_at
    }));
  } catch (error) {
    throw new Error(`User withdrawals retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes a withdrawal request by sending on-chain transaction
 * @param withdrawalId - Withdrawal request ID
 * @returns Processing result
 */
export async function processWithdrawal(withdrawalId: string): Promise<WithdrawalProcessingResult> {
  try {
    // Get withdrawal request
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('status', 'pending')
      .single();

    if (error) {
      return {
        success: false,
        withdrawalId,
        error: `Withdrawal not found or not pending: ${error.message}`
      };
    }

    // Update status to processing
    await updateWithdrawalRequest(withdrawalId, { status: 'processing' });

    const network = withdrawal.network;
    const config = HOT_WALLET_CONFIG[network as keyof typeof HOT_WALLET_CONFIG];

    if (!config || !config.privateKey) {
      await updateWithdrawalRequest(withdrawalId, {
        status: 'failed',
        errorMessage: `Hot wallet not configured for network: ${network}`
      });
      return {
        success: false,
        withdrawalId,
        error: `Hot wallet not configured for network: ${network}`
      };
    }

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const hotWallet = new ethers.Wallet(config.privateKey, provider);

    // Create token contract
    const tokenAbi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ];
    const tokenContract = new ethers.Contract(config.tokenAddress, tokenAbi, hotWallet);

    // Check hot wallet balance
    const hotWalletBalance = await tokenContract.balanceOf(hotWallet.address);
    const requiredAmount = ethers.parseUnits(withdrawal.amount, 6); // USDT has 6 decimals

    if (hotWalletBalance < requiredAmount) {
      await updateWithdrawalRequest(withdrawalId, {
        status: 'failed',
        errorMessage: 'Insufficient hot wallet balance'
      });
      return {
        success: false,
        withdrawalId,
        error: 'Insufficient hot wallet balance'
      };
    }

    // Check ETH balance for gas
    const ethBalance = await provider.getBalance(hotWallet.address);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || config.maxGasPrice;
    const estimatedGasCost = BigInt(config.gasLimit) * gasPrice;

    if (ethBalance < estimatedGasCost) {
      await updateWithdrawalRequest(withdrawalId, {
        status: 'failed',
        errorMessage: 'Insufficient ETH for gas fees'
      });
      return {
        success: false,
        withdrawalId,
        error: 'Insufficient ETH for gas fees'
      };
    }

    // Send transaction
    const tx = await tokenContract.transfer(withdrawal.to_address, requiredAmount, {
      gasLimit: config.gasLimit,
      gasPrice: Math.min(Number(gasPrice), Number(config.maxGasPrice))
    });

    // Wait for confirmation
    const receipt = await tx.wait();

    if (receipt && receipt.status === 1) {
      // Transaction successful
      const gasFee = Number(receipt.gasUsed) * Number(receipt.gasPrice || gasPrice) / 1e18;

      await updateWithdrawalRequest(withdrawalId, {
        status: 'completed',
        txHash: tx.hash,
        gasUsed: Number(receipt.gasUsed),
        gasFee
      });

      return {
        success: true,
        withdrawalId,
        txHash: tx.hash
      };
    } else {
      // Transaction failed
      await updateWithdrawalRequest(withdrawalId, {
        status: 'failed',
        errorMessage: 'Transaction failed on blockchain'
      });

      return {
        success: false,
        withdrawalId,
        error: 'Transaction failed on blockchain'
      };
    }
  } catch (error) {
    // Update withdrawal status to failed
    await updateWithdrawalRequest(withdrawalId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      withdrawalId,
      error: `Withdrawal processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Cancels a pending withdrawal request
 * @param withdrawalId - Withdrawal request ID
 * @param userId - User's unique identifier (for authorization)
 * @returns Cancelled withdrawal request
 */
export async function cancelWithdrawal(
  withdrawalId: string,
  userId: string
): Promise<WithdrawalRequest> {
  try {
    // Get withdrawal request
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (error) {
      throw new Error(`Withdrawal not found or cannot be cancelled: ${error.message}`);
    }

    // Update status to cancelled
    const updatedWithdrawal = await updateWithdrawalRequest(withdrawalId, {
      status: 'cancelled'
    });

    // Reverse the debit ledger entry (credit back the amount)
    await createLedgerEntry(
      userId,
      parseFloat(withdrawal.amount),
      'credit',
      withdrawal.currency,
      withdrawalId
    );

    return updatedWithdrawal;
  } catch (error) {
    throw new Error(`Withdrawal cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes multiple pending withdrawals in batch
 * @param network - Network to process (optional)
 * @param maxCount - Maximum number of withdrawals to process
 * @returns Array of processing results
 */
export async function processPendingWithdrawals(
  network?: string,
  maxCount: number = 10
): Promise<WithdrawalProcessingResult[]> {
  try {
    const pendingWithdrawals = await getPendingWithdrawals(network, maxCount);
    const results: WithdrawalProcessingResult[] = [];

    for (const withdrawal of pendingWithdrawals) {
      try {
        const result = await processWithdrawal(withdrawal.id);
        results.push(result);

        // Add delay between transactions to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        results.push({
          success: false,
          withdrawalId: withdrawal.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Batch withdrawal processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets hot wallet balance for a network
 * @param network - Network name
 * @returns Hot wallet balance information
 */
export async function getHotWalletBalance(network: string): Promise<{
  network: string;
  address: string;
  ethBalance: number;
  tokenBalance: number;
  currency: string;
}> {
  try {
    const config = HOT_WALLET_CONFIG[network as keyof typeof HOT_WALLET_CONFIG];
    
    if (!config || !config.privateKey) {
      throw new Error(`Hot wallet not configured for network: ${network}`);
    }

    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const hotWallet = new ethers.Wallet(config.privateKey, provider);

    // Get ETH balance
    const ethBalance = await provider.getBalance(hotWallet.address);
    const ethBalanceFormatted = parseFloat(ethers.formatEther(ethBalance));

    // Get token balance
    const tokenAbi = ['function balanceOf(address owner) view returns (uint256)'];
    const tokenContract = new ethers.Contract(config.tokenAddress, tokenAbi, provider);
    const tokenBalance = await tokenContract.balanceOf(hotWallet.address);
    const tokenBalanceFormatted = parseFloat(ethers.formatUnits(tokenBalance, 6));

    return {
      network,
      address: hotWallet.address,
      ethBalance: ethBalanceFormatted,
      tokenBalance: tokenBalanceFormatted,
      currency: 'USDT'
    };
  } catch (error) {
    throw new Error(`Hot wallet balance retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
import { supabase } from '../lib/supabase';
import { getUserBalance } from './ledgerService';

export interface UserLimits {
  userId: string;
  maxBalance: number;
  maxTransactionAmount: number;
  dailyTransferLimit: number;
  dailyWithdrawalLimit: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface LimitValidationResult {
  isValid: boolean;
  reason?: string;
  currentValue?: number;
  limitValue?: number;
}

export interface DailyUsage {
  userId: string;
  date: string;
  transferAmount: number;
  withdrawalAmount: number;
  currency: string;
}

// Default limits
const DEFAULT_LIMITS = {
  maxBalance: 10000, // 10,000 USDT
  maxTransactionAmount: 5000, // 5,000 USDT per transaction
  dailyTransferLimit: 25000, // 25,000 USDT per day
  dailyWithdrawalLimit: 10000, // 10,000 USDT per day
  currency: 'USDT'
};

/**
 * Gets user limits for a specific currency
 * @param userId - User's unique identifier
 * @param currency - Currency code (default: 'USDT')
 * @returns User limits or default limits if not set
 */
export async function getUserLimits(
  userId: string,
  currency: string = 'USDT'
): Promise<UserLimits> {
  try {
    const { data, error } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to get user limits: ${error.message}`);
    }

    // Return existing limits or create default limits
    if (data) {
      return {
        userId: data.user_id,
        maxBalance: parseFloat(data.max_balance),
        maxTransactionAmount: parseFloat(data.max_transaction_amount),
        dailyTransferLimit: parseFloat(data.daily_transfer_limit),
        dailyWithdrawalLimit: parseFloat(data.daily_withdrawal_limit),
        currency: data.currency,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    // Create default limits for user
    return await createUserLimits(userId, currency);
  } catch (error) {
    throw new Error(`User limits retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates default limits for a user
 * @param userId - User's unique identifier
 * @param currency - Currency code (default: 'USDT')
 * @returns Created user limits
 */
export async function createUserLimits(
  userId: string,
  currency: string = 'USDT'
): Promise<UserLimits> {
  try {
    const { data, error } = await supabase
      .from('user_limits')
      .insert({
        user_id: userId,
        max_balance: DEFAULT_LIMITS.maxBalance,
        max_transaction_amount: DEFAULT_LIMITS.maxTransactionAmount,
        daily_transfer_limit: DEFAULT_LIMITS.dailyTransferLimit,
        daily_withdrawal_limit: DEFAULT_LIMITS.dailyWithdrawalLimit,
        currency
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user limits: ${error.message}`);
    }

    return {
      userId: data.user_id,
      maxBalance: parseFloat(data.max_balance),
      maxTransactionAmount: parseFloat(data.max_transaction_amount),
      dailyTransferLimit: parseFloat(data.daily_transfer_limit),
      dailyWithdrawalLimit: parseFloat(data.daily_withdrawal_limit),
      currency: data.currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    throw new Error(`User limits creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates user limits
 * @param userId - User's unique identifier
 * @param limits - Partial limits to update
 * @param currency - Currency code (default: 'USDT')
 * @returns Updated user limits
 */
export async function updateUserLimits(
  userId: string,
  limits: Partial<Omit<UserLimits, 'userId' | 'currency' | 'createdAt' | 'updatedAt'>>,
  currency: string = 'USDT'
): Promise<UserLimits> {
  try {
    const updateData: any = {};
    
    if (limits.maxBalance !== undefined) updateData.max_balance = limits.maxBalance;
    if (limits.maxTransactionAmount !== undefined) updateData.max_transaction_amount = limits.maxTransactionAmount;
    if (limits.dailyTransferLimit !== undefined) updateData.daily_transfer_limit = limits.dailyTransferLimit;
    if (limits.dailyWithdrawalLimit !== undefined) updateData.daily_withdrawal_limit = limits.dailyWithdrawalLimit;

    const { data, error } = await supabase
      .from('user_limits')
      .update(updateData)
      .eq('user_id', userId)
      .eq('currency', currency)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user limits: ${error.message}`);
    }

    return {
      userId: data.user_id,
      maxBalance: parseFloat(data.max_balance),
      maxTransactionAmount: parseFloat(data.max_transaction_amount),
      dailyTransferLimit: parseFloat(data.daily_transfer_limit),
      dailyWithdrawalLimit: parseFloat(data.daily_withdrawal_limit),
      currency: data.currency,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    throw new Error(`User limits update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a transaction amount is within user limits
 * @param userId - User's unique identifier
 * @param amount - Transaction amount
 * @param currency - Currency code (default: 'USDT')
 * @returns Validation result
 */
export async function validateTransactionAmount(
  userId: string,
  amount: number,
  currency: string = 'USDT'
): Promise<LimitValidationResult> {
  try {
    const limits = await getUserLimits(userId, currency);

    if (amount > limits.maxTransactionAmount) {
      return {
        isValid: false,
        reason: `Transaction amount exceeds maximum limit`,
        currentValue: amount,
        limitValue: limits.maxTransactionAmount
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Failed to validate transaction amount: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates if a balance increase would exceed user limits
 * @param userId - User's unique identifier
 * @param additionalAmount - Amount to be added to balance
 * @param currency - Currency code (default: 'USDT')
 * @returns Validation result
 */
export async function validateBalanceIncrease(
  userId: string,
  additionalAmount: number,
  currency: string = 'USDT'
): Promise<LimitValidationResult> {
  try {
    const [currentBalance, limits] = await Promise.all([
      getUserBalance(userId, currency),
      getUserLimits(userId, currency)
    ]);

    const newBalance = currentBalance + additionalAmount;

    if (newBalance > limits.maxBalance) {
      return {
        isValid: false,
        reason: `Balance would exceed maximum limit`,
        currentValue: newBalance,
        limitValue: limits.maxBalance
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Failed to validate balance increase: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets daily usage for a user
 * @param userId - User's unique identifier
 * @param date - Date to check (default: today)
 * @param currency - Currency code (default: 'USDT')
 * @returns Daily usage data
 */
export async function getDailyUsage(
  userId: string,
  date: string = new Date().toISOString().split('T')[0],
  currency: string = 'USDT'
): Promise<DailyUsage> {
  try {
    // Get transfer amount for the day
    const { data: transferData, error: transferError } = await supabase
      .from('ledger')
      .select('amount')
      .eq('user_id', userId)
      .eq('currency', currency)
      .eq('type', 'transfer')
      .gte('created_at', `${date}T00:00:00.000Z`)
      .lt('created_at', `${date}T23:59:59.999Z`)
      .lt('amount', 0); // Only debits (outgoing transfers)

    if (transferError) {
      throw new Error(`Failed to get transfer data: ${transferError.message}`);
    }

    // Get withdrawal amount for the day
    const { data: withdrawalData, error: withdrawalError } = await supabase
      .from('ledger')
      .select('amount')
      .eq('user_id', userId)
      .eq('currency', currency)
      .eq('type', 'withdrawal')
      .gte('created_at', `${date}T00:00:00.000Z`)
      .lt('created_at', `${date}T23:59:59.999Z`);

    if (withdrawalError) {
      throw new Error(`Failed to get withdrawal data: ${withdrawalError.message}`);
    }

    // Calculate totals (convert negative amounts to positive)
    const transferAmount = transferData.reduce((sum, entry) => sum + Math.abs(parseFloat(entry.amount.toString())), 0);
    const withdrawalAmount = withdrawalData.reduce((sum, entry) => sum + Math.abs(parseFloat(entry.amount.toString())), 0);

    return {
      userId,
      date,
      transferAmount,
      withdrawalAmount,
      currency
    };
  } catch (error) {
    throw new Error(`Daily usage retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a transfer would exceed daily limits
 * @param userId - User's unique identifier
 * @param amount - Transfer amount
 * @param currency - Currency code (default: 'USDT')
 * @returns Validation result
 */
export async function validateDailyTransferLimit(
  userId: string,
  amount: number,
  currency: string = 'USDT'
): Promise<LimitValidationResult> {
  try {
    const [dailyUsage, limits] = await Promise.all([
      getDailyUsage(userId, undefined, currency),
      getUserLimits(userId, currency)
    ]);

    const newDailyTotal = dailyUsage.transferAmount + amount;

    if (newDailyTotal > limits.dailyTransferLimit) {
      return {
        isValid: false,
        reason: `Daily transfer limit would be exceeded`,
        currentValue: newDailyTotal,
        limitValue: limits.dailyTransferLimit
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Failed to validate daily transfer limit: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates if a withdrawal would exceed daily limits
 * @param userId - User's unique identifier
 * @param amount - Withdrawal amount
 * @param currency - Currency code (default: 'USDT')
 * @returns Validation result
 */
export async function validateDailyWithdrawalLimit(
  userId: string,
  amount: number,
  currency: string = 'USDT'
): Promise<LimitValidationResult> {
  try {
    const [dailyUsage, limits] = await Promise.all([
      getDailyUsage(userId, undefined, currency),
      getUserLimits(userId, currency)
    ]);

    const newDailyTotal = dailyUsage.withdrawalAmount + amount;

    if (newDailyTotal > limits.dailyWithdrawalLimit) {
      return {
        isValid: false,
        reason: `Daily withdrawal limit would be exceeded`,
        currentValue: newDailyTotal,
        limitValue: limits.dailyWithdrawalLimit
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Failed to validate daily withdrawal limit: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates all limits for a transfer operation
 * @param fromUserId - Sender's user ID
 * @param toUserId - Recipient's user ID
 * @param amount - Transfer amount
 * @param currency - Currency code (default: 'USDT')
 * @returns Validation result
 */
export async function validateTransferLimits(
  fromUserId: string,
  toUserId: string,
  amount: number,
  currency: string = 'USDT'
): Promise<LimitValidationResult> {
  try {
    // Validate sender's transaction amount limit
    const transactionValidation = await validateTransactionAmount(fromUserId, amount, currency);
    if (!transactionValidation.isValid) {
      return transactionValidation;
    }

    // Validate sender's daily transfer limit
    const dailyTransferValidation = await validateDailyTransferLimit(fromUserId, amount, currency);
    if (!dailyTransferValidation.isValid) {
      return dailyTransferValidation;
    }

    // Validate recipient's balance limit
    const balanceValidation = await validateBalanceIncrease(toUserId, amount, currency);
    if (!balanceValidation.isValid) {
      return balanceValidation;
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      reason: `Failed to validate transfer limits: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Gets remaining limits for a user
 * @param userId - User's unique identifier
 * @param currency - Currency code (default: 'USDT')
 * @returns Remaining limits information
 */
export async function getRemainingLimits(
  userId: string,
  currency: string = 'USDT'
): Promise<{
  maxBalance: number;
  currentBalance: number;
  remainingBalance: number;
  maxTransactionAmount: number;
  dailyTransferLimit: number;
  dailyTransferUsed: number;
  dailyTransferRemaining: number;
  dailyWithdrawalLimit: number;
  dailyWithdrawalUsed: number;
  dailyWithdrawalRemaining: number;
}> {
  try {
    const [currentBalance, limits, dailyUsage] = await Promise.all([
      getUserBalance(userId, currency),
      getUserLimits(userId, currency),
      getDailyUsage(userId, undefined, currency)
    ]);

    return {
      maxBalance: limits.maxBalance,
      currentBalance,
      remainingBalance: Math.max(0, limits.maxBalance - currentBalance),
      maxTransactionAmount: limits.maxTransactionAmount,
      dailyTransferLimit: limits.dailyTransferLimit,
      dailyTransferUsed: dailyUsage.transferAmount,
      dailyTransferRemaining: Math.max(0, limits.dailyTransferLimit - dailyUsage.transferAmount),
      dailyWithdrawalLimit: limits.dailyWithdrawalLimit,
      dailyWithdrawalUsed: dailyUsage.withdrawalAmount,
      dailyWithdrawalRemaining: Math.max(0, limits.dailyWithdrawalLimit - dailyUsage.withdrawalAmount)
    };
  } catch (error) {
    throw new Error(`Failed to get remaining limits: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
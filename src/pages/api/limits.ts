import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../lib/supabaseClient';
import {
  getUserLimits,
  createUserLimits,
  updateUserLimits,
  validateTransferLimits,
  getRemainingLimits
} from '../../services/limitsService';

// Validation schemas
const updateLimitsSchema = z.object({
  maxBalance: z.number().min(0).max(1000000).optional(),
  maxTransactionAmount: z.number().min(0).max(100000).optional(),
  dailyTransferLimit: z.number().min(0).max(50000).optional(),
  dailyWithdrawalLimit: z.number().min(0).max(50000).optional()
});

const validateTransferSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required').default('USDT'),
  recipientId: z.string().uuid('Invalid recipient ID').optional()
});

/**
 * Validates user authentication and returns user ID
 */
async function validateAuth(req: NextApiRequest): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid authentication token');
  }

  return user.id;
}

/**
 * Validates admin authentication
 */
async function validateAdminAuth(req: NextApiRequest): Promise<string> {
  const userId = await validateAuth(req);

  // Check if user has admin role
  const { data: isAdmin, error } = await supabase
    .rpc('is_admin_user', { user_uuid: userId });

  if (error || !isAdmin) {
    throw new Error('Admin access required');
  }

  return userId;
}

/**
 * Handles user limits API requests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetLimits(req, res);
      case 'PUT':
        return await handleUpdateLimits(req, res);
      case 'POST':
        return await handleValidateTransfer(req, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Limits API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('authorization')) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: error.message
        });
      }

      if (error.message.includes('Admin access required')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: error.message
        });
      }
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handles GET /api/limits - Get user limits and remaining amounts
 */
async function handleGetLimits(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const userId = await validateAuth(req);

    // Check if requesting limits for another user (admin only)
    const targetUserId = req.query.userId as string;
    if (targetUserId && targetUserId !== userId) {
      await validateAdminAuth(req);
    }

    const finalUserId = targetUserId || userId;

    // Get user limits
    let limits = await getUserLimits(finalUserId);

    // Create default limits if none exist
    if (!limits) {
      limits = await createUserLimits(finalUserId);
    }

    // Get remaining limits for today
    const remaining = await getRemainingLimits(finalUserId);

    // Get current balance from ledger
    const { data: balanceData, error: balanceError } = await supabase
      .rpc('get_user_balance', { user_uuid: finalUserId, currency_filter: 'USDT' });

    if (balanceError) {
      console.error('Error getting balance:', balanceError);
    }

    const currentBalance = balanceData || 0;

    res.status(200).json({
      success: true,
      data: {
        limits: {
          maxBalance: limits.maxBalance,
          maxTransactionAmount: limits.maxTransactionAmount,
          dailyTransferLimit: limits.dailyTransferLimit,
          dailyWithdrawalLimit: limits.dailyWithdrawalLimit
        },
        remaining: {
          dailyTransferLimit: remaining.dailyTransferLimit,
          dailyWithdrawalLimit: remaining.dailyWithdrawalLimit,
          balanceCapacity: Math.max(0, limits.maxBalance - currentBalance)
        },
        current: {
          balance: currentBalance,
          dailyTransferUsed: remaining.dailyTransferUsed,
          dailyWithdrawalUsed: remaining.dailyWithdrawalUsed
        },
        updatedAt: limits.updatedAt
      },
      message: 'User limits retrieved successfully'
    });
  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({
      error: 'Limits retrieval failed',
      message: 'Failed to retrieve user limits'
    });
  }
}

/**
 * Handles PUT /api/limits - Update user limits (Admin only)
 */
async function handleUpdateLimits(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    // Validate admin authentication
    await validateAdminAuth(req);

    // Get target user ID from query or body
    const targetUserId = (req.query.userId as string) || req.body.userId;
    if (!targetUserId) {
      return res.status(400).json({
        error: 'Missing user ID',
        message: 'User ID is required to update limits'
      });
    }

    // Validate request body
    const validatedData = updateLimitsSchema.parse(req.body);

    // Check if any limits are being updated
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'At least one limit field must be provided'
      });
    }

    // Verify target user exists
    const { data: userExists, error: userError } = await supabase
      .from('app_users')
      .select('user_id')
      .eq('user_id', targetUserId)
      .single();

    if (userError || !userExists) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Target user does not exist'
      });
    }

    // Get current limits or create if they don't exist
    let currentLimits = await getUserLimits(targetUserId);
    if (!currentLimits) {
      currentLimits = await createUserLimits(targetUserId);
    }

    // Update limits
    const updatedLimits = await updateUserLimits(targetUserId, {
      maxBalance: validatedData.maxBalance,
      maxTransactionAmount: validatedData.maxTransactionAmount,
      dailyTransferLimit: validatedData.dailyTransferLimit,
      dailyWithdrawalLimit: validatedData.dailyWithdrawalLimit
    });

    res.status(200).json({
      success: true,
      data: {
        userId: targetUserId,
        limits: {
          maxBalance: updatedLimits.maxBalance,
          maxTransactionAmount: updatedLimits.maxTransactionAmount,
          dailyTransferLimit: updatedLimits.dailyTransferLimit,
          dailyWithdrawalLimit: updatedLimits.dailyWithdrawalLimit
        },
        updatedAt: updatedLimits.updatedAt
      },
      message: 'User limits updated successfully'
    });
  } catch (error) {
    console.error('Update limits error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid limit values',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      error: 'Limits update failed',
      message: 'Failed to update user limits'
    });
  }
}

/**
 * Handles POST /api/limits - Validate transfer against limits
 */
async function handleValidateTransfer(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const userId = await validateAuth(req);

    // Validate request body
    const validatedData = validateTransferSchema.parse(req.body);

    // Validate the transfer against limits
    const validation = await validateTransferLimits(
      userId,
      validatedData.recipientId || '',
      validatedData.amount,
      validatedData.currency
    );

    if (validation.isValid) {
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          amount: validatedData.amount,
          currency: validatedData.currency
        },
        message: 'Transfer validation passed'
      });
    } else {
      res.status(400).json({
        success: false,
        data: {
          valid: false,
          amount: validatedData.amount,
          currency: validatedData.currency,
          reason: validation.reason
        },
        error: 'Transfer validation failed',
        message: validation.reason || 'Transfer validation failed'
      });
    }
  } catch (error) {
    console.error('Validate transfer error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid transfer data',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      error: 'Transfer validation failed',
      message: 'Failed to validate transfer'
    });
  }
}
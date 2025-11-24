import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../lib/supabaseClient';
import {
  createWithdrawalRequest,
  getUserWithdrawals,
  cancelWithdrawal,
  WithdrawalRequest
} from '../../services/withdrawalService';

// Validation schemas
const createWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(50000, 'Amount exceeds maximum limit'),
  toAddress: z.string().min(1, 'Destination address is required'),
  currency: z.string().default('USDT'),
  network: z.enum(['ethereum', 'polygon', 'bsc']).default('ethereum'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required')
});

const cancelWithdrawalSchema = z.object({
  withdrawalId: z.string().uuid('Invalid withdrawal ID')
});

const getWithdrawalsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
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
 * Handles withdrawal API requests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate authentication
    const userId = await validateAuth(req);

    switch (req.method) {
      case 'POST':
        return await handleCreateWithdrawal(req, res, userId);
      case 'GET':
        return await handleGetWithdrawals(req, res, userId);
      case 'DELETE':
        return await handleCancelWithdrawal(req, res, userId);
      default:
        res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Withdrawal API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication') || error.message.includes('authorization')) {
        return res.status(401).json({
          error: 'Unauthorized',
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
 * Handles POST /api/withdraw - Create withdrawal request
 */
async function handleCreateWithdrawal(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
): Promise<void> {
  try {
    // Validate request body
    const validatedData = createWithdrawalSchema.parse(req.body);

    // Create withdrawal request
    const withdrawal = await createWithdrawalRequest(
      userId,
      validatedData.amount,
      validatedData.toAddress,
      validatedData.currency,
      validatedData.network,
      validatedData.idempotencyKey
    );

    res.status(201).json({
      success: true,
      data: {
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          currency: withdrawal.currency,
          toAddress: withdrawal.toAddress,
          network: withdrawal.network,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt
        }
      },
      message: 'Withdrawal request created successfully'
    });
  } catch (error) {
    console.error('Create withdrawal error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid request data',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    if (error instanceof Error) {
      // Handle specific business logic errors
      if (error.message.includes('Insufficient balance')) {
        return res.status(400).json({
          error: 'Insufficient balance',
          message: error.message
        });
      }

      if (error.message.includes('limit')) {
        return res.status(400).json({
          error: 'Limit exceeded',
          message: error.message
        });
      }

      if (error.message.includes('Duplicate withdrawal')) {
        return res.status(409).json({
          error: 'Duplicate request',
          message: error.message
        });
      }

      if (error.message.includes('Invalid destination address')) {
        return res.status(400).json({
          error: 'Invalid address',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'Withdrawal creation failed',
      message: 'Failed to create withdrawal request'
    });
  }
}

/**
 * Handles GET /api/withdraw - Get user withdrawals
 */
async function handleGetWithdrawals(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
): Promise<void> {
  try {
    // Validate query parameters
    const validatedQuery = getWithdrawalsSchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    });

    // Get user withdrawals
    const withdrawals = await getUserWithdrawals(
      userId,
      validatedQuery.limit,
      validatedQuery.offset
    );

    // Format response data
    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      toAddress: withdrawal.toAddress,
      network: withdrawal.network,
      status: withdrawal.status,
      txHash: withdrawal.txHash,
      gasFee: withdrawal.gasFee,
      errorMessage: withdrawal.errorMessage,
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        withdrawals: formattedWithdrawals,
        pagination: {
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          hasMore: withdrawals.length === validatedQuery.limit
        }
      }
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid query parameters',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      error: 'Withdrawal retrieval failed',
      message: 'Failed to retrieve withdrawal history'
    });
  }
}

/**
 * Handles DELETE /api/withdraw - Cancel withdrawal request
 */
async function handleCancelWithdrawal(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
): Promise<void> {
  try {
    // Validate request body
    const validatedData = cancelWithdrawalSchema.parse(req.body);

    // Cancel withdrawal
    const cancelledWithdrawal = await cancelWithdrawal(
      validatedData.withdrawalId,
      userId
    );

    res.status(200).json({
      success: true,
      data: {
        withdrawal: {
          id: cancelledWithdrawal.id,
          amount: cancelledWithdrawal.amount,
          currency: cancelledWithdrawal.currency,
          toAddress: cancelledWithdrawal.toAddress,
          network: cancelledWithdrawal.network,
          status: cancelledWithdrawal.status,
          updatedAt: cancelledWithdrawal.updatedAt
        }
      },
      message: 'Withdrawal cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel withdrawal error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid request data',
        details: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('cannot be cancelled')) {
        return res.status(404).json({
          error: 'Withdrawal not found',
          message: error.message
        });
      }
    }

    res.status(500).json({
      error: 'Withdrawal cancellation failed',
      message: 'Failed to cancel withdrawal request'
    });
  }
}
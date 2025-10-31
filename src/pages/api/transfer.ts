import { NextApiRequest, NextApiResponse } from 'next';
import { performTransfer, getUserBalance, validateSufficientBalance } from '../../services/ledgerService';
import { supabase } from '../../lib/supabaseClient';
import { z } from 'zod';

// Request validation schema
const transferSchema = z.object({
  toUserId: z.string().uuid('Invalid recipient user ID'),
  amount: z.number().positive('Amount must be positive').max(10000, 'Amount exceeds maximum limit of 10,000 USDT'),
  currency: z.string().optional().default('USDT'),
  description: z.string().optional(),
  idempotencyKey: z.string().optional()
});

// Response types
interface TransferResponse {
  success: boolean;
  data?: {
    transactionId: string;
    fromBalance: number;
    toBalance: number;
    amount: number;
    currency: string;
    timestamp: string;
  };
  error?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

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
 * Validates user limits for transfers
 */
async function validateUserLimits(
  userId: string, 
  amount: number, 
  currency: string = 'USDT'
): Promise<void> {
  // Check current balance
  const currentBalance = await getUserBalance(userId, currency);
  
  // Validate sufficient balance
  if (currentBalance < amount) {
    throw new Error(`Insufficient balance. Current: ${currentBalance} ${currency}, Required: ${amount} ${currency}`);
  }

  // Check per-transaction limit (5,000 USDT)
  const maxTransactionAmount = 5000;
  if (amount > maxTransactionAmount) {
    throw new Error(`Transaction amount exceeds limit of ${maxTransactionAmount} ${currency}`);
  }

  // Check if recipient would exceed balance limit (10,000 USDT)
  // This will be checked in the atomic transfer function as well
}

/**
 * Validates that recipient user exists
 */
async function validateRecipient(toUserId: string): Promise<void> {
  const { data: user, error } = await supabase.auth.admin.getUserById(toUserId);
  
  if (error || !user) {
    throw new Error('Recipient user not found');
  }
}

/**
 * Handles POST requests for off-chain transfers
 */
async function handleTransfer(req: NextApiRequest, res: NextApiResponse<TransferResponse | ErrorResponse>) {
  try {
    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      });
    }

    // Validate authentication
    const fromUserId = await validateAuth(req);

    // Validate request body
    const validationResult = transferSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
        code: 'VALIDATION_ERROR'
      });
    }

    const { toUserId, amount, currency, description, idempotencyKey } = validationResult.data;

    // Validate recipient exists
    await validateRecipient(toUserId);

    // Validate user limits
    await validateUserLimits(fromUserId, amount, currency);

    // Get idempotency key from header if not in body
    const finalIdempotencyKey = idempotencyKey || req.headers['idempotency-key'] as string;

    // Perform the transfer
    const transferResult = await performTransfer({
      fromUserId,
      toUserId,
      amount,
      currency,
      idempotencyKey: finalIdempotencyKey,
      description
    });

    if (!transferResult.success) {
      return res.status(400).json({
        success: false,
        error: transferResult.message,
        code: 'TRANSFER_FAILED'
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        transactionId: transferResult.transactionId,
        fromBalance: transferResult.fromBalance,
        toBalance: transferResult.toBalance,
        amount,
        currency,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Transfer API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Insufficient balance')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'INSUFFICIENT_BALANCE'
        });
      }
      
      if (error.message.includes('exceeds limit')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          code: 'LIMIT_EXCEEDED'
        });
      }
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message,
          code: 'USER_NOT_FOUND'
        });
      }
      
      if (error.message.includes('Duplicate transaction')) {
        return res.status(409).json({
          success: false,
          error: error.message,
          code: 'DUPLICATE_TRANSACTION'
        });
      }
      
      if (error.message.includes('authentication')) {
        return res.status(401).json({
          success: false,
          error: error.message,
          code: 'AUTHENTICATION_ERROR'
        });
      }
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Handles GET requests for transfer status/history
 */
async function handleGetTransfers(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate authentication
    const userId = await validateAuth(req);

    const { currency, limit = '50', offset = '0' } = req.query;

    // Import here to avoid circular dependencies
    const { getTransactionHistory } = await import('../../services/ledgerService');
    
    const transactions = await getTransactionHistory(
      userId,
      currency as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    return res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: transactions.length === parseInt(limit as string)
        }
      }
    });

  } catch (error) {
    console.error('Get transfers API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve transactions'
    });
  }
}

/**
 * Main API handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route to appropriate handler
  if (req.method === 'POST') {
    return handleTransfer(req, res);
  } else if (req.method === 'GET') {
    return handleGetTransfers(req, res);
  } else {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
}
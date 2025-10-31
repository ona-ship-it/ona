/**
 * API Route: Get User Wallet Balance
 * 
 * Retrieves the current balance, available balance, and pending withdrawals
 * for a specific user's wallet.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getWalletServiceManager } from '../../../services/walletServiceManager';
import { withIdempotencyAndRateLimit } from '../../../middleware/idempotencyRateLimit';

interface BalanceResponse {
  success: boolean;
  data?: {
    balance: string;
    availableBalance: string;
    pendingWithdrawals: string;
    walletAddress?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BalanceResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check rate limiting
    const rateLimitResult = await checkIdempotencyAndRateLimit(
      req,
      res,
      'balance',
      userId
    );

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded'
      });
    }

    // Get wallet service manager
    const walletManager = getWalletServiceManager();
    if (!walletManager || !walletManager.isServicesInitialized()) {
      return res.status(503).json({
        success: false,
        error: 'Wallet services not available'
      });
    }

    // Get user balance
    const balanceInfo = await walletManager.getUserBalance(userId);
    
    // Get user wallet address
    const walletAddress = await walletManager.getUserWalletAddress(userId);

    return res.status(200).json({
      success: true,
      data: {
        ...balanceInfo,
        walletAddress: walletAddress || undefined
      }
    });

  } catch (error) {
    console.error('❌ Balance API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
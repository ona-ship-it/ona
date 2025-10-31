/**
 * API Route: Create User Wallet
 * 
 * Creates a new cryptocurrency wallet for a user.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getWalletServiceManager } from '../../../services/walletServiceManager';
import { withIdempotencyAndRateLimit } from '../../../middleware/idempotencyRateLimit';

interface CreateWalletResponse {
  success: boolean;
  data?: {
    address: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateWalletResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // Check rate limiting and idempotency
    const rateLimitResult = await checkIdempotencyAndRateLimit(
      req,
      res,
      'create_wallet',
      userId
    );

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded'
      });
    }

    // Return cached response if exists
    if (rateLimitResult.cachedResponse) {
      return res.status(200).json(rateLimitResult.cachedResponse);
    }

    // Get wallet service manager
    const walletManager = getWalletServiceManager();
    if (!walletManager || !walletManager.isServicesInitialized()) {
      return res.status(503).json({
        success: false,
        error: 'Wallet services not available'
      });
    }

    // Check if user already has a wallet
    const existingAddress = await walletManager.getUserWalletAddress(userId);
    if (existingAddress) {
      const response = {
        success: true,
        data: {
          address: existingAddress
        }
      };

      // Cache the response
      if (rateLimitResult.storeResponse) {
        await rateLimitResult.storeResponse(response);
      }

      return res.status(200).json(response);
    }

    // Create new wallet
    const result = await walletManager.createUserWallet(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create wallet'
      });
    }

    const response = {
      success: true,
      data: {
        address: result.address!
      }
    };

    // Cache the response
    if (rateLimitResult.storeResponse) {
      await rateLimitResult.storeResponse(response);
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error('❌ Create wallet API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
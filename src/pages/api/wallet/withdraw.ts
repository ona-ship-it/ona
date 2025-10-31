/**
 * API Route: Process Withdrawal
 * 
 * Processes a withdrawal request for a user.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getWalletServiceManager } from '../../../services/walletServiceManager';
import { withIdempotencyAndRateLimit } from '../../../middleware/idempotencyRateLimit';
import { ethers } from 'ethers';

interface WithdrawResponse {
  success: boolean;
  data?: {
    withdrawalId: string;
    status: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WithdrawResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { userId, amount, toAddress } = req.body;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!amount || typeof amount !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Amount is required'
      });
    }

    if (!toAddress || typeof toAddress !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Destination address is required'
      });
    }

    // Validate amount
    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid amount'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount format'
      });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(toAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid destination address'
      });
    }

    // Check rate limiting and idempotency
    const rateLimitResult = await checkIdempotencyAndRateLimit(
      req,
      res,
      'withdraw',
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

    // Check user balance
    const balanceInfo = await walletManager.getUserBalance(userId);
    const availableBalance = parseFloat(balanceInfo.availableBalance);
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > availableBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Process withdrawal
    const result = await walletManager.processWithdrawal(userId, amount, toAddress);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to process withdrawal'
      });
    }

    const response = {
      success: true,
      data: {
        withdrawalId: result.withdrawalId!,
        status: 'pending'
      }
    };

    // Cache the response
    if (rateLimitResult.storeResponse) {
      await rateLimitResult.storeResponse(response);
    }

    return res.status(201).json(response);

  } catch (error) {
    console.error('❌ Withdraw API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
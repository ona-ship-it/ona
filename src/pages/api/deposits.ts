import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '../../lib/supabaseClient';
import {
  getPendingDeposits,
  processConfirmedDeposit,
  scanForDeposits,
  updateDepositConfirmations
} from '../../services/depositService';
import { getUserCryptoWallet } from '../../services/walletService';

// Validation schemas
const getDepositsSchema = z.object({
  network: z.enum(['ethereum', 'polygon', 'bsc']).optional(),
  status: z.enum(['pending', 'confirmed', 'processed', 'failed']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

const processDepositSchema = z.object({
  txHash: z.string().min(1, 'Transaction hash is required')
});

const scanDepositsSchema = z.object({
  network: z.enum(['ethereum', 'polygon', 'bsc']),
  fromBlock: z.number().int().min(0).optional()
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
  const { data: profile, error } = await supabase
    .from('app_users')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return userId;
}

/**
 * Handles deposit API requests
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGetDeposits(req, res);
      case 'POST':
        return await handleProcessDeposit(req, res);
      case 'PUT':
        return await handleScanDeposits(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Deposits API error:', error);
    
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
 * Handles GET /api/deposits - Get user deposits or deposit address
 */
async function handleGetDeposits(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const userId = await validateAuth(req);

    // Check if requesting deposit address
    if (req.query.action === 'address') {
      const network = (req.query.network as string) || 'ethereum';
      
      try {
        const wallet = await getUserCryptoWallet(userId, network);
        
        return res.status(200).json({
          success: true,
          data: {
            address: wallet.address,
            network: wallet.network,
            qrCode: `ethereum:${wallet.address}` // Standard format for QR codes
          },
          message: 'Deposit address retrieved successfully'
        });
      } catch (error) {
        return res.status(404).json({
          error: 'Wallet not found',
          message: 'User wallet not found for the specified network'
        });
      }
    }

    // Validate query parameters for deposit history
    const validatedQuery = getDepositsSchema.parse({
      network: req.query.network as string,
      status: req.query.status as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    });

    // Get user deposits from database
    let query = supabase
      .from('deposit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(validatedQuery.offset, validatedQuery.offset + validatedQuery.limit - 1);

    if (validatedQuery.network) {
      query = query.eq('network', validatedQuery.network);
    }

    if (validatedQuery.status) {
      query = query.eq('status', validatedQuery.status);
    }

    const { data: deposits, error } = await query;

    if (error) {
      throw new Error(`Failed to get deposits: ${error.message}`);
    }

    // Format response data
    const formattedDeposits = deposits.map(deposit => ({
      id: deposit.id,
      txHash: deposit.tx_hash,
      fromAddress: deposit.from_address,
      toAddress: deposit.to_address,
      amount: parseFloat(deposit.amount),
      currency: deposit.currency,
      network: deposit.network,
      blockNumber: deposit.block_number,
      confirmations: deposit.confirmations,
      status: deposit.status,
      createdAt: deposit.created_at,
      updatedAt: deposit.updated_at
    }));

    res.status(200).json({
      success: true,
      data: {
        deposits: formattedDeposits,
        pagination: {
          limit: validatedQuery.limit,
          offset: validatedQuery.offset,
          hasMore: deposits.length === validatedQuery.limit
        }
      }
    });
  } catch (error) {
    console.error('Get deposits error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid query parameters',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      error: 'Deposit retrieval failed',
      message: 'Failed to retrieve deposit history'
    });
  }
}

/**
 * Handles POST /api/deposits - Process confirmed deposit (Admin only)
 */
async function handleProcessDeposit(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    // Validate admin authentication
    await validateAdminAuth(req);

    // Validate request body
    const validatedData = processDepositSchema.parse(req.body);

    // Process the deposit
    const result = await processConfirmedDeposit(validatedData.txHash);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          txHash: result.txHash,
          amount: result.amount,
          userId: result.userId
        },
        message: 'Deposit processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Deposit processing failed',
        message: result.error
      });
    }
  } catch (error) {
    console.error('Process deposit error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      error: 'Deposit processing failed',
      message: 'Failed to process deposit'
    });
  }
}

/**
 * Handles PUT /api/deposits - Scan for new deposits (Admin only)
 */
async function handleScanDeposits(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    // Validate admin authentication
    await validateAdminAuth(req);

    // Validate request body
    const validatedData = scanDepositsSchema.parse(req.body);

    // Get the last scanned block for this network
    let fromBlock = validatedData.fromBlock;
    if (!fromBlock) {
      const { data: lastScan } = await supabase
        .from('deposit_scan_status')
        .select('last_block')
        .eq('network', validatedData.network)
        .single();

      fromBlock = lastScan?.last_block || 0;
    }

    // Scan for deposits
    const newDeposits = await scanForDeposits(validatedData.network, fromBlock);

    // Update confirmation counts for pending deposits
    const updatedCount = await updateDepositConfirmations(validatedData.network);

    // Update last scanned block
    const provider = require('ethers').JsonRpcProvider;
    const rpcUrls = {
      ethereum: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
      polygon: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
      bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org'
    };

    const rpcUrl = rpcUrls[validatedData.network as keyof typeof rpcUrls];
    if (rpcUrl) {
      const providerInstance = new provider(rpcUrl);
      const currentBlock = await providerInstance.getBlockNumber();

      await supabase
        .from('deposit_scan_status')
        .upsert({
          network: validatedData.network,
          last_block: currentBlock,
          updated_at: new Date().toISOString()
        });
    }

    res.status(200).json({
      success: true,
      data: {
        network: validatedData.network,
        newDeposits: newDeposits.length,
        updatedConfirmations: updatedCount,
        scannedFromBlock: fromBlock
      },
      message: 'Deposit scan completed successfully'
    });
  } catch (error) {
    console.error('Scan deposits error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid request data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    res.status(500).json({
      error: 'Deposit scan failed',
      message: 'Failed to scan for deposits'
    });
  }
}
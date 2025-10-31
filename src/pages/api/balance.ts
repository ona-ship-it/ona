import { NextApiRequest, NextApiResponse } from 'next';
import { getUserBalance, getUserBalances } from '../../services/ledgerService';
import { getUserPlatformWallet } from '../../services/walletService';
import { supabase } from '../../lib/supabaseClient';

interface BalanceResponse {
  success: boolean;
  data?: {
    crypto: {
      [currency: string]: number;
    };
    platform: {
      fiat: number;
      tickets: number;
    };
    total: {
      [currency: string]: number;
    };
  };
  error?: string;
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
 * Handles GET requests for user balances
 */
async function handleGetBalance(req: NextApiRequest, res: NextApiResponse<BalanceResponse>) {
  try {
    // Validate authentication
    const userId = await validateAuth(req);

    // Get crypto balances from ledger
    const cryptoBalances = await getUserBalances(userId);
    
    // Get platform wallet balances (fiat and tickets)
    const platformWallet = await getUserPlatformWallet(userId);

    // Format crypto balances
    const cryptoBalanceMap: { [currency: string]: number } = {};
    cryptoBalances.forEach(balance => {
      cryptoBalanceMap[balance.currency] = balance.balance;
    });

    // Platform balances
    const platformBalances = {
      fiat: platformWallet?.balanceFiat || 0,
      tickets: platformWallet?.balanceTickets || 0
    };

    // Calculate total balances (crypto + platform fiat for USD equivalent)
    const totalBalances: { [currency: string]: number } = { ...cryptoBalanceMap };
    
    // Add platform fiat to USD total if it exists
    if (platformBalances.fiat > 0) {
      totalBalances.USD = (totalBalances.USD || 0) + platformBalances.fiat;
    }

    return res.status(200).json({
      success: true,
      data: {
        crypto: cryptoBalanceMap,
        platform: platformBalances,
        total: totalBalances
      }
    });

  } catch (error) {
    console.error('Balance API error:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve balance'
    });
  }
}

/**
 * Handles GET requests for specific currency balance
 */
async function handleGetCurrencyBalance(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate authentication
    const userId = await validateAuth(req);

    const { currency } = req.query;
    
    if (!currency || typeof currency !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Currency parameter is required'
      });
    }

    const balance = await getUserBalance(userId, currency);

    return res.status(200).json({
      success: true,
      data: {
        currency,
        balance,
        userId
      }
    });

  } catch (error) {
    console.error('Currency balance API error:', error);
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve currency balance'
    });
  }
}

/**
 * Main API handler
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  // Check if requesting specific currency balance
  if (req.query.currency) {
    return handleGetCurrencyBalance(req, res);
  }

  // Return all balances
  return handleGetBalance(req, res);
}
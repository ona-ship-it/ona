import { NextRequest, NextResponse } from 'next/server';
import WalletService from '@/services/WalletService';

// GET /api/wallet - Get user wallet
export async function GET(request: NextRequest) {
  // In a real app, we would get the user ID from the session/token
  const userId = request.headers.get('user-id') || 'default-user';
  
  try {
    const wallet = WalletService.getWallet(userId);
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }
    
    // Return only the public information (no private keys)
    const displayWallet = WalletService.formatWalletForDisplay(wallet);
    return NextResponse.json({ wallet: displayWallet });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

// POST /api/wallet - Create or update wallet
export async function POST(request: NextRequest) {
  // In a real app, we would get the user ID from the session/token
  const userId = request.headers.get('user-id') || 'default-user';
  
  try {
    // Generate a new wallet if one doesn't exist
    let wallet = WalletService.getWallet(userId);
    
    if (!wallet) {
      wallet = WalletService.generateWallet(userId);
    }
    
    // Return only the public information
    const displayWallet = WalletService.formatWalletForDisplay(wallet);
    return NextResponse.json({ wallet: displayWallet });
  } catch (error) {
    console.error('Error creating/updating wallet:', error);
    return NextResponse.json({ error: 'Failed to create/update wallet' }, { status: 500 });
  }
}
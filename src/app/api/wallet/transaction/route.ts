import { NextRequest, NextResponse } from 'next/server';
import WalletService from '@/services/WalletService';

// POST /api/wallet/transaction - Handle deposits and withdrawals
export async function POST(request: NextRequest) {
  // In a real app, we would get the user ID from the session/token
  const userId = request.headers.get('user-id') || 'default-user';
  
  try {
    const body = await request.json();
    const { type, currency, amount } = body;
    
    if (!type || !currency || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, currency, amount' 
      }, { status: 400 });
    }
    
    if (type !== 'deposit' && type !== 'withdrawal') {
      return NextResponse.json({ 
        error: 'Transaction type must be either "deposit" or "withdrawal"' 
      }, { status: 400 });
    }
    
    // Get the user's wallet
    const wallet = WalletService.getWallet(userId);
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }
    
    // Process the transaction (simplified for demo)
    // In a real app, this would involve blockchain transactions for crypto
    // or payment processor integration for fiat
    
    // Return the updated wallet (public info only)
    const displayWallet = WalletService.formatWalletForDisplay(wallet);
    return NextResponse.json({ 
      success: true,
      message: `${type} of ${amount} ${currency} processed successfully`,
      wallet: displayWallet 
    });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json({ 
      error: 'Failed to process transaction' 
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createUserWallet } from '@/utils/userWallet';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client at runtime to avoid build-time errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user already has a real crypto wallet (not placeholder)
    const { data: existingWallet, error: checkError } = await supabase
      .from('user_crypto_wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('network', 'solana')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing wallet:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing wallet' },
        { status: 500 }
      );
    }

    // If wallet exists and is not a placeholder, return success
    if (existingWallet && !existingWallet.encrypted_private_key.startsWith('PLACEHOLDER_')) {
      return NextResponse.json({
        success: true,
        message: 'Crypto wallet already exists',
        address: existingWallet.address
      });
    }

    // Generate real crypto wallet using the createUserWallet function
    await createUserWallet(userId);

    return NextResponse.json({
      success: true,
      message: 'Crypto wallet generated successfully'
    });

  } catch (error) {
    console.error('Error generating crypto wallet:', error);
    return NextResponse.json(
      { error: 'Failed to generate crypto wallet' },
      { status: 500 }
    );
  }
}

// GET endpoint to check wallet status
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client at runtime to avoid build-time errors
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check wallet status
    const { data: wallet, error } = await supabase
      .from('user_crypto_wallets')
      .select('address, network, created_at')
      .eq('user_id', userId)
      .eq('network', 'solana')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: {
        address: wallet.address,
        network: wallet.network,
        created_at: wallet.created_at
      }
    });

  } catch (error) {
    console.error('Error checking wallet status:', error);
    return NextResponse.json(
      { error: 'Failed to check wallet status' },
      { status: 500 }
    );
  }
}
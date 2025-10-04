import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '../../../../utils/rateLimit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimited = await rateLimit(ip, 'balance_check', 30); // 30 requests per minute
  
  if (rateLimited) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user balances
    const { data: balances, error: balancesError } = await supabase
      .from('crypto_balances')
      .select('*')
      .eq('user_id', user.id);
    
    if (balancesError) {
      console.error('Error fetching balances:', balancesError);
      return NextResponse.json(
        { error: 'Failed to fetch balances' },
        { status: 500 }
      );
    }
    
    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (txError) {
      console.error('Error fetching transactions:', txError);
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      balances: balances || [],
      transactions: transactions || []
    });
  } catch (error) {
    console.error('Error processing balance request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimited = await rateLimit(ip, 'withdraw_request', 5); // 5 requests per minute
  
  if (rateLimited) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      { status: 429 }
    );
  }
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const { amount, currency, address } = await request.json();
    
    if (!amount || !currency || !address) {
      return NextResponse.json(
        { error: 'Amount, currency, and address are required' },
        { status: 400 }
      );
    }
    
    // Check if user has sufficient balance
    const { data: balance, error: balanceError } = await supabase
      .from('crypto_balances')
      .select('amount')
      .eq('user_id', user.id)
      .eq('currency', currency)
      .single();
    
    if (balanceError || !balance) {
      return NextResponse.json(
        { error: 'Balance not found' },
        { status: 404 }
      );
    }
    
    if (balance.amount < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }
    
    // Create withdrawal request (pending admin approval)
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount,
        currency,
        status: 'pending',
        metadata: { address }
      })
      .select()
      .single();
    
    if (txError) {
      console.error('Error creating withdrawal request:', txError);
      return NextResponse.json(
        { error: 'Failed to create withdrawal request' },
        { status: 500 }
      );
    }
    
    // Create audit log
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'withdrawal_request',
        details: {
          transaction_id: transaction.id,
          amount,
          currency,
          address
        }
      });
    
    return NextResponse.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
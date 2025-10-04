import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { recordTransaction } from '../../../../utils/transactionLedger';
import { rateLimit } from '../../../../utils/rateLimit';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimited = await rateLimit(ip, 'ticket_purchase', 10); // 10 requests per minute
  
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
    const { raffleId, ticketCount = 1, paymentMethod, txHash } = await request.json();
    
    if (!raffleId) {
      return NextResponse.json(
        { error: 'Raffle ID is required' },
        { status: 400 }
      );
    }
    
    // Get raffle details to determine ticket price
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();
    
    if (raffleError || !raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      );
    }
    
    const ticketPrice = raffle.ticket_price;
    const totalAmount = ticketPrice * ticketCount;
    const currency = raffle.currency || 'USD';
    
    // Begin database transaction
    const { data: result, error: txError } = await supabase.rpc('purchase_tickets', {
      p_user_id: user.id,
      p_raffle_id: raffleId,
      p_ticket_count: ticketCount,
      p_amount: totalAmount,
      p_currency: currency,
      p_payment_method: paymentMethod,
      p_tx_hash: txHash
    });
    
    if (txError) {
      console.error('Error purchasing tickets:', txError);
      return NextResponse.json(
        { error: 'Failed to purchase tickets' },
        { status: 500 }
      );
    }
    
    // Record the transaction in the ledger
    await recordTransaction(
      user.id,
      'purchase',
      totalAmount,
      currency,
      'completed',
      txHash,
      { 
        raffleId, 
        ticketCount,
        paymentMethod,
        ticketIds: result.ticket_ids
      }
    );
    
    return NextResponse.json({
      success: true,
      tickets: result.tickets,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Error processing ticket purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
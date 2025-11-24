import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/utils/supabase/server-side-service';

interface BuyTicketRequest {
  giveawayId: string;
  userId: string;
  amountUsd: number; // USDT-equivalent per-ticket price from client
  quantity: number; // number of tickets to buy
}

export async function POST(req: NextRequest) {
  try {
    const { giveawayId, userId, amountUsd, quantity }: BuyTicketRequest = await req.json();

    if (!giveawayId || !userId || typeof amountUsd !== 'number' || amountUsd <= 0 || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Server-side Supabase client using service role (RLS bypass)
    const supabase = createClient();
    // Atomic purchase via RPC (single transaction server-side)
    const { data, error } = await supabase.rpc('buy_giveaway_tickets_v2', {
      p_giveaway_id: giveawayId,
      p_user_id: userId,
      p_quantity: quantity,
    });

    if (error) {
      console.error('RPC buy_giveaway_tickets_v2 error:', error);
      return NextResponse.json({ error: error.message || 'Purchase failed' }, { status: 400 });
    }

    const result = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({
      success: true,
      purchaseId: result.purchase_id,
      newBalanceUsd: result.new_balance_usd,
      totalCostUsd: result.total_cost_usd,
      issuedTickets: result.issued_tickets,
      createdAt: result.created_at,
      message: 'Tickets purchased successfully.'
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in buy-ticket API:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
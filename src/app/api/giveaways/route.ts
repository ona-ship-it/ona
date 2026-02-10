import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: giveaways, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching giveaways:', error);
      return NextResponse.json(
        { error: 'Failed to fetch giveaways' },
        { status: 500 }
      );
    }

    const { data: paidTickets, error: paidTicketsError } = await supabase
      .from('tickets')
      .select('giveaway_id, quantity')
      .eq('is_free', false)

    if (paidTicketsError) {
      console.error('Error fetching paid tickets:', paidTicketsError);
    }

    const paidTicketCounts = new Map<string, number>();
    (paidTickets || []).forEach((ticket) => {
      if (!ticket.giveaway_id) return;
      paidTicketCounts.set(
        ticket.giveaway_id,
        (paidTicketCounts.get(ticket.giveaway_id) || 0) + (ticket.quantity || 1)
      );
    });

    const enrichedGiveaways = (giveaways || []).map((giveaway) => {
      const ticketPrice = giveaway.ticket_price || 0;
      const paidCount = paidTicketCounts.get(giveaway.id) || 0;
      const paidRevenue = paidCount * ticketPrice;
      return {
        ...giveaway,
        paid_ticket_count: paidCount,
        paid_ticket_revenue: paidRevenue,
        prize_boost: paidRevenue * 0.4,
        onagui_subs: paidRevenue * 0.1,
      };
    });

    return NextResponse.json({ giveaways: enrichedGiveaways });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
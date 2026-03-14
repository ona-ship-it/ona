import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { giveawayId, entryType } = await request.json()

    if (!giveawayId) {
      return NextResponse.json({ error: 'Giveaway ID required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch giveaway details
    const { data: giveaway, error: giveawayError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveawayId)
      .single()

    if (giveawayError || !giveaway) {
      return NextResponse.json({ error: 'Giveaway not found' }, { status: 404 })
    }

    // Validate giveaway is active
    if (giveaway.status !== 'active') {
      return NextResponse.json({ error: 'Giveaway is not active' }, { status: 400 })
    }

    // Check if not ended
    if (new Date(giveaway.end_date) < new Date()) {
      return NextResponse.json({ error: 'Giveaway has ended' }, { status: 400 })
    }

    const hasTicketLimit = Number(giveaway.total_tickets) > 0

    // Check if not sold out (0 means unlimited)
    if (hasTicketLimit && giveaway.tickets_sold >= giveaway.total_tickets) {
      return NextResponse.json({ error: 'Giveaway is sold out' }, { status: 400 })
    }

    const normalizedEntryType = entryType === 'paid' ? 'paid' : 'free'

    if (normalizedEntryType === 'free') {
      const freeTicketLimit = Number(giveaway.free_ticket_limit || 0)

      if (freeTicketLimit > 0) {
        const { count: claimedFreeTickets, error: freeTicketCountError } = await supabase
          .from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('giveaway_id', giveawayId)
          .eq('is_free', true)

        if (freeTicketCountError) {
          return NextResponse.json({ error: 'Failed to validate free ticket limit' }, { status: 500 })
        }

        if ((claimedFreeTickets || 0) >= freeTicketLimit) {
          return NextResponse.json({ error: 'Free tickets are fully claimed for this giveaway' }, { status: 400 })
        }
      }

      const { data: existingFreeTicket, error: existingFreeTicketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('giveaway_id', giveawayId)
        .eq('user_id', user.id)
        .eq('is_free', true)
        .maybeSingle()

      if (existingFreeTicketError) {
        return NextResponse.json({ error: 'Failed to validate free entry' }, { status: 500 })
      }

      if (existingFreeTicket) {
        return NextResponse.json({ error: 'Free entry already claimed' }, { status: 400 })
      }
    }

    // Create ticket entry
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          giveaway_id: giveawayId,
          user_id: user.id,
          is_free: normalizedEntryType === 'free',
          quantity: 1,
          purchase_price: normalizedEntryType === 'free' ? 0 : 1,
          payment_currency: normalizedEntryType === 'free' ? 'FREE' : 'USDC',
          payment_method: normalizedEntryType === 'free' ? 'free' : 'usdc',
        },
      ])
      .select()
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
    }

    // Create transaction record
    await supabase.from('transactions').insert([
      {
        user_id: user.id,
        giveaway_id: giveawayId,
        ticket_id: ticket.id,
        transaction_type: 'ticket_purchase',
        amount: normalizedEntryType === 'free' ? 0 : 1,
        currency: normalizedEntryType === 'free' ? 'FREE' : 'USDC',
        payment_method: normalizedEntryType === 'free' ? 'free' : 'usdc',
        status: 'completed',
      },
    ])

    await supabase.from('participation_events').insert([
      {
        event_type: 'giveaway_entry',
        entity_type: 'giveaway',
        entity_id: giveawayId,
        user_id: user.id,
        metadata: { entry_type: normalizedEntryType },
      },
    ])

    return NextResponse.json({ 
      success: true, 
      ticket,
      message: normalizedEntryType === 'free' ? 'Free ticket claimed!' : 'Paid ticket purchased!'
    })
  } catch (error: any) {
    console.error('Entry error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

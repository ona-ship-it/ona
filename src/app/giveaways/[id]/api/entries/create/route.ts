import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { giveawayId } = await request.json()

    if (!giveawayId) {
      return NextResponse.json({ error: 'Giveaway ID required' }, { status: 400 })
    }

    const cookieStore = cookies()
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

    // Check if not sold out
    if (giveaway.tickets_sold >= giveaway.total_tickets) {
      return NextResponse.json({ error: 'Giveaway is sold out' }, { status: 400 })
    }

    // Only handle free entries for now
    if (!giveaway.is_free) {
      return NextResponse.json({ error: 'Paid entries require wallet connection' }, { status: 400 })
    }

    // Create ticket entry
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          giveaway_id: giveawayId,
          user_id: user.id,
          purchase_price: 0,
          payment_currency: 'FREE',
          payment_method: 'free',
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
        amount: 0,
        currency: 'FREE',
        payment_method: 'free',
        status: 'completed',
      },
    ])

    return NextResponse.json({ 
      success: true, 
      ticket,
      message: 'Entry successful!' 
    })
  } catch (error: any) {
    console.error('Entry error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

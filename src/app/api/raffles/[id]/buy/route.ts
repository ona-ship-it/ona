import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { quantity, walletAddress } = await request.json()
    const { id: raffleId } = await context.params

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 })
    }
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch raffle with lock (select for update via RPC or re-verify after insert)
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('id, status, total_tickets, tickets_sold, base_ticket_price, max_per_user, country_restriction')
      .eq('id', raffleId)
      .single()

    if (raffleError || !raffle) {
      return NextResponse.json({ error: 'Raffle not found' }, { status: 404 })
    }
    if (raffle.status !== 'active') {
      return NextResponse.json({ error: 'Raffle is not active' }, { status: 400 })
    }

    const remaining = raffle.total_tickets - raffle.tickets_sold
    if (quantity > remaining) {
      return NextResponse.json({ error: `Only ${remaining} tickets remaining` }, { status: 400 })
    }

    // Max per user check
    const { count: userTicketCount } = await supabase
      .from('raffle_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('raffle_id', raffleId)
      .eq('user_id', user.id)

    const currentUserTickets = userTicketCount ?? 0
    if (currentUserTickets + quantity > raffle.max_per_user) {
      return NextResponse.json(
        { error: `You can only hold ${raffle.max_per_user} tickets for this raffle. You already have ${currentUserTickets}.` },
        { status: 400 }
      )
    }

    const ticketPrice = raffle.base_ticket_price ?? 1
    const totalPrice = ticketPrice * quantity

    // Generate sequential ticket numbers server-side using the current sold count
    // We optimistically increment here; DB trigger should also keep tickets_sold updated.
    const startTicket = raffle.tickets_sold + 1
    const ticketNumbers = Array.from({ length: quantity }, (_, i) => startTicket + i)

    // Insert tickets
    const { error: ticketError } = await supabase.from('raffle_tickets').insert({
      raffle_id: raffleId,
      user_id: user.id,
      ticket_numbers: ticketNumbers,
      quantity,
      final_price: totalPrice,
      payment_currency: 'USDC',
      blockchain: 'Polygon',
      wallet_address: walletAddress,
      purchased_at: new Date().toISOString(),
    })

    if (ticketError) {
      console.error('Ticket insert error:', ticketError)
      return NextResponse.json({ error: 'Failed to record tickets. Please try again.' }, { status: 500 })
    }

    // Update tickets_sold count
    const { error: updateError } = await supabase
      .from('raffles')
      .update({ tickets_sold: raffle.tickets_sold + quantity })
      .eq('id', raffleId)
      .eq('tickets_sold', raffle.tickets_sold) // optimistic lock — fails if count changed

    if (updateError) {
      // Rollback ticket insert
      await supabase.from('raffle_tickets').delete().eq('raffle_id', raffleId).eq('user_id', user.id).contains('ticket_numbers', ticketNumbers)
      return NextResponse.json({ error: 'Ticket count conflict — please try again' }, { status: 409 })
    }

    return NextResponse.json({
      success: true,
      ticketNumbers,
      totalPrice,
      currency: 'USDC',
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal server error'
    console.error('Buy tickets error:', err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

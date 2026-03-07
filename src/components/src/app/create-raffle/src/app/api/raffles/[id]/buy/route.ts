import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const raffleId = params.id

    // 1. Check user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to buy tickets' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const quantity = parseInt(body.quantity) || 1

    if (quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Invalid quantity (1-1000)' },
        { status: 400 }
      )
    }

    // 3. Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single()

    if (raffleError || !raffle) {
      return NextResponse.json(
        { error: 'Raffle not found' },
        { status: 404 }
      )
    }

    // 4. Validate raffle is active
    if (raffle.status !== 'active') {
      return NextResponse.json(
        { error: 'This raffle is no longer active' },
        { status: 400 }
      )
    }

    // 5. Check raffle hasn't ended
    if (new Date(raffle.end_date) < new Date()) {
      return NextResponse.json(
        { error: 'This raffle has ended' },
        { status: 400 }
      )
    }

    // 6. Check tickets available
    if (raffle.tickets_sold + quantity > raffle.total_tickets) {
      return NextResponse.json(
        { error: `Only ${raffle.total_tickets - raffle.tickets_sold} tickets remaining` },
        { status: 400 }
      )
    }

    // 7. Creator cannot buy own raffle tickets
    if (user.id === raffle.creator_id) {
      return NextResponse.json(
        { error: 'Creator cannot buy tickets to own raffle' },
        { status: 403 }
      )
    }

    // 8. Check user hasn't exceeded max per user
    const { data: existingTickets } = await supabase
      .from('raffle_tickets')
      .select('quantity')
      .eq('raffle_id', raffleId)
      .eq('user_id', user.id)

    const userTotal = existingTickets?.reduce((sum, t) => sum + t.quantity, 0) || 0

    if (userTotal + quantity > raffle.max_per_user) {
      return NextResponse.json(
        { error: `Exceeds max ${raffle.max_per_user} tickets per user. You already own ${userTotal}.` },
        { status: 400 }
      )
    }

    // 9. Insert ticket purchase
    // NOTE: The database trigger (check_raffle_ticket_purchase) also validates
    // and auto-increments tickets_sold on the raffle
    const { data: ticket, error: insertError } = await supabase
      .from('raffle_tickets')
      .insert({
        raffle_id: raffleId,
        user_id: user.id,
        quantity: quantity,
        transaction_hash: null,  // TODO: add on-chain tx hash when wallet integration is live
      })
      .select()
      .single()

    if (insertError) {
      // Database trigger may throw specific errors
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      )
    }

    // 10. Handle referral if applicable
    const referralCode = body.referral_code
    if (referralCode && raffle.referral_enabled && raffle.referral_rate > 0) {
      try {
        // referral_code is the referrer's user_id
        const commission = quantity * raffle.ticket_price * (raffle.referral_rate / 100)

        await supabase
          .from('raffle_referrals')
          .insert({
            raffle_id: raffleId,
            referrer_user_id: referralCode,
            buyer_user_id: user.id,
            ticket_id: ticket.id,
            commission_amount: commission,
            paid: false,
          })
      } catch (refError) {
        // Don't fail the purchase if referral tracking fails
        console.error('Referral tracking error:', refError)
      }
    }

    // 11. Check if raffle just sold out — trigger settlement
    const updatedSold = raffle.tickets_sold + quantity
    if (updatedSold >= raffle.total_tickets) {
      // Update raffle status to settling
      await supabase
        .from('raffles')
        .update({ status: 'settling' })
        .eq('id', raffleId)

      // TODO: Trigger winner selection (cron job or direct call)
      // For now, admin will manually trigger via /api/admin/raffles/[id]/settle
    }

    return NextResponse.json({
      success: true,
      ticket_id: ticket.id,
      quantity: quantity,
      total_cost: quantity * raffle.ticket_price,
      user_total_tickets: userTotal + quantity,
      raffle_tickets_sold: updatedSold,
      message: `Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`,
    })

  } catch (error: any) {
    console.error('Buy ticket error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/utils/supabase/server-admin'
import { getIdempotencyKey, persistIdempotencyResult, reserveIdempotencyKey } from '@/lib/idempotency'

export async function POST(request: Request) {
  try {
    const { giveawayId } = await request.json()

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

    const idempotencyKey = getIdempotencyKey(request)
    const idempotencyEndpoint = `entries:${giveawayId}:create`
    let adminClient: Awaited<ReturnType<typeof createAdminSupabaseClient>> | null = null

    const respond = async (body: Record<string, unknown>, status: number) => {
      if (idempotencyKey && adminClient) {
        await persistIdempotencyResult({
          adminClient,
          userId: user.id,
          endpoint: idempotencyEndpoint,
          key: idempotencyKey,
          statusCode: status,
          body,
        })
      }
      return NextResponse.json(body, { status })
    }

    if (idempotencyKey) {
      adminClient = await createAdminSupabaseClient()
      const reservation = await reserveIdempotencyKey({
        adminClient,
        userId: user.id,
        endpoint: idempotencyEndpoint,
        key: idempotencyKey,
      })

      if (reservation.type === 'replay') {
        return NextResponse.json(reservation.body, { status: reservation.statusCode })
      }

      if (reservation.type === 'in_progress') {
        return NextResponse.json(
          { error: 'This entry is already being processed. Please wait a moment and retry.' },
          { status: 409 }
        )
      }
    }

    // Fetch giveaway details
    const { data: giveaway, error: giveawayError } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveawayId)
      .single()

    if (giveawayError || !giveaway) {
      return respond({ error: 'Giveaway not found' }, 404)
    }

    // Validate giveaway is active
    if (giveaway.status !== 'active') {
      return respond({ error: 'Giveaway is not active' }, 400)
    }

    // Check if not ended
    if (new Date(giveaway.end_date) < new Date()) {
      return respond({ error: 'Giveaway has ended' }, 400)
    }

    const hasTicketLimit = Number(giveaway.total_tickets) > 0

    // Check if not sold out (0 means unlimited)
    if (hasTicketLimit && giveaway.tickets_sold >= giveaway.total_tickets) {
      return respond({ error: 'Giveaway is sold out' }, 400)
    }

    // Only handle free entries for now
    if (!giveaway.is_free) {
      return respond({ error: 'Paid entries require wallet connection' }, 400)
    }

    const freeTicketLimit = Number(giveaway.free_ticket_limit || 0)
    if (freeTicketLimit > 0) {
      const { count: claimedFreeTickets, error: freeTicketCountError } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('giveaway_id', giveawayId)
        .eq('is_free', true)

      if (freeTicketCountError) {
        return respond({ error: 'Failed to validate free ticket limit' }, 500)
      }

      if ((claimedFreeTickets || 0) >= freeTicketLimit) {
        return respond({ error: 'Free tickets are fully claimed for this giveaway' }, 400)
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
      return respond({ error: 'Failed to validate free entry' }, 500)
    }

    if (existingFreeTicket) {
      return respond({ error: 'Free entry already claimed' }, 400)
    }

    // Create ticket entry
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          giveaway_id: giveawayId,
          user_id: user.id,
          is_free: true,
          quantity: 1,
          purchase_price: 0,
          payment_currency: 'FREE',
          payment_method: 'free',
        },
      ])
      .select()
      .single()

    if (ticketError) {
      console.error('Ticket creation error:', ticketError)
      return respond({ error: 'Failed to create entry' }, 500)
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

    return respond({ 
      success: true, 
      ticket,
      message: 'Entry successful!' 
    }, 200)
  } catch (error: unknown) {
    console.error('Entry error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

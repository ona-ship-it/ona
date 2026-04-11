import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { authorizeCronRequest } from '@/lib/cronAuth'

export async function GET(request: NextRequest) {
  const authError = authorizeCronRequest(request)
  if (authError) return authError

  const supabase = await createClient()
  const now = new Date().toISOString()

  try {
    // Find all raffles that have expired and not yet had a winner drawn
    const { data: expiredRaffles, error: fetchError } = await supabase
      .from('raffles')
      .select('id, title, total_tickets, tickets_sold, creator_id')
      .eq('status', 'active')
      .lt('end_date', now)
      .is('winner_id', null)

    if (fetchError) throw fetchError
    if (!expiredRaffles || expiredRaffles.length === 0) {
      return NextResponse.json({ message: 'No raffles to draw', drawn: 0 })
    }

    const drawn: string[] = []

    for (const raffle of expiredRaffles) {
      try {
        if (raffle.tickets_sold === 0) {
          // No tickets sold — mark as cancelled
          await supabase.from('raffles').update({ status: 'cancelled' }).eq('id', raffle.id)
          continue
        }

        // Pick a random ticket number between 1 and tickets_sold
        const winningTicket = Math.floor(Math.random() * raffle.tickets_sold) + 1

        // Find the ticket holder
        const { data: ticket } = await supabase
          .from('raffle_tickets')
          .select('user_id, ticket_numbers')
          .eq('raffle_id', raffle.id)
          .contains('ticket_numbers', [winningTicket])
          .single()

        if (!ticket) {
          // Fallback: pick any ticket holder at random
          const { data: anyTicket } = await supabase
            .from('raffle_tickets')
            .select('user_id')
            .eq('raffle_id', raffle.id)
            .limit(1)
            .single()
          if (!anyTicket) continue

          await supabase.from('raffles').update({
            status: 'completed',
            winner_id: anyTicket.user_id,
            winner_drawn_at: now,
          }).eq('id', raffle.id)
        } else {
          await supabase.from('raffles').update({
            status: 'completed',
            winner_id: ticket.user_id,
            winner_drawn_at: now,
          }).eq('id', raffle.id)
        }

        drawn.push(raffle.id)
        console.log(`Winner drawn for raffle ${raffle.id} (${raffle.title})`)
      } catch (raffleErr) {
        console.error(`Failed to draw winner for raffle ${raffle.id}:`, raffleErr)
      }
    }

    return NextResponse.json({ message: 'Draw complete', drawn: drawn.length, raffleIds: drawn })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown cron error'
    console.error('Draw winners cron error:', err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Close expired giveaways
    await supabase.rpc('check_expired_giveaways')
    
    // Close sold out raffles
    await supabase.rpc('check_sold_out_raffles')

    // Get giveaways that need winners drawn
    const { data: expiredGiveaways } = await supabase
      .from('giveaways')
      .select('id, title')
      .eq('status', 'ended')
      .is('winner_id', null)

    // Get raffles that need winners drawn
    const { data: completedRaffles } = await supabase
      .from('raffles')
      .select('id, title')
      .eq('status', 'sold_out')
      .is('winner_id', null)

    const results = {
      giveawaysDrawn: 0,
      rafflesDrawn: 0,
      errors: [] as string[],
    }

    // Draw giveaway winners
    if (expiredGiveaways && expiredGiveaways.length > 0) {
      for (const giveaway of expiredGiveaways) {
        try {
          const { data: winnerId, error } = await supabase.rpc('draw_giveaway_winner', {
            giveaway_uuid: giveaway.id,
          })

          if (error) throw error

          // Create winner notification
          await supabase.from('winner_notifications').insert({
            giveaway_id: giveaway.id,
            winner_id: winnerId,
            notification_type: 'email',
            status: 'pending',
          })

          results.giveawaysDrawn++
        } catch (error: any) {
          results.errors.push(`Giveaway ${giveaway.id}: ${error.message}`)
        }
      }
    }

    // Draw raffle winners
    if (completedRaffles && completedRaffles.length > 0) {
      for (const raffle of completedRaffles) {
        try {
          const { data: winnerId, error } = await supabase.rpc('draw_raffle_winner', {
            raffle_uuid: raffle.id,
          })

          if (error) throw error

          // Create winner notification
          await supabase.from('winner_notifications').insert({
            raffle_id: raffle.id,
            winner_id: winnerId,
            notification_type: 'email',
            status: 'pending',
          })

          results.rafflesDrawn++
        } catch (error: any) {
          results.errors.push(`Raffle ${raffle.id}: ${error.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Allow POST as well for manual testing
export async function POST(request: Request) {
  return GET(request)
}

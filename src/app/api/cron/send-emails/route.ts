import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { 
  sendWinnerEmail, 
  sendEntryConfirmationEmail,
  sendRaffleTicketConfirmationEmail,
  sendRaffleApprovalEmail,
  sendEndingSoonEmail 
} from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      winnerEmails: 0,
      errors: [] as string[],
    }

    // Get pending winner notifications
    const { data: notifications } = await supabase
      .from('winner_notifications')
      .select('*, giveaways(*), raffles(*)')
      .eq('status', 'pending')
      .eq('notification_type', 'email')
      .limit(10)

    if (notifications && notifications.length > 0) {
      for (const notification of notifications) {
        try {
          // Get winner profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', notification.winner_id)
            .single()

          if (!profile?.email) {
            throw new Error('No email found for winner')
          }

          // Send winner email
          const result = notification.giveaway_id
            ? await sendWinnerEmail({
                to: profile.email,
                winnerName: profile.full_name || 'Winner',
                prizeName: notification.giveaways.title,
                prizeValue: notification.giveaways.prize_value,
                giveawayId: notification.giveaway_id,
              })
            : await sendWinnerEmail({
                to: profile.email,
                winnerName: profile.full_name || 'Winner',
                prizeName: notification.raffles.title,
                prizeValue: notification.raffles.prize_value,
                raffleId: notification.raffle_id,
              })

          // Update notification status
          await supabase
            .from('winner_notifications')
            .update({
              status: result.success ? 'sent' : 'failed',
              sent_at: new Date().toISOString(),
              error_message: result.success ? null : JSON.stringify(result.error),
            })
            .eq('id', notification.id)

          if (result.success) {
            results.winnerEmails++
          }
        } catch (error: any) {
          results.errors.push(`Notification ${notification.id}: ${error.message}`)
          
          // Mark as failed
          await supabase
            .from('winner_notifications')
            .update({
              status: 'failed',
              error_message: error.message,
            })
            .eq('id', notification.id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Email cron error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}

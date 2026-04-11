import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendWinnerEmail } from '@/lib/email'
import { authorizeCronRequest } from '@/lib/cronAuth'

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

async function sendWinnerEmailWithRetry(payload: Parameters<typeof sendWinnerEmail>[0], maxAttempts = 2) {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await sendWinnerEmail(payload)
    if (result.success) {
      return result
    }

    lastError = result.error
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 250))
    }
  }

  return {
    success: false,
    error: lastError ?? 'Failed to send winner email after retries',
  }
}

export async function GET(request: Request) {
  try {
    const authError = authorizeCronRequest(request)
    if (authError) return authError

    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Missing Supabase server environment configuration' },
        { status: 500 }
      )
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
            ? await sendWinnerEmailWithRetry({
                to: profile.email,
                winnerName: profile.full_name || 'Winner',
                prizeName: notification.giveaways.title,
                prizeValue: notification.giveaways.prize_value,
                giveawayId: notification.giveaway_id,
              })
            : await sendWinnerEmailWithRetry({
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
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown notification error'
          results.errors.push(`Notification ${notification.id}: ${errorMessage}`)
          
          // Mark as failed
          await supabase
            .from('winner_notifications')
            .update({
              status: 'failed',
              error_message: errorMessage,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown email cron error'
    console.error('Email cron error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}

export const maxDuration = 60 // Email sending
export const dynamic = 'force-dynamic'

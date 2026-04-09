import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { isAdmin } from '@/lib/admin'
import type { Database } from '@/types/supabase'

type CookieOptions = Record<string, unknown>

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...(options as Record<string, unknown>) })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...(options as Record<string, unknown>) })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get giveaways with NO entries (free + paid tickets = 0)
    const { data: giveaways, error } = await supabase
      .from('giveaways')
      .select(`
        id,
        title,
        description,
        image_url,
        prize_value,
        prize_currency,
        tickets_sold,
        total_tickets,
        ticket_price,
        is_free,
        status,
        end_date,
        created_at,
        creator_id,
        promotions_count,
        promoted_at
      `)
      .eq('tickets_sold', 0)
      .neq('status', 'deleted')

    if (error) {
      console.error('Error fetching giveaways with no entries:', error)
      return NextResponse.json({ error: 'Failed to fetch giveaways' }, { status: 500 })
    }

    return NextResponse.json({ giveaways })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Promote a giveaway (featured/pinned)
export async function POST(request: NextRequest) {
  try {
    const { giveawayId, action } = await request.json()

    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...(options as Record<string, unknown>) })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...(options as Record<string, unknown>) })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (action === 'promote') {
      const supabaseAny = supabase as any

      const { error: incrementError } = await supabaseAny.rpc('increment_promotion_count', {
        giveaway_id: giveawayId,
      })

      if (incrementError) {
        console.error('Failed to increment promotion count:', incrementError)
      }

      const { error } = await supabaseAny
        .from('giveaways')
        .update({
          promoted_at: new Date().toISOString(),
        })
        .eq('id', giveawayId)

      if (error) {
        return NextResponse.json({ error: 'Failed to promote giveaway' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Giveaway promoted' })
    } else if (action === 'delete') {
      // Soft delete or hard delete
      const { error } = await supabase
        .from('giveaways')
        .update({ status: 'deleted', deleted_at: new Date().toISOString() })
        .eq('id', giveawayId)

      if (error) {
        return NextResponse.json({ error: 'Failed to delete giveaway' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Giveaway deleted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/supabase'

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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userMetadata } = await supabase.auth.getUser()
    const isAdmin = userMetadata?.user?.user_metadata?.is_admin === true

    if (!isAdmin) {
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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userMetadata } = await supabase.auth.getUser()
    const isAdmin = userMetadata?.user?.user_metadata?.is_admin === true

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    if (action === 'promote') {
      // Mark as promoted and increment counter
      const { error } = await supabase
        .from('giveaways')
        .update({
          is_featured: true,
          promoted_at: new Date().toISOString(),
          promotions_count: supabase.rpc('increment_promotion_count', { giveaway_id: giveawayId }),
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

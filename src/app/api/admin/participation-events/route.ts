import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin'
import type { Database } from '@/types/supabase'

export async function GET(request: NextRequest) {
  try {
    const rangeParam = request.nextUrl.searchParams.get('range')
    const rangeDays = rangeParam === '30' ? 30 : 7
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const service = createClient<Database>(url, key)

    const { data: events, error: eventsError } = await service
      .from('participation_events')
      .select('id, event_type, entity_type, entity_id, user_id, session_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    const now = Date.now()
    const rangeStart = now - rangeDays * 24 * 60 * 60 * 1000

    const recentEvents = (events || []).map((event) => ({
      ...event,
      created_at: event.created_at || null,
    }))

    const weeklyEvents = recentEvents.filter((event) => {
      if (!event.created_at) return false
      return new Date(event.created_at).getTime() >= rangeStart
    })

    const eventsByType: Record<string, number> = {}
    weeklyEvents.forEach((event) => {
      const key = event.event_type || 'unknown'
      eventsByType[key] = (eventsByType[key] || 0) + 1
    })

    return NextResponse.json({
      totalEvents: weeklyEvents.length,
      eventsByType,
      recentEvents: recentEvents.slice(0, 20),
    })
  } catch (error) {
    console.error('Participation events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

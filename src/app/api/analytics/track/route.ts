import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type TrackPayload = {
  eventType?: string
  entityType?: string
  entityId?: string
  sessionId?: string
  metadata?: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackPayload
    const { eventType, entityType, entityId, sessionId, metadata } = body

    if (!eventType) {
      return NextResponse.json({ error: 'eventType required' }, { status: 400 })
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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('participation_events').insert([
      {
        event_type: eventType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        user_id: user?.id || null,
        session_id: sessionId || null,
        metadata: metadata || null,
      },
    ])

    if (error) {
      console.error('Analytics insert error:', error)
      return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

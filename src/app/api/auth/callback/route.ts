import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure user profile records exist after OAuth sign-in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const derivedUsername = (user.email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || derivedUsername

        await supabase.from('app_users').upsert({
          id: user.id,
          email: user.email,
          username: derivedUsername,
          created_at: user.created_at,
        }, { onConflict: 'id' })

        await supabase.from('onagui_profiles').upsert({
          id: user.id,
          username: derivedUsername,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || null,
          onagui_type: 'signed_in',
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || null,
        }, { onConflict: 'id' })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

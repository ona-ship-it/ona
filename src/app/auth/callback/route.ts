import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

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

    // Exchange code for session - that's it!
    // The database trigger will create the profile automatically
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(`${origin}/login`)
    }

    // Success - redirect to profile
    // Profile and wallet were created by database triggers
    return NextResponse.redirect(`${origin}/profile`)
  }

  // No code - redirect home
  return NextResponse.redirect(`${origin}/`)
}

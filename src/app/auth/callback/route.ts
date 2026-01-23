import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = cookies()
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

    try {
      // Exchange code for session
      const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

      if (authError) throw authError

      if (user) {
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile:', fetchError)
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              },
            ])

          if (insertError) {
            console.error('Error creating profile:', insertError)
            // Don't fail the auth flow - profile might be created by trigger
          }
        }

        // Redirect to profile page
        return NextResponse.redirect(`${origin}/profile`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      // Redirect with error
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }
  }

  // Return to home if something went wrong
  return NextResponse.redirect(`${origin}/`)
}

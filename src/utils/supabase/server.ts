import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  // Configure cookie options for production domain
  const getDefaultCookieOptions = (options: CookieOptions = {}): CookieOptions => ({
    ...options,
    domain: process.env.NODE_ENV === 'production' ? '.onagui.com' : options.domain,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: false, // Allow client-side access for auth tokens
  });

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieOptions = getDefaultCookieOptions(options);
            cookieStore.set({ name, value, ...cookieOptions })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = getDefaultCookieOptions(options);
            cookieStore.set({ name, value: '', ...cookieOptions })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
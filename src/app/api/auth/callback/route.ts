import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';

  const origin = requestUrl.origin;
  const redirectUrl = new URL(redirectTo, origin);

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('OAuth callback error:', exchangeError);
      return NextResponse.redirect(new URL('/signup?error=auth_failed', origin));
    }

    // Best-effort: ensure records exist in both tables for the newly signed-in user
    if (sessionData?.user) {
      const user = sessionData.user;
      const username = user.email ? user.email.split('@')[0] : null;
      const fullName = (user.user_metadata as any)?.full_name ?? (user.user_metadata as any)?.name ?? null;
      const avatarUrl = (user.user_metadata as any)?.avatar_url ?? (user.user_metadata as any)?.picture ?? null;

      // Upsert into app_users
      await supabase
        .from('app_users')
        .upsert({
          id: user.id,
          email: user.email,
          username,
          created_at: user.created_at,
        }, { onConflict: 'id' });

      // Upsert into onagui_profiles
      await supabase
        .from('onagui_profiles')
        .upsert({
          id: user.id,
          username,
          full_name: fullName,
          avatar_url: avatarUrl,
          onagui_type: 'signed_in',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
    }
  }

  return NextResponse.redirect(redirectUrl);
}
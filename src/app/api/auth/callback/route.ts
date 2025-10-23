import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/profile';

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
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    // Best-effort: ensure a profile row exists for the newly signed-in user
    if (!exchangeError && sessionData?.user) {
      const user = sessionData.user;
      const username = user.email ? user.email.split('@')[0] : null;
      const fullName = (user.user_metadata as any)?.full_name ?? null;
      const avatarUrl = (user.user_metadata as any)?.avatar_url ?? null;

      // Upsert into onagui_profiles; if trigger ran already, this is a no-op
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

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return NextResponse.redirect(new URL(redirectTo, origin));
}
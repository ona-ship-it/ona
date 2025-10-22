import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // AWAIT the new async createClient function
    const supabase = await createClient();
    
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    // Best-effort: ensure a profile row exists for the newly signed-in user
    if (!exchangeError) {
      const user = sessionData?.user;
      if (user?.id) {
        const username = user.email ? user.email.split('@')[0] : null;
        const fullName = (user.user_metadata as any)?.full_name ?? null;
        const avatarUrl = (user.user_metadata as any)?.avatar_url ?? null;

        // Upsert into public.onagui_profiles; if trigger ran already, this is a no-op
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
  }

  // Get the redirectTo parameter if it exists
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/account';
  
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';

// Sync the authenticated user's profile basics into onagui_profiles
// Updates: avatar_url, username, full_name, onagui_type, updated_at
export async function POST(_req: NextRequest) {
  const supabase = await createRouteSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No user session found' }, { status: 401 });
  }

  const meta = (user.user_metadata || {}) as Record<string, any>;
  const email = user.email || '';
  const username = email ? email.split('@')[0] : (meta.username ?? null);
  const fullName = meta.full_name ?? meta.name ?? null;
  const avatarUrl = meta.picture ?? meta.avatar_url ?? meta.picture_url ?? null;

  // Upsert the profile row
  const payload = {
    id: user.id,
    username: username ?? null,
    full_name: fullName,
    avatar_url: avatarUrl ?? null,
    onagui_type: 'signed_in' as any,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await (supabase as any)
    .from('onagui_profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to upsert profile', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ updated: true, profile: upserted });
}
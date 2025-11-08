import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

export async function GET() {
  const supabase = await createRouteSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'No user session found' }, { status: 401 });
  }

  // Include the DB profile row to keep frontend and backend in sync
  const { data: profile } = await (supabase as any)
    .from('onagui_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ user, profile });
}
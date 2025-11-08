import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

export async function GET() {
  const supabase = await createRouteSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'No user session found' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
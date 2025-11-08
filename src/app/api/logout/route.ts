import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  const supabase = await createRouteSupabase();

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
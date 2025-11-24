import { NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

export async function GET() {
  try {
    const supabase = await createRouteSupabase();

    const { data, error } = await supabase
      .from('giveaways')
      .select(`
        id,
        title,
        description,
        prize_amount,
        tickets_count,
        status,
        ends_at,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, giveaways: data || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { checkRateLimit } from '@/middleware/idempotencyRateLimit';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Basic per-user rate limit using existing helper (deposit bucket)
    const rl = checkRateLimit(user.id, 'deposit');
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: rl.error },
        { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const giveawayId = body.giveawayId as string;
    if (!giveawayId) {
      return NextResponse.json({ ok: false, error: 'giveawayId is required' }, { status: 400 });
    }

    // Prevent duplicate join
    const { data: existing } = await supabase
      .from('tickets')
      .select('id')
      .eq('giveaway_id', giveawayId)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: true, joined: true, message: 'Already joined' });
    }

    const { error } = await (supabase as any)
      .from('tickets')
      .insert({ giveaway_id: giveawayId, user_id: user.id });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, joined: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
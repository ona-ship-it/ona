import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const giveawayId = body.giveawayId as string;
    if (!giveawayId) {
      return NextResponse.json({ ok: false, error: 'giveawayId is required' }, { status: 400 });
    }

    // Validate user is the drafted or final winner
    const { data: g, error: gErr } = await supabase
      .from('giveaways')
      .select('temp_winner_id, winner_id, status')
      .eq('id', giveawayId)
      .single<{ temp_winner_id: string | null; winner_id: string | null; status: string }>();

    if (gErr || !g) {
      return NextResponse.json({ ok: false, error: gErr?.message || 'Giveaway not found' }, { status: 404 });
    }

    const isWinner = g.winner_id === user.id || g.temp_winner_id === user.id;
    if (!isWinner) {
      return NextResponse.json({ ok: false, error: 'not_winner' }, { status: 403 });
    }

    // Record audit event for claiming (does not release escrow)
    const { error } = await (supabase as any)
      .from('giveaway_audit')
      .insert({
        giveaway_id: giveawayId,
        actor_id: user.id,
        target_id: user.id,
        action: 'winner_claimed',
        note: 'Winner confirmed claim',
      });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, claimed: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
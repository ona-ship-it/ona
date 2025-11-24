import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { supabase } = access;
    const body = await request.json().catch(() => ({}));
    const giveawayId = body.giveawayId as string;
    if (!giveawayId) {
      return NextResponse.json({ ok: false, error: 'giveawayId is required' }, { status: 400 });
    }

    const { error } = await (supabase as any).rpc('finalize_giveaway_winner', {
      giveaway_id: giveawayId,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
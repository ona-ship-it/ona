import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createRouteSupabase } from '@/lib/supabaseServer';

type PostBody = unknown;

export async function GET(req: Request) {
  const supabase = await createRouteSupabase();

  const { searchParams } = new URL(req.url);
  const giveawayId = searchParams.get('id');

  if (!giveawayId) {
    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  }

  const { data, error } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', giveawayId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const { action, giveawayId } = payload;
  if (!action || !giveawayId) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const { data: giveaway, error: gErr } = await supabase
    .from('giveaways')
    .select('*')
    .eq('id', giveawayId)
    .single();

  if (gErr || !giveaway) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  if (action === 'update-draft') {
    const updatePayload = {
      title: payload.title,
      description: payload.description,
      prize_amount: payload.prize_amount,
      tickets_count: payload.tickets_count,
      updated_at: new Date().toISOString(),
    };

    const { data, error: updateErr } = await supabase
      .from('giveaways')
      .update(updatePayload)
      .eq('id', giveawayId)
      .select('*')
      .single();

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, giveaway: data });
  }

  if (action === 'pick-winner') {
    const { data: tickets, error: ticketErr } = await supabase
      .from('tickets')
      .select('*')
      .eq('giveaway_id', giveawayId);

    if (ticketErr || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'no_tickets_available' },
        { status: 400 }
      );
    }

    const ticket = tickets[Math.floor(Math.random() * tickets.length)];

    const { data, error: upErr } = await supabase
      .from('giveaways')
      .update({
        temp_winner_id: ticket.user_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', giveawayId)
      .select('*')
      .single();

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, giveaway: data });
  }

  return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });
}

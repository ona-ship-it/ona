import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

// simple in-memory rate limiter per IP (demo only)
const rateMap = new Map<string, { last: number; count: number }>();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // basic rate-limit: 5 claims per minute per IP
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const now = Date.now();
  const bucket = rateMap.get(ip) || { last: now, count: 0 };
  if (now - bucket.last > 60_000) { bucket.count = 0; bucket.last = now; }
  bucket.count++;
  rateMap.set(ip, bucket);
  if (bucket.count > 5) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { id: giveawayId } = await params;

  // check giveaway active
  const { data: g, error: gErr } = await supabase
    .from('giveaways')
    .select('id,status')
    .eq('id', giveawayId)
    .single<{ id: string; status: string }>();
  if (gErr) {
    console.error('giveaway fetch error', gErr);
    return NextResponse.json({ success: false, error: 'Failed to fetch giveaway' }, { status: 500 });
  }
  if (!g || g.status !== 'active') {
    return NextResponse.json({ success: false, error: 'Not active' }, { status: 400 });
  }

  // check existing free ticket
  const { data: existing, error: exErr } = await supabase
    .from('tickets')
    .select('id')
    .eq('giveaway_id', giveawayId)
    .eq('user_id', user.id)
    .eq('is_free', true)
    .limit(1);
  if (exErr) {
    console.error('existing ticket check error', exErr);
    return NextResponse.json({ success: false, error: 'Failed to check tickets' }, { status: 500 });
  }

  if (existing && existing.length) {
    return NextResponse.json({ success: true, already: true });
  }

  // insert ticket (unique index may enforce single free ticket per user)
  const { error } = await (supabase as any)
    .from('tickets')
    .insert({ giveaway_id: giveawayId, user_id: user.id, is_free: true, quantity: 1 });
  if (error) {
    console.error('ticket insert error', error);
    // On conflict of unique free ticket, return already=true
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ success: true, already: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, already: false });
}
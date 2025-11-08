import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

// simple in-memory rate limiter per IP (demo only)
const rateMap = new Map<string, { last: number; count: number }>();

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // basic rate-limit: 20 paid entries per minute per IP
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const now = Date.now();
  const bucket = rateMap.get(ip) || { last: now, count: 0 };
  if (now - bucket.last > 60_000) { bucket.count = 0; bucket.last = now; }
  bucket.count++;
  rateMap.set(ip, bucket);
  if (bucket.count > 20) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); } catch {}
  const giveaway_id = (body?.giveaway_id || '') as string;
  const quantity = Math.max(parseInt(body?.quantity ?? '1', 10), 1);

  if (!giveaway_id) {
    return NextResponse.json({ success: false, error: 'Missing giveaway_id' }, { status: 400 });
  }
  if (quantity > 100) {
    return NextResponse.json({ success: false, error: 'Quantity too large' }, { status: 400 });
  }

  // check giveaway active
  const { data: g, error: gErr } = await supabase
    .from('giveaways')
    .select('id,status,ticket_price')
    .eq('id', giveaway_id)
    .single<{ id: string; status: string; ticket_price: number | null }>();
  if (gErr) {
    console.error('giveaway fetch error', gErr);
    return NextResponse.json({ success: false, error: 'Failed to fetch giveaway' }, { status: 500 });
  }
  if (!g || g.status !== 'active') {
    return NextResponse.json({ success: false, error: 'Not active' }, { status: 400 });
  }

  // Minimal implementation: record tickets (paid entry). Payment handled elsewhere.
  const { data: ticket, error } = await (supabase as any)
    .from('tickets')
    .insert({ giveaway_id, user_id: user.id, is_free: false, quantity })
    .select()
    .single();

  if (error) {
    console.error('paid entry insert error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: ticket });
}
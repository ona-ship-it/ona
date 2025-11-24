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

  // Fetch giveaway status and donation split fields to record in contributions
  const { data: g, error: gErr } = await supabase
    .from('giveaways')
    .select('id,status,donation_split_platform,donation_split_creator,donation_split_prize')
    .eq('id', giveawayId)
    .single<{
      id: string;
      status: string;
      donation_split_platform: number | null;
      donation_split_creator: number | null;
      donation_split_prize: number | null;
    }>();
  if (gErr) {
    console.error('giveaway fetch error', gErr);
    return NextResponse.json({ success: false, error: 'Failed to fetch giveaway' }, { status: 500 });
  }
  if (!g || g.status !== 'active') {
    return NextResponse.json({ success: false, error: 'Not active' }, { status: 400 });
  }

  // Normalize splits; fallback to full prize allocation for claims if missing
  const sp = typeof g.donation_split_platform === 'number' ? Number(g.donation_split_platform) : null;
  const sc = typeof g.donation_split_creator === 'number' ? Number(g.donation_split_creator) : null;
  const sz = typeof g.donation_split_prize === 'number' ? Number(g.donation_split_prize) : null;
  let split_platform = sp ?? 0.0;
  let split_creator = sc ?? 0.0;
  let split_prize = sz ?? 1.0;
  const sum = split_platform + split_creator + split_prize;
  if (Math.abs(sum - 1.0) > 1e-4) {
    // Rebalance to default claim distribution (all to prize)
    split_platform = 0.0;
    split_creator = 0.0;
    split_prize = 1.0;
  }

  // Insert into contributions as a free claim
  const { error } = await (supabase as any)
    .from('giveaway_contributions')
    .insert({
      giveaway_id: giveawayId,
      user_id: user.id,
      kind: 'claim',
      amount: 0,
      currency: 'USDT',
      note: 'Free claim',
      split_platform,
      split_creator,
      split_prize,
    });
  if (error) {
    console.error('contribution insert error', error);
    // Handle unique partial index violation gracefully
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ success: true, already: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, already: false });
}

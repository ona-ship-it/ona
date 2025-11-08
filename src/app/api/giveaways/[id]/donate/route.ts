import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

// simple in-memory rate limiter per IP (demo only)
const rateMap = new Map<string, { last: number; count: number }>();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // basic rate-limit: 10 donations per minute per IP
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const now = Date.now();
  const bucket = rateMap.get(ip) || { last: now, count: 0 };
  if (now - bucket.last > 60_000) { bucket.count = 0; bucket.last = now; }
  bucket.count++;
  rateMap.set(ip, bucket);
  if (bucket.count > 10) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { id: giveawayId } = await params;
  let body: any = {};
  try { body = await req.json(); } catch {}

  const amount = Number(body?.amount);
  const currency = (body?.currency || 'USDT') as string;
  const note = (body?.note || null) as string | null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
  }

  // load giveaway to get donation split defaults
  const { data: g, error: gErr } = await supabase
    .from('giveaways')
    .select('id,status,donation_split_platform,donation_split_creator,donation_split_prize')
    .eq('id', giveawayId)
    .single<{ id: string; status: string; donation_split_platform: number | null; donation_split_creator: number | null; donation_split_prize: number | null }>();
  if (gErr) {
    console.error('giveaway fetch error', gErr);
    return NextResponse.json({ success: false, error: 'Failed to fetch giveaway' }, { status: 500 });
  }
  if (!g || g.status !== 'active') {
    return NextResponse.json({ success: false, error: 'Not active' }, { status: 400 });
  }

  const split_platform = g.donation_split_platform ?? 0.1;
  const split_creator = g.donation_split_creator ?? 0.2;
  const split_prize = g.donation_split_prize ?? 0.7;

  // Ensure splits sum to 1
  const totalSplit = split_platform + split_creator + split_prize;
  const normalized = totalSplit !== 1
    ? {
        split_platform: split_platform / totalSplit,
        split_creator: split_creator / totalSplit,
        split_prize: split_prize / totalSplit,
      }
    : { split_platform, split_creator, split_prize };

  const { data: contrib, error } = await (supabase as any)
    .from('giveaway_contributions')
    .insert({
      giveaway_id: giveawayId,
      user_id: user.id,
      amount,
      currency,
      note,
      split_platform: normalized.split_platform,
      split_creator: normalized.split_creator,
      split_prize: normalized.split_prize,
    })
    .select()
    .single();

  if (error) {
    console.error('donation insert error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: contrib });
}
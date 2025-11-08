import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

// Simple per-IP rate limiter for demo purposes
const rateMap = new Map<string, { last: number; count: number }>();
function checkRate(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = rateMap.get(ip) || { last: now, count: 0 };
  if (now - bucket.last > windowMs) {
    bucket.count = 0;
    bucket.last = now;
  }
  bucket.count++;
  rateMap.set(ip, bucket);
  return bucket.count <= limit;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Basic rate-limit: 120 requests per minute per IP for details
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const ok = checkRate(ip, 120, 60_000);
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { id: giveawayId } = await params;
    const { data, error } = await supabase
      .from('giveaways')
      .select(`
        id,
        title,
        description,
        prize_amount,
        prize_pool_usdt,
        ticket_price,
        tickets_count,
        status,
        escrow_status,
        winner_id,
        temp_winner_id,
        photo_url,
        media_url,
        created_at,
        ends_at,
        creator_id
      `)
      .eq('id', giveawayId)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Giveaway details error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch giveaway details' },
      { status: 500 }
    );
  }
}
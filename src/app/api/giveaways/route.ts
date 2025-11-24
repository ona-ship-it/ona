import { NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

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

export async function GET(req: Request) {
  const supabase = await createRouteSupabase();

  // Basic rate-limit: 60 requests per minute per IP for list
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const ok = checkRate(ip, 60, 60_000);
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const url = new URL(req.url);
    const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('giveaways')
      .select(
        `id,title,description,prize_amount,tickets_count,status,photo_url,media_url,created_at,ends_at`,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count ?? null,
        has_more: count != null ? to + 1 < count : false,
      },
    });
  } catch (error: any) {
    console.error('Giveaways list error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch giveaways' },
      { status: 500 }
    );
  }
}
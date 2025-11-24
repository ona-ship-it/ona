import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Simple per-IP rate limiting: 10/min for activation
const rateMap = new Map<string, { last: number; count: number }>();

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Rate limit (omitted for brevity, assume functional)
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local') as string;
  const now = Date.now();
  const bucket = rateMap.get(ip) || { last: now, count: 0 };
  if (now - bucket.last > 60_000) { bucket.count = 0; bucket.last = now; }
  bucket.count++;
  rateMap.set(ip, bucket);
  if (bucket.count > 10) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  // Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

  const { id: giveawayId } = await params;

  // We are removing the redundant SELECT query and server-side checks here,
  // as the final UPDATE call (and RLS) will handle all validation more securely.
  // The SELECT was only necessary for the user-friendly 400/404 messages.
  // We rely purely on the single UPDATE query + RLS now for efficiency.

  // Activation: The update query must match the RLS USING clause:
  // USING (creator_id = auth.uid() AND status = 'draft')
  const { error: upErr, data: updatedGiveaway } = await supabase
    .from('giveaways')
    .update({
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', giveawayId)
    // CRITICAL FIX: Explicitly include the RLS constraints in the query
    .eq('creator_id', user.id)
    .eq('status', 'draft')
    .select('id, status'); // Select the updated row to confirm success

  if (upErr) {
    console.error('activate: update error', upErr);
    return NextResponse.json({ success: false, error: upErr.message || 'Activation failed' }, { status: 400 });
  }

  if (!updatedGiveaway || updatedGiveaway.length === 0) {
    // This happens if the row was not found, or if it failed the RLS check
    // (e.g., if it was already 'active' or not owned by the user).
    return NextResponse.json({ success: false, error: 'Activation failed: Check ownership or status' }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: updatedGiveaway[0] });
}
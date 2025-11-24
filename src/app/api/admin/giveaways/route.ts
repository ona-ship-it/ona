import { NextRequest, NextResponse } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

export async function GET(req: Request) {
  const supabase = await createRouteSupabase();

  const { searchParams } = new URL(req.url);
  const giveawayId = searchParams.get('id');

  if (!giveawayId) {
    const { data, error } = await supabase
      .from<'giveaways'>('giveaways')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  }

  const { data, error } = await supabase
    .from<'giveaways'>('giveaways')
    .select('*')
    .eq('id', giveawayId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const supabase = access.supabase as SupabaseClient<Database>;
    const body = await request.json();
    const { action, giveawayId } = body;

    switch (action) {
      case 'pick-winner':
        if (!giveawayId) {
          return NextResponse.json(
            { success: false, error: 'Giveaway ID is required' },
            { status: 400 }
          );
        }

        // Try RPC first
        const { data: winnerId, error: pickError } = await (supabase as any)
          .rpc('pick_giveaway_winner', { 
            giveaway_id: giveawayId
          } as any);

        if (!pickError) {
          return NextResponse.json({ success: true, data: { winnerId } });
        }

        // Fallback: select a participant and set temp_winner without changing status
        const { data: ticket, error: tErr } = await supabase
          .from('tickets')
          .select('user_id')
          .eq('giveaway_id', giveawayId)
          .limit(1)
          .single();

        if (tErr || !ticket) {
          throw pickError;
        }

        const updateDraftPayload: Partial<Database['public']['Tables']['giveaways']['Update']> = {
          temp_winner_id: ticket.user_id,
          updated_at: new Date().toISOString(),
        };
        const { error: upErr } = await supabase
          .from<'giveaways'>('giveaways')
          .update(updateDraftPayload)
          .eq('id', giveawayId);

        if (upErr) {
          throw upErr;
        }

        // Log minimal audit entry (best-effort)
        await supabase
          .from('giveaway_audit')
          .insert({ giveaway_id: giveawayId, action: 'draft_winner', actor_id: null, target_id: ticket.user_id, note: 'Fallback pick (no RPC)' });

        return NextResponse.json({ success: true, data: { winnerId: ticket.user_id }, fallback: true });

      case 'finalize-winner':
        if (!giveawayId) {
          return NextResponse.json(
            { success: false, error: 'Giveaway ID is required' },
            { status: 400 }
          );
        }

        // Try RPC first
        const { error: finalizeError } = await (supabase as any)
          .rpc('finalize_giveaway_winner', { giveaway_id: giveawayId } as any);

        if (!finalizeError) {
          return NextResponse.json({ success: true, message: 'Winner finalized successfully' });
        }

        // Fallback: move temp_winner to winner, mark completed, release escrow
        const { data: g, error: gErr } = await (supabase as any)
          .from('giveaways')
          .select('temp_winner_id, prize_amount')
          .eq('id', giveawayId)
          .single();

        if (gErr || !g?.temp_winner_id) {
          throw finalizeError;
        }

        const finalizePayload: Partial<Database['public']['Tables']['giveaways']['Update']> = {
          winner_id: g.temp_winner_id,
          status: 'completed',
          escrow_status: 'released',
          updated_at: new Date().toISOString(),
        };
        const { error: upErr2 } = await supabase
          .from<'giveaways'>('giveaways')
          .update(finalizePayload)
          .eq('id', giveawayId);

        if (upErr2) {
          throw upErr2;
        }

        // Log minimal audit entries
        await supabase.from('giveaway_audit').insert({ giveaway_id: giveawayId, action: 'winner_finalized', actor_id: null, target_id: g.temp_winner_id, note: 'Fallback finalize (no RPC)' });
        await supabase.from('giveaway_audit').insert({ giveaway_id: giveawayId, action: 'escrow_released', actor_id: null, note: `Prize released (fallback)` });

        return NextResponse.json({ success: true, message: 'Winner finalized (fallback)' });

      case 'repick-winner':
        if (!giveawayId) {
          return NextResponse.json(
            { success: false, error: 'Giveaway ID is required' },
            { status: 400 }
          );
        }

        // Try RPC first
        const { data: newWinnerId, error: repickError } = await (supabase as any)
          .rpc('repick_giveaway_winner', { giveaway_id: giveawayId } as any);

        if (!repickError) {
          return NextResponse.json({ success: true, data: { winnerId: newWinnerId } });
        }

        // Fallback: clear temp and pick first ticket holder again
        const clearTempPayload: Partial<Database['public']['Tables']['giveaways']['Update']> = {
          temp_winner_id: null,
          updated_at: new Date().toISOString(),
        };
        await supabase
          .from<'giveaways'>('giveaways')
          .update(clearTempPayload)
          .eq('id', giveawayId);

        const { data: ticket2, error: tErr2 } = await supabase
          .from('tickets')
          .select('user_id')
          .eq('giveaway_id', giveawayId)
          .limit(1)
          .single();

        if (tErr2 || !ticket2) {
          throw repickError;
        }

        const repickPayload: Partial<Database['public']['Tables']['giveaways']['Update']> = {
          temp_winner_id: ticket2.user_id,
          updated_at: new Date().toISOString(),
        };
        const { error: upErr3 } = await supabase
          .from<'giveaways'>('giveaways')
          .update(repickPayload)
          .eq('id', giveawayId);

        if (upErr3) {
          throw upErr3;
        }

        await supabase
          .from('giveaway_audit')
          .insert({ giveaway_id: giveawayId, action: 'draft_winner', actor_id: null, target_id: ticket2.user_id, note: 'Fallback repick (no RPC)' });

        return NextResponse.json({ success: true, data: { winnerId: ticket2.user_id }, fallback: true });

      case 'cancel-giveaway':
        if (!giveawayId) {
          return NextResponse.json(
            { success: false, error: 'Giveaway ID is required' },
            { status: 400 }
          );
        }

        const cancelPayload: Partial<Database['public']['Tables']['giveaways']['Update']> = {
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        };
        const { error: cancelError } = await supabase
          .from<'giveaways'>('giveaways')
          .update(cancelPayload)
          .eq('id', giveawayId);

        if (cancelError) {
          throw cancelError;
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Giveaway cancelled successfully' 
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Admin giveaways POST API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process request' 
      },
      { status: 500 }
    );
  }
}

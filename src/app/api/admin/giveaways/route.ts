import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { supabase } = access;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'pending-review':
        // Prefer RPC; on failure, fall back to query by status or temp_winner
        let pendingGiveaways: any[] | null = null;
        const { data: rpcData, error: pendingError } = await (supabase as any)
          .rpc('get_giveaways_pending_review');

        if (!pendingError) {
          pendingGiveaways = Array.isArray(rpcData) ? rpcData : [];
        } else {
          // Fallback for environments without the RPC/migration
          const { data: fbData, error: fbErr } = await supabase
            .from('giveaways')
            .select(`
              id,
              title,
              description,
              prize_amount,
              tickets_count,
              temp_winner_id,
              created_at,
              ends_at,
              status
            `)
            .or('status.eq.review_pending,temp_winner_id.not.is.null')
            .order('created_at', { ascending: false });

          if (fbErr) {
            throw fbErr;
          }
          pendingGiveaways = fbData || [];
        }

        return NextResponse.json({ 
          success: true, 
          data: pendingGiveaways 
        });

      case 'all':
      default:
        // Get all giveaways for admin dashboard
        const { data: allGiveaways, error: allError } = await supabase
          .from('giveaways')
          .select(`
            id,
            title,
            description,
            prize_amount,
            tickets_count,
            status,
            escrow_status,
            winner_id,
            temp_winner_id,
            created_at,
            ends_at,
            creator_id
          `)
          .order('created_at', { ascending: false });

        if (allError) {
          throw allError;
        }

        return NextResponse.json({ 
          success: true, 
          data: allGiveaways 
        });
    }
  } catch (error: any) {
    console.error('Admin giveaways API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch giveaways' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { supabase } = access;
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

        const { error: upErr } = await supabase
          .from('giveaways')
          .update({ temp_winner_id: ticket.user_id, updated_at: new Date().toISOString() })
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

        const { error: upErr2 } = await supabase
          .from('giveaways')
          .update({ winner_id: g.temp_winner_id, status: 'completed', escrow_status: 'released', updated_at: new Date().toISOString() })
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
        await supabase
          .from('giveaways')
          .update({ temp_winner_id: null, updated_at: new Date().toISOString() })
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

        const { error: upErr3 } = await supabase
          .from('giveaways')
          .update({ temp_winner_id: ticket2.user_id, updated_at: new Date().toISOString() })
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

        const { error: cancelError } = await supabase
          .from('giveaways')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
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
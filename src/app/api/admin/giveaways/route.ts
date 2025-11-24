// Screenshot (for reference): /mnt/data/18ab430f-a8f6-482e-8ea9-120d5bbdf5ca.png

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRouteSupabase } from '@/lib/supabaseServer';
import type { Database } from '@/types/supabase';

/**
 * Temporary admin-check helper.
 * Replace with your actual auth + RBAC check.
 */
async function ensureAdminApiAccess() {
  // TODO: implement real admin check. For now, allow.
  return { isAdmin: true };
}

/**
 * GET handler
 * - GET /api/admin/giveaways           -> latest 50 giveaways
 * - GET /api/admin/giveaways?id=...   -> single giveaway by id
 */
export async function GET(req: Request) {
  try {
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
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveawayId)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unexpected error' }, { status: 500 });
  }
}

/**
 * POST handler - single endpoint for several administrative actions.
 *
 * Body shape (json):
 * {
 *   "action": "update-draft" | "pick-winner" | "set-temp" | "clear-temp",
 *   "giveawayId": string,
 *   // fields for update-draft:
 *   "title"?: string,
 *   "description"?: string,
 *   "prize_amount"?: number,
 *   "tickets_count"?: number,
 *   // for pick-winner: optionally nothing extra (will pick random)
 *   // for set-temp: supply "tempWinnerTicketId" (ticket id) OR "tempWinnerUserId"
 * }
 */
export async function POST(request: Request) {
  try {
    // Admin guard
    const access = await ensureAdminApiAccess();
    if (!access?.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const supabase = await createRouteSupabase();

    // parse body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    const { action, giveawayId } = body ?? {};
    if (!action || typeof action !== 'string' || !giveawayId || typeof giveawayId !== 'string') {
      return NextResponse.json({ ok: false, error: 'missing_action_or_giveawayId' }, { status: 400 });
    }

    const allowedActions = new Set(['update-draft', 'pick-winner', 'set-temp', 'clear-temp']);
    if (!allowedActions.has(action)) {
      return NextResponse.json({ ok: false, error: 'invalid_action' }, { status: 400 });
    }

    // Helper: load giveaway
    const { data: giveaway, error: gErr } = await supabase
      .from('giveaways')
      .select('*')
      .eq('id', giveawayId)
      .single();

    if (gErr || !giveaway) {
      return NextResponse.json({ ok: false, error: 'giveaway_not_found' }, { status: 404 });
    }

    // ===== action: update-draft =====
    if (action === 'update-draft') {
      const allowed = {
        title: typeof body.title === 'string' ? body.title : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        prize_amount: typeof body.prize_amount === 'number' ? body.prize_amount : undefined,
        tickets_count: typeof body.tickets_count === 'number' ? body.tickets_count : undefined,
      };

      // Build Partial update payload to avoid TS 'never' inference at compile time.
      const updatePayload: Partial<Database['public']['Tables']['giveaways']['Update']> = {
        ...allowed,
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

      return NextResponse.json({ ok: true, giveaway: data }, { status: 200 });
    }

    // ===== action: pick-winner =====
    if (action === 'pick-winner') {
      const { data: tickets, error: ticketsErr } = await supabase
        .from('tickets')
        .select('*')
        .eq('giveaway_id', giveawayId);

      if (ticketsErr) {
        return NextResponse.json({ ok: false, error: ticketsErr.message }, { status: 500 });
      }

      if (!tickets || tickets.length === 0) {
        return NextResponse.json({ ok: false, error: 'no_tickets' }, { status: 400 });
      }

      // choose random ticket
      const ticket = tickets[Math.floor(Math.random() * tickets.length)];

      // ensure ticket has user_id
      if (!ticket?.user_id) {
        return NextResponse.json({ ok: false, error: 'ticket_missing_user_id' }, { status: 500 });
      }

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

      return NextResponse.json({ ok: true, giveaway: data }, { status: 200 });
    }

    // ===== action: set-temp =====
    if (action === 'set-temp') {
      // accept either a direct user id or a ticket id to resolve user's id
      let userId: string | null = null;

      if (typeof body.tempWinnerUserId === 'string') {
        userId = body.tempWinnerUserId;
      } else if (typeof body.tempWinnerTicketId === 'string') {
        const { data: ticket, error: ticketErr } = await supabase
          .from('tickets')
          .select('user_id')
          .eq('id', body.tempWinnerTicketId)
          .single();

        if (ticketErr || !ticket) {
          return NextResponse.json({ ok: false, error: 'ticket_not_found' }, { status: 404 });
        }
        userId = ticket.user_id ?? null;
      } else {
        return NextResponse.json({ ok: false, error: 'missing_tempWinnerUserId_or_tempWinnerTicketId' }, { status: 400 });
      }

      const { data, error: upErr } = await supabase
        .from('giveaways')
        .update({
          temp_winner_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', giveawayId)
        .select('*')
        .single();

      if (upErr) {
        return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, giveaway: data }, { status: 200 });
    }

    // ===== action: clear-temp =====
    if (action === 'clear-temp') {
      const { data, error: upErr } = await supabase
        .from('giveaways')
        .update({
          temp_winner_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', giveawayId)
        .select('*')
        .single();

      if (upErr) {
        return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, giveaway: data }, { status: 200 });
    }

    // Should never reach here due to allowedActions guard
    return NextResponse.json({ ok: false, error: 'unhandled_action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || 'Unexpected error' }, { status: 500 });
  }
}

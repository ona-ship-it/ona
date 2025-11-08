import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const { supabase } = access;
    const BodySchema = z
      .object({
        giveawayId: z.string().uuid().optional(),
        id: z.string().uuid().optional(),
        action: z.enum(['publish', 'unpublish']).optional(),
        status: z.enum(['active', 'draft', 'paused']).optional(),
      })
      .refine((b) => !!(b.giveawayId || b.id), {
        message: 'Giveaway ID is required',
        path: ['giveawayId'],
      })
      .refine((b) => b.status !== undefined || b.action !== undefined, {
        message: 'Provide either status or action',
        path: ['status'],
      });

    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const body = parsed.data;
    const giveawayId: string = body.giveawayId || body.id!;
    let action: 'publish' | 'unpublish' | undefined = body.action;
    let status: 'active' | 'draft' | 'paused' | undefined = body.status;

    // Derive status from action if not explicitly provided
    if (!status && action) {
      if (action === 'publish') status = 'active';
      if (action === 'unpublish') status = 'draft';
    }

    // Validate status
    const allowed = new Set(['active', 'draft', 'paused']);
    if (!status || !allowed.has(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Use active, draft, or paused.' },
        { status: 400 }
      );
    }

    const { data: updated, error: upErr } = await supabase
      .from('giveaways')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', giveawayId)
      .select('id, status')
      .single();

    if (upErr) throw upErr;

    // Resolve actor for audit log
    const { data: { user } } = await supabase.auth.getUser();
    const actionName = action || (status === 'active' ? 'publish' : 'unpublish');

    // Best-effort audit insert (do not fail the whole request if audit fails)
    try {
      await supabase.from('giveaway_audit').insert({
        giveaway_id: giveawayId,
        action: actionName,
        actor_id: user?.id ?? null,
        note: `Status changed to ${status}`,
      });
    } catch (auditErr) {
      console.warn('Audit insert failed:', auditErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Admin publish/unpublish API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update giveaway status' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { supabase } = access;
    const { searchParams } = new URL(request.url);
    const giveawayId = searchParams.get('giveawayId');

    if (!giveawayId) {
      return NextResponse.json(
        { success: false, error: 'Giveaway ID is required' },
        { status: 400 }
      );
    }

    // Get audit trail for the giveaway
    const { data: auditTrail, error } = await supabase
      .from('giveaway_audit')
      .select(`
        id,
        action,
        created_at,
        actor_id
      `)
      .eq('giveaway_id', giveawayId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      data: auditTrail 
    });
  } catch (error: any) {
    console.error('Giveaway audit API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch audit trail' 
      },
      { status: 500 }
    );
  }
}
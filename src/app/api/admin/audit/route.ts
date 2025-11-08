import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    const { supabase, session } = access;

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'view';
    const page = body.page || request.headers.get('x-page') || 'unknown';
    const note = body.note || null;

    // Insert audit record (align columns with Admin Audit Viewer expectations)
    const { error } = await (supabase as any).from('admin_access_audit').insert({
      user_id: session?.user?.id ?? null,
      action,
      page,
      note,
    });

    if (error) {
      console.error('[admin-audit] insert error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[admin-audit] unexpected error:', err);
    return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}

export async function GET() {
  const access = await ensureAdminApiAccess();
  if (!access.isAdmin) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
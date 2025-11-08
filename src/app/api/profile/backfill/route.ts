import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';

// Admin-only: backfill avatar_url, username, and full_name in onagui_profiles
// using data from auth.users metadata. Requires SUPABASE_SERVICE_ROLE_KEY.
export async function POST(_req: NextRequest) {
  const access = await ensureAdminApiAccess();
  if (!access.isAdmin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const service = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let page = 1;
  const perPage = 200;
  let totalProcessed = 0;
  let totalUpdated = 0;

  while (true) {
    const { data: list, error: listError } = await service.auth.admin.listUsers({ page, perPage });
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }
    const users = list?.users || [];
    if (users.length === 0) break;

    for (const u of users) {
      totalProcessed++;
      const meta: Record<string, any> = (u.user_metadata || {}) as any;
      const email = u.email || '';
      const username = email ? email.split('@')[0] : (meta.username ?? null);
      const fullName = meta.full_name ?? meta.name ?? null;
      const avatarUrl = meta.picture ?? meta.avatar_url ?? meta.picture_url ?? null;

      const payload = {
        id: u.id,
        username: username ?? null,
        full_name: fullName,
        avatar_url: avatarUrl ?? null,
        onagui_type: 'signed_in' as any,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await service
        .from('onagui_profiles')
        .upsert(payload, { onConflict: 'id' });

      if (!upsertError) {
        totalUpdated++;
      }
    }

    page++;
  }

  return NextResponse.json({ ok: true, processed: totalProcessed, updated: totalUpdated });
}
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dev-only endpoint: seeds a mock user and profile for navbar testing
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Missing SUPABASE env vars' }, { status: 500 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = process.env.TEST_SIGNUP_EMAIL || 'mock+navbar@onagui.com';
  const password = process.env.TEST_SIGNUP_PASSWORD || 'P@ssw0rd123!';
  const username = 'mock_navbar';
  const avatarUrl = 'https://i.pravatar.cc/150?u=mock_navbar';

  try {
    // Try to find existing user
    const { data: users, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = users.users.find((u) => u.email === email);

    let userId = existing?.id;
    if (!userId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, avatar_url: avatarUrl },
      });
      if (createErr) throw createErr;
      userId = created.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Failed to resolve userId' }, { status: 500 });
    }

    // Upsert profile row for avatar and username
    const { error: upsertErr } = await admin
      .from('profiles')
      .upsert({ id: userId, email, username, avatar_url: avatarUrl }, { onConflict: 'id' });
    if (upsertErr) {
      // Some environments use onagui_profiles instead
      const { error: upsertErr2 } = await admin
        .from('onagui_profiles')
        .upsert({ id: userId, email, username, avatar_url: avatarUrl }, { onConflict: 'id' });
      if (upsertErr2) throw upsertErr2;
    }

    return NextResponse.json({ ok: true, email, userId, username, avatar_url: avatarUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}


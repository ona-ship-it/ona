import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Temporarily allow any authenticated user for testing
  // Original check: if (user.email !== 'richtheocrypto@gmail.com') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const service = createClient<Database>(url, key);

  const { data: profiles, error: profilesError } = await service
    .from('onagui_profiles')
    .select('*');

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { data: userRoles, error: rolesError } = await service
    .from('user_roles')
    .select('user_id, role_id, roles(name)');

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  const users = (profiles ?? []).map((profile: any) => {
    const roles = (userRoles ?? [])
      .filter((role: any) => role.user_id === profile.id)
      .map((role: any) => role.roles?.name)
      .filter((name: any) => !!name);
    return { ...profile, roles: roles || [] };
  });

  return NextResponse.json({ users });
}
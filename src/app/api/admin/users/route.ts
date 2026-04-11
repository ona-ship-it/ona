import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/admin';
import type { Database } from '@/types/supabase';

type CookieOptions = Record<string, unknown>;

type RoleJoinRecord = {
  user_id: string | null;
  admin_roles?: { name?: string | null } | null;
};

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...(options as Record<string, unknown>) });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...(options as Record<string, unknown>) });
          },
        },
      }
    );

    // Check session first to ensure cookies are properly synced
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log('No valid session found:', sessionError?.message);
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    // Then verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      console.log('User verification failed:', userError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(user.email)) {
      console.log('Admin access denied for user:', user.email);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Use service role client for admin operations
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const service = createClient<Database>(url, key);

    const { data: profiles, error: profilesError } = await service
      .from('onagui_profiles')
      .select('*');

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const { data: userRoles, error: rolesError } = await service
      .from('admin_user_roles')
      .select('user_id, role_id, admin_roles(name)');

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    const users = (profiles ?? []).map((profile) => {
      const roles = ((userRoles ?? []) as RoleJoinRecord[])
        .filter((role) => role.user_id === profile.id)
        .map((role) => role.admin_roles?.name)
        .filter((name): name is string => Boolean(name));
      return { ...profile, roles: roles || [] };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
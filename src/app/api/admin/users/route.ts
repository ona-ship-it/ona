import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase';
import { ensureAdminApiAccess } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const access = await ensureAdminApiAccess();
    if (!access.isAdmin) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
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

    // Get all auth users to include email information
    const { data: authUsers, error: authError } = await service.auth.admin.listUsers();
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const users = (profiles ?? []).map((profile: any) => {
      const roles = (userRoles ?? [])
        .filter((role: any) => role.user_id === profile.id)
        .map((role: any) => role.admin_roles?.name)
        .filter((name: any) => !!name);
      
      // Find corresponding auth user to get email
      const authUser = authUsers.users.find((user: any) => user.id === profile.id);
      
      return { 
        ...profile, 
        email: authUser?.email || 'No email found',
        roles: roles || [] 
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
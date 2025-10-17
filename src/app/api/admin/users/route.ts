import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Check if the current user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the current user is an admin
    const { data: adminCheck, error: adminError } = await supabase
      .rpc('is_admin_user');

    if (adminError || !adminCheck) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Fetch all users from auth.users with their app_users data and roles
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select(`
        id,
        email,
        username,
        current_rank,
        reputation_points,
        created_at,
        updated_at
      `);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // For each user, fetch their roles from onagui.user_roles
    const usersWithRoles = await Promise.all(
      (users || []).map(async (user) => {
        const { data: userRoles, error: rolesError } = await supabase
          .from('onagui.user_roles')
          .select(`
            roles!inner(name)
          `)
          .eq('user_id', user.id);

        let roles: string[] = [];
        if (!rolesError && userRoles) {
          roles = userRoles.map((ur: any) => ur.roles.name);
        }

        // Add the current_rank as a role if it's not already included
        if (user.current_rank && !roles.includes(user.current_rank)) {
          roles.push(user.current_rank);
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          onagui_type: 'signed_in', // Default type for app users
          current_rank: user.current_rank,
          reputation_points: user.reputation_points,
          roles: roles,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
      })
    );

    return NextResponse.json({ 
      users: usersWithRoles,
      total: usersWithRoles.length 
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
'use server'

import { createAdminSupabaseClient } from '@/utils/supabase/server-admin'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function checkAdminStatus() {
  try {
    // Get the current user from the session
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Not authenticated' }
    }

    // Use admin client to check user admin status in app_users table
    const adminSupabase = await createAdminSupabaseClient()
    
    // Check if user has admin rank in app_users table
    const { data: appUser, error: appUserError } = await adminSupabase
      .from('app_users')
      .select('current_rank')
      .eq('id', user.id)
      .single()

    if (appUserError) {
      console.error('Error checking user admin status:', appUserError)
      return { isAdmin: false, error: 'Failed to check admin status' }
    }

    // Check if user has admin rank
    const isAdmin = appUser?.current_rank === 'admin'

    return { 
      isAdmin, 
      user: {
        id: user.id,
        email: user.email
      }
    }
  } catch (error) {
    console.error('Admin status check failed:', error)
    return { isAdmin: false, error: 'Admin status check failed' }
  }
}

// Define the type for the consolidated user data
export type AppUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  current_rank: string | null;
  [key: string]: any; // Allow for additional fields
};



export async function getAdminDashboardData() {
  try {
    const adminSupabase = await createAdminSupabaseClient()
    
    // Get total users count
    const { count: totalUsers } = await adminSupabase
      .from('auth.users')
      .select('*', { count: 'exact', head: true })

    // Get total giveaways count
    const { count: totalGiveaways } = await adminSupabase
      .from('public.giveaways')
      .select('*', { count: 'exact', head: true })

    // Get active giveaways count
    const { count: activeGiveaways } = await adminSupabase
      .from('public.giveaways')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Get recent giveaways
    const { data: recentGiveaways } = await adminSupabase
      .from('public.giveaways')
      .select(`
        id,
        title,
        status,
        created_at,
        creator_id,
        auth_users:auth.users!creator_id(email)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      stats: {
        totalUsers: totalUsers || 0,
        totalGiveaways: totalGiveaways || 0,
        activeGiveaways: activeGiveaways || 0
      },
      recentGiveaways: recentGiveaways || []
    }
  } catch (error) {
    console.error('Failed to fetch admin dashboard data:', error)
    return {
      stats: {
        totalUsers: 0,
        totalGiveaways: 0,
        activeGiveaways: 0
      },
      recentGiveaways: []
    }
  }
}

// Define the type for the consolidated user data
export type AppUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  current_rank: string | null;
  [key: string]: any; // Allow for additional fields
};

export type AdminUserWithRole = AppUser & {
  role_name: string | null;
};

/**
 * Fetches ALL users and their roles using the Service Role client to bypass RLS.
 * This runs ONLY on the server, making it secure.
 */
export async function fetchAdminUsers(): Promise<{ data: AdminUserWithRole[] | null; error: string | null }> {
  try {
    const supabase = await createAdminSupabaseClient();

    // Use the RPC function to get users with roles
    const { data: usersData, error: usersError } = await supabase
      .rpc('get_admin_users');

    if (usersError) {
      console.error('Error fetching admin users:', usersError);
      throw new Error(`Supabase Error fetching admin users: ${usersError.message}`);
    }

    return { data: usersData, error: null };

  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { data: null, error: error.message || 'Failed to fetch admin data securely.' };
  }
}
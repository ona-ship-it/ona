'use server'

import { createAdminSupabaseClient } from '@/utils/supabase/server-admin'
import { createClient } from '@/utils/supabase/server'

export async function checkAdminStatus() {
  try {
    // Get the current user from the session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { isAdmin: false, error: 'Not authenticated' }
    }

    // Use admin client to get full user details including metadata
    const adminSupabase = await createAdminSupabaseClient()
    
    // Get user details with metadata to check admin status
    const { data: fullUser, error: userError } = await adminSupabase.auth.admin.getUserById(user.id)

    if (userError || !fullUser.user) {
      console.error('Error getting user details:', userError)
      return { isAdmin: false, error: 'Failed to get user details' }
    }

    // Check if user has admin status in metadata
    const isAdmin = fullUser.user.user_metadata?.is_admin === true

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

// AppUser type is defined below



export async function getAdminDashboardData() {
  try {
    const adminSupabase = await createAdminSupabaseClient()
    
    // Get total users count
    const { count: totalUsers } = await adminSupabase
      .from('onagui_profiles')
      .select('*', { count: 'exact', head: true })

    // Get total giveaways count
    const { count: totalGiveaways } = await adminSupabase
      .from('giveaways')
      .select('*', { count: 'exact', head: true })

    // Get active giveaways count
    const { data: activeGiveawaysData } = await (adminSupabase as any)
      .from('giveaways')
      .select('id')
      .eq('is_active', true)
    const activeGiveaways = activeGiveawaysData?.length || 0

    // Get recent giveaways
    const { data: recentGiveaways } = await (adminSupabase as any)
       .from('giveaways')
       .select(`
         id,
         title,
         created_at,
         status,
         creator_id
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

    // Transform the data to match our AdminUserWithRole type
    const transformedData: AdminUserWithRole[] | null = usersData ? (usersData as any[]).map((user: any) => ({
      id: user.user_id,
      email: user.email,
      full_name: null, // Not provided by the RPC function
      avatar_url: null, // Not provided by the RPC function
      created_at: user.assigned_at,
      updated_at: user.assigned_at,
      current_rank: null, // Not provided by the RPC function
      role_name: user.role_name
    })) : null;

    return { data: transformedData, error: null };

  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { data: null, error: error.message || 'Failed to fetch admin data securely.' };
  }
}
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/supabase';

/**
 * Creates a server-side Supabase client for admin operations
 * This function handles authentication and authorization at the route level
 */
export async function createServerSupabase() {
  return await createClient();
}

/**
 * Verifies admin access and returns user session
 * Redirects to appropriate pages if not authenticated or not admin
 */
export async function requireAdminAccess() {
  const supabase = await createServerSupabase();
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    redirect('/signin');
  }

  // Check if user has admin privileges using the is_admin_user RPC function
  const { data: isAdmin, error: adminCheckError } = await supabase
    .rpc('is_admin_user', { user_uuid: session.user.id });

  if (adminCheckError || !isAdmin) {
    redirect('/');
  }

  return {
    session,
    supabase
  };
}

/**
 * Get admin dashboard data
 */
export async function getAdminDashboardData() {
  const { supabase } = await requireAdminAccess();

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('onagui_profiles')
      .select('*', { count: 'exact', head: true });

    // Get total giveaways
    const { count: totalGiveaways } = await supabase
      .from('giveaways')
      .select('*', { count: 'exact', head: true });

    // Get active giveaways
    const { count: activeGiveaways } = await supabase
      .from('giveaways')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get recent giveaways
    const { data: recentGiveaways } = await supabase
      .from('giveaways')
      .select('id, title, status, created_at, creator_id')
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      stats: {
        totalUsers: totalUsers || 0,
        totalGiveaways: totalGiveaways || 0,
        activeGiveaways: activeGiveaways || 0,
      },
      recentGiveaways: recentGiveaways || [],
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return {
      stats: {
        totalUsers: 0,
        totalGiveaways: 0,
        activeGiveaways: 0,
      },
      recentGiveaways: [],
    };
  }
}
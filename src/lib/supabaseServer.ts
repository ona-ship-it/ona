import { createClient } from '@/utils/supabase/server';
import { EMERGENCY_ADMIN_EMAILS } from '@/lib/admin-utils';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Creates a server-side Supabase client for admin operations
 * This function handles authentication and authorization at the route level
 */
export async function createServerSupabase() {
  return await createClient();
}

/**
 * Create a Supabase server client inside Route Handlers using Next.js cookies adapter.
 * Ensures consistent cookie get/set/remove behavior across API endpoints.
 */
export async function createRouteSupabase() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          (cookieStore as any).set(name, value, options);
        },
        remove(name: string, options: any) {
          (cookieStore as any).delete(name, options);
        },
      },
    }
  );
  return supabase;
}

/**
 * Create a Supabase server client for middleware with explicit request/response cookie adapters.
 * Use this to keep middleware cookie handling consistent with route handlers.
 */
export function createMiddlewareSupabase(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  return supabase;
}

/**
 * Verifies admin access and returns user session
 * Redirects to appropriate pages if not authenticated or not admin
 */
export async function requireAdminAccess() {
  const supabase = await createServerSupabase();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    redirect('/signin?redirectTo=%2Fadmin');
  }

  // Fetch user to check emergency whitelist
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('onagui_profiles')
    .select('onagui_type, is_admin')
    .eq('id', session.user.id)
    .single();

  const { data: isAdmin } = await supabase
    .rpc('is_admin_user', { user_uuid: session.user.id });

  // Include emergency whitelist email check
  const hasEmergencyAdmin = !!user?.email && EMERGENCY_ADMIN_EMAILS.includes(user.email);
  const hasAdminAccess = hasEmergencyAdmin || profile?.is_admin === true || isAdmin === true;
  if (!hasAdminAccess) {
    redirect('/');
  }

  return { session, profile, supabase };
}

/**
 * Checks admin access and returns a structured result without redirecting.
 * Use this in API routes to standardize JSON 401 responses.
 */
export async function checkAdminAccess() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { supabase, session: null, profile: null, isAdmin: false };
  }

  // Fetch user to check emergency whitelist
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('onagui_profiles')
    .select('onagui_type, is_admin')
    .eq('id', session.user.id)
    .single();

  const { data: isAdmin } = await supabase
    .rpc('is_admin_user', { user_uuid: session.user.id });

  // Include emergency whitelist email check
  const hasEmergencyAdmin = !!user?.email && EMERGENCY_ADMIN_EMAILS.includes(user.email);
  const hasAdminAccess = hasEmergencyAdmin || profile?.is_admin === true || isAdmin === true;
  return { supabase, session, profile, isAdmin: !!hasAdminAccess };
}

/**
 * Ensures admin access for API handlers. Returns the check result.
 * Caller should return 401 JSON when result.isAdmin is false.
 */
export async function ensureAdminApiAccess() {
  return checkAdminAccess();
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
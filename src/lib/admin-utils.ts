/**
 * CONSOLIDATED ADMIN UTILITIES
 * 
 * Single source of truth for all admin checks across the application.
 * This replaces scattered admin verification logic with a consistent,
 * reliable, and well-tested approach.
 * 
 * Priority order for admin verification:
 * 1. Emergency whitelist (NEXT_PUBLIC_ADMIN_EMAIL + hardcoded fallback)
 * 2. Canonical RPC function (is_admin_user)
 * 3. Profile-based fallback (onagui_profiles.is_admin)
 * 4. Role-based fallback (onagui.user_roles)
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Database } from '@/types/supabase';

// Emergency admin emails (for hotfix compatibility)
const EMERGENCY_ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'richtheocrypto@gmail.com', // Hardcoded fallback
  'samiraeddaoudi88@gmail.com', // Second admin user
].filter(Boolean) as string[];

/**
 * Admin check result interface
 */
export interface AdminCheckResult {
  isAdmin: boolean;
  userId?: string;
  email?: string;
  source: 'emergency_whitelist' | 'rpc_function' | 'profile_check' | 'role_check' | 'none';
  error?: string;
}

/**
 * Creates a server-side Supabase client for admin operations
 */
async function createAdminSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

/**
 * CORE FUNCTION: Verify if a user is an admin
 * 
 * This is the canonical admin check function used throughout the app.
 * It implements the priority order and provides detailed logging.
 */
export async function verifyAdminAccess(userId?: string): Promise<AdminCheckResult> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    // Get current session if no userId provided
    if (!userId) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return {
          isAdmin: false,
          source: 'none',
          error: 'No authenticated session'
        };
      }
      userId = session.user.id;
    }

    // Get user email for emergency whitelist check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const userEmail = user?.email;

    console.log(`🔍 [AdminUtils] Checking admin access for user: ${userId} (${userEmail})`);

    // 🚨 PRIORITY 1: Emergency whitelist check
    if (userEmail && EMERGENCY_ADMIN_EMAILS.includes(userEmail)) {
      console.log(`✅ [AdminUtils] Admin access granted via emergency whitelist: ${userEmail}`);
      return {
        isAdmin: true,
        userId,
        email: userEmail,
        source: 'emergency_whitelist'
      };
    }

    // 🎯 PRIORITY 2: Canonical RPC function check
    try {
      const { data: isAdminRPC, error: rpcError } = await supabase
        .rpc('is_admin_user', { user_uuid: userId });

      if (!rpcError && isAdminRPC === true) {
        console.log(`✅ [AdminUtils] Admin access granted via RPC function: ${userId}`);
        return {
          isAdmin: true,
          userId,
          email: userEmail,
          source: 'rpc_function'
        };
      }

      if (rpcError) {
        console.warn(`⚠️ [AdminUtils] RPC function error:`, rpcError);
      }
    } catch (rpcException) {
      console.warn(`⚠️ [AdminUtils] RPC function exception:`, rpcException);
    }

    // 🔄 PRIORITY 3: Profile-based check (is_admin column first, then onagui_type)
    try {
      const { data: profile, error: profileError } = await supabase
        .from('onagui_profiles')
        .select('is_admin, onagui_type')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        // Primary check: is_admin column
        const isAdminByFlag = profile.is_admin === true;
        
        if (isAdminByFlag) {
          console.log(`✅ [AdminUtils] Admin access granted via is_admin flag: ${userId}`);
          return {
            isAdmin: true,
            userId,
            email: userEmail,
            source: 'profile_check'
          };
        }
        
        // Note: onagui_type enum doesn't include 'admin' as a valid value
        // Admin status is determined by the is_admin flag only
      }

      if (profileError) {
        console.warn(`⚠️ [AdminUtils] Profile check error:`, profileError);
      }
    } catch (profileException) {
      console.warn(`⚠️ [AdminUtils] Profile check exception:`, profileException);
    }

    // 🎭 PRIORITY 4: Role-based fallback check
    try {
      const { data: userRoles, error: roleError } = await supabase
        .from('admin_user_roles')
        .select('role_name')
        .eq('user_id', userId);

      if (!roleError && userRoles) {
        const hasAdminRole = userRoles.some(ur => 
          ur.role_name === 'admin'
        );

        if (hasAdminRole) {
          console.log(`✅ [AdminUtils] Admin access granted via role check: ${userId}`);
          return {
            isAdmin: true,
            userId,
            email: userEmail,
            source: 'role_check'
          };
        }
      }

      if (roleError) {
        console.warn(`⚠️ [AdminUtils] Role check error:`, roleError);
      }
    } catch (roleException) {
      console.warn(`⚠️ [AdminUtils] Role check exception:`, roleException);
    }

    // ❌ No admin access found
    console.log(`❌ [AdminUtils] Admin access denied for user: ${userId} (${userEmail})`);
    return {
      isAdmin: false,
      userId,
      email: userEmail,
      source: 'none'
    };

  } catch (error) {
    console.error(`💥 [AdminUtils] Critical error in verifyAdminAccess:`, error);
    return {
      isAdmin: false,
      source: 'none',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * MIDDLEWARE HELPER: Quick admin check for middleware
 * 
 * Optimized for middleware usage with minimal database calls.
 * Falls back to emergency whitelist if database is unavailable.
 */
export async function isAdminForMiddleware(userId: string, userEmail?: string): Promise<boolean> {
  try {
    // Emergency whitelist check (always works)
    if (userEmail && EMERGENCY_ADMIN_EMAILS.includes(userEmail)) {
      console.log(`🚨 [AdminUtils] Middleware admin access via emergency whitelist: ${userEmail}`);
      return true;
    }

    const supabase = await createAdminSupabaseClient();
    
    // Primary check: is_admin column
    try {
      const { data: profile, error: profileError } = await supabase
        .from('onagui_profiles')
        .select('is_admin, onagui_type')
        .eq('id', userId)
        .single();

      if (!profileError && profile) {
        if (profile.is_admin === true) {
          console.log(`✅ [AdminUtils] Middleware admin access via is_admin flag: ${userId}`);
          return true;
        }
        
        // Note: onagui_type enum doesn't include 'admin' as a valid value
        // Admin status is determined by the is_admin flag only
      }
    } catch (profileError) {
      console.warn(`⚠️ [AdminUtils] Middleware profile check error:`, profileError);
    }

    // Fallback: RPC check
    try {
      const { data: isAdmin, error } = await supabase
        .rpc('is_admin_user', { user_uuid: userId });

      if (!error && isAdmin === true) {
        console.log(`✅ [AdminUtils] Middleware admin access via RPC: ${userId}`);
        return true;
      }
    } catch (rpcError) {
      console.warn(`⚠️ [AdminUtils] Middleware RPC error:`, rpcError);
    }

    return false;
  } catch (error) {
    console.error(`💥 [AdminUtils] Middleware admin check error:`, error);
    // In case of error, only allow emergency whitelist
    return userEmail ? EMERGENCY_ADMIN_EMAILS.includes(userEmail) : false;
  }
}

/**
 * SERVER ACTION HELPER: Require admin access with redirect
 * 
 * Use this in server actions and route handlers that require admin access.
 * Automatically redirects non-admin users to appropriate pages.
 */
export async function requireAdminAccess(redirectTo?: string) {
  const adminCheck = await verifyAdminAccess();
  
  if (!adminCheck.isAdmin) {
    console.log(`🚫 [AdminUtils] Admin access required, redirecting user: ${adminCheck.userId}`);
    
    if (!adminCheck.userId) {
      // Not authenticated - redirect to signin with return URL
      const returnUrl = redirectTo || '/admin';
      redirect(`/signin?redirectTo=${encodeURIComponent(returnUrl)}`);
    } else {
      // Authenticated but not admin - redirect to unauthorized
      redirect('/unauthorized');
    }
  }

  console.log(`✅ [AdminUtils] Admin access granted for protected resource: ${adminCheck.userId} (${adminCheck.source})`);
  return adminCheck;
}

/**
 * CLIENT HELPER: Check if current user is admin (for client components)
 * 
 * This should be used sparingly and only for UI display logic.
 * Server-side checks should always be the authoritative source.
 */
export async function getCurrentUserAdminStatus(): Promise<AdminCheckResult> {
  return verifyAdminAccess();
}

/**
 * UTILITY: Get detailed admin status for debugging
 * 
 * Returns comprehensive information about admin status for troubleshooting.
 */
export async function getAdminStatusDebug(userId?: string): Promise<{
  adminCheck: AdminCheckResult;
  emergencyEmails: string[];
  checks: {
    emergency: boolean;
    rpc: { success: boolean; result?: boolean | null; error?: any };
    profile: { success: boolean; result?: any; error?: any };
    roles: { success: boolean; result?: any; error?: any };
  };
}> {
  const supabase = await createAdminSupabaseClient();
  
  // Get user info
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const userEmail = user?.email;

  // Run all checks individually for debugging
  const checks = {
    emergency: userEmail ? EMERGENCY_ADMIN_EMAILS.includes(userEmail) : false,
    rpc: { success: false, result: undefined as boolean | null | undefined, error: undefined as any },
    profile: { success: false, result: undefined as any, error: undefined as any },
    roles: { success: false, result: undefined as any, error: undefined as any }
  };

  // RPC check
  try {
    if (userId) {
      const { data, error } = await supabase.rpc('is_admin_user', { user_uuid: userId });
      checks.rpc = { success: !error, result: data, error };
    } else {
      checks.rpc = { success: false, result: false, error: 'No user ID available' };
    }
  } catch (err) {
    checks.rpc = { success: false, result: undefined, error: err };
  }

  // Profile check
  try {
    if (userId) {
      const { data, error } = await supabase
        .from('onagui_profiles')
        .select('onagui_type')
        .eq('id', userId)
        .single();
      checks.profile = { success: !error, result: data, error };
    } else {
      checks.profile = { success: false, result: undefined, error: 'No user ID available' };
    }
  } catch (err) {
    checks.profile = { success: false, result: undefined, error: err };
  }

  // Role check
  try {
    if (userId) {
      const { data, error } = await supabase
        .from('user_roles')
        .select('roles(name)')
        .eq('user_id', userId);
      checks.roles = { success: !error, result: data, error };
    } else {
      checks.roles = { success: false, result: undefined, error: 'No user ID available' };
    }
  } catch (err) {
    checks.roles = { success: false, result: undefined, error: err };
  }

  const adminCheck = await verifyAdminAccess(userId);

  return {
    adminCheck,
    emergencyEmails: EMERGENCY_ADMIN_EMAILS,
    checks
  };
}

/**
 * LEGACY COMPATIBILITY: Wrapper functions for existing code
 * 
 * Maintains compatibility with existing code while using the new system.
 */
export async function getAdminStatus(userId: string) {
  try {
    const adminCheck = await verifyAdminAccess(userId);
    return {
      isAdmin: adminCheck.isAdmin,
      error: adminCheck.error || null
    };
  } catch (error) {
    return {
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export emergency emails for other modules that might need them
export { EMERGENCY_ADMIN_EMAILS };
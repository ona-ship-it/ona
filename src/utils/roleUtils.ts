import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

/**
 * App-level role types for business logic
 * These are separate from database-level roles used for schema management
 */
export type AppRole = 'user' | 'subscriber' | 'influencer' | 'admin';

/**
 * Lookup a user's role from the app_users table
 * @param userId The user ID to lookup
 * @returns Promise<AppRole | null> The user's role or null if not found
 */
export async function lookupUserRole(userId: string): Promise<AppRole | null> {
  const supabase = createClientComponentClient<Database>();
  
  // Get the user from app_users table
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error looking up user role:', error);
    return null;
  }
  
  // Map the user's rank to an app role
  // This assumes that the current_rank field in app_users corresponds to role names
  // You may need to adjust this mapping based on your data model
  const rank = data.current_rank;
  
  if (rank === 'admin') return 'admin';
  if (rank === 'influencer') return 'influencer';
  if (rank === 'subscriber') return 'subscriber';
  return 'user'; // Default role
}

/**
 * Check if the current user has a specific app role
 * @param roleName The name of the app role to check
 * @returns Promise<boolean> True if the user has the role, false otherwise
 */
export async function hasRole(roleName: AppRole): Promise<boolean> {
  const supabase = createClientComponentClient<Database>();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return false;
  }
  
  // First try to lookup the role from app_users
  const appUserRole = await lookupUserRole(session.user.id);
  if (appUserRole) {
    // For admin role, exact match is required
    if (roleName === 'admin') {
      return appUserRole === 'admin';
    }
    
    // For other roles, higher roles include lower privileges
    // admin > influencer > subscriber > user
    if (roleName === 'influencer') {
      return appUserRole === 'admin' || appUserRole === 'influencer';
    }
    
    if (roleName === 'subscriber') {
      return appUserRole === 'admin' || appUserRole === 'influencer' || appUserRole === 'subscriber';
    }
    
    // Everyone has 'user' role
    return true;
  }
  
  // Fallback to the new relation syntax if app_users lookup fails
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      roles!inner(name)
    `)
    .eq('user_id', session.user.id)
    .eq('roles.name', roleName)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
}

/**
 * Check if the current user is an admin
 * @returns Promise<boolean> True if the user is an admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

/**
 * Check if the current user is a subscriber
 * @returns Promise<boolean> True if the user is a subscriber, false otherwise
 */
export async function isSubscriber(): Promise<boolean> {
  return hasRole('subscriber');
}

/**
 * Check if the current user is an influencer
 * @returns Promise<boolean> True if the user is an influencer, false otherwise
 */
export async function isInfluencer(): Promise<boolean> {
  return hasRole('influencer');
}

/**
 * Get all app roles for the current user
 * @returns Promise<AppRole[]> Array of app role names
 */
export async function getUserRoles(): Promise<AppRole[]> {
  const supabase = createClientComponentClient<Database>();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return [];
  }
  
  // First try to lookup the role from app_users
  const appUserRole = await lookupUserRole(session.user.id);
  if (appUserRole) {
    // Return appropriate roles based on hierarchy
    // admin > influencer > subscriber > user
    if (appUserRole === 'admin') {
      return ['user', 'subscriber', 'influencer', 'admin'];
    }
    if (appUserRole === 'influencer') {
      return ['user', 'subscriber', 'influencer'];
    }
    if (appUserRole === 'subscriber') {
      return ['user', 'subscriber'];
    }
    return ['user'];
  }
  
  // Fallback to the original role lookup if app_users lookup fails
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', session.user.id);
  
  if (error || !data) {
    return [];
  }
  
  // Extract role names from the result and filter to only include valid app roles
  const roles = data.map(item => (item.roles as any).name);
  return roles.filter(role => 
    role === 'user' || 
    role === 'subscriber' || 
    role === 'influencer' || 
    role === 'admin'
  ) as AppRole[];
}
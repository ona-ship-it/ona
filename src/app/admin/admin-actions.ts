'use server';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a Supabase client with service role key for admin operations
// This bypasses RLS and should only be used in secure server-side contexts
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface OnaguiProfile {
  id: string;
  email: string;
  onagui_type: string | null;
  created_at: string;
}

interface UserRoleRecord {
  user_id: string;
  role_id: string;
  roles?: { name?: string } | null;
}

interface AdminUser extends OnaguiProfile {
  roles: string[];
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    // Use the new public function to get users with roles
    const { data: usersData, error: usersError } = await supabaseAdmin
      .rpc('get_admin_users');
    
    if (usersError) {
      console.error('Error fetching admin users:', usersError);
      throw new Error(`Failed to fetch admin users: ${usersError.message}`);
    }

    // Get all profiles to merge with user data
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('onagui_profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
    }

    // Map the data to AdminUser format
    const usersWithRoles: AdminUser[] = (usersData ?? []).map((userData: any) => {
      // Find the corresponding profile
      const profile = (profiles ?? []).find((p: OnaguiProfile) => p.id === userData.user_id);
      
      return {
        id: userData.user_id,
        email: userData.email,
        username: profile?.username || '',
        display_name: profile?.display_name || '',
        avatar_url: profile?.avatar_url || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
        location: profile?.location || '',
        created_at: profile?.created_at || '',
        updated_at: profile?.updated_at || '',
        roles: userData.role_name ? [userData.role_name] : []
      };
    });

    return usersWithRoles;
  } catch (error) {
    console.error('Error in fetchAdminUsers:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred while fetching admin users');
  }
}
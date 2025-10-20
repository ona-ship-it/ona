import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function checkUserAuth() {
  try {
    console.log('Checking user authentication for richtheocrypto@gmail.com...');
    
    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    const targetUser = authUsers.users.find(user => user.email === 'richtheocrypto@gmail.com');
    
    if (!targetUser) {
      console.log('❌ User not found in auth.users');
      return;
    }
    
    console.log('✅ User found in auth.users:');
    console.log('- ID:', targetUser.id);
    console.log('- Email:', targetUser.email);
    console.log('- Email confirmed:', targetUser.email_confirmed_at ? 'Yes' : 'No');
    console.log('- Created at:', targetUser.created_at);
    console.log('- Last sign in:', targetUser.last_sign_in_at || 'Never');
    
    // Check if user has profile in onagui_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', targetUser.id);
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    } else {
      console.log('Profile in onagui_profiles:', profiles.length > 0 ? 'Yes' : 'No');
      if (profiles.length > 0) {
        console.log('Profile data:', profiles[0]);
      }
    }
    
    // Check user roles in onagui schema
    const { data: userRoles, error: rolesError } = await supabase
      .from('onagui.user_roles')
      .select(`
        *,
        role:roles (
          name,
          description
        )
      `)
      .eq('user_id', targetUser.id);
    
    if (rolesError) {
      console.error('Error fetching user roles from onagui.user_roles:', rolesError);
      
      // Try public.app_users instead
      const { data: appUsers, error: appUsersError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', targetUser.id);
      
      if (appUsersError) {
        console.error('Error fetching from app_users:', appUsersError);
      } else {
        console.log('User in app_users:', appUsers.length > 0 ? appUsers : 'No record found');
      }
    } else {
      console.log('User roles from onagui.user_roles:', userRoles.length > 0 ? userRoles : 'No roles assigned');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkUserAuth();
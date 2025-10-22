import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAdminSystem() {
  try {
    console.log('🔧 Setting up admin system...');
    
    // Since we can't add columns directly, let's work with what we have
    // and create a separate admin_users table
    
    console.log('Creating admin_users table...');
    const { error: createTableError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
    
    if (createTableError && createTableError.message.includes('does not exist')) {
      console.log('admin_users table does not exist, we need to create it manually');
      console.log('For now, let\'s work with the existing system...');
    }
    
    // Get auth users
    console.log('Getting auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('❌ Error getting auth users:', authError.message);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} auth users:`);
    authUsers.users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.id})`);
    });
    
    // Get current profiles
    console.log('\nGetting current profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('*');
      
    if (profilesError) {
      console.log('❌ Error getting profiles:', profilesError.message);
      return;
    }
    
    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach(profile => {
      const authUser = authUsers.users.find(u => u.id === profile.id);
      console.log(`- ${authUser?.email || 'Unknown email'} (${profile.username})`);
    });
    
    // Create missing profiles for auth users
    console.log('\nCreating missing profiles...');
    for (const authUser of authUsers.users) {
      const existingProfile = profiles.find(p => p.id === authUser.id);
      
      if (!existingProfile && authUser.email) {
        console.log(`Creating profile for ${authUser.email}...`);
        const { error: insertError } = await supabase
          .from('onagui_profiles')
          .insert({
            id: authUser.id,
            username: authUser.email.split('@')[0],
            full_name: authUser.user_metadata?.full_name || authUser.email,
            onagui_type: 'signed_in'
          });
          
        if (insertError) {
          console.log(`❌ Error creating profile for ${authUser.email}:`, insertError.message);
        } else {
          console.log(`✅ Created profile for ${authUser.email}`);
        }
      }
    }
    
    // Since we can't add columns to the existing table, let's create a simple admin check
    // by using user metadata or a separate approach
    console.log('\n🔧 Setting up admin metadata...');
    
    const adminEmails = ['samiraeddaoudi88@gmail.com', 'richtheocrypto@gmail.com'];
    
    for (const email of adminEmails) {
      const user = authUsers.users.find(u => u.email === email);
      if (user) {
        console.log(`Setting admin metadata for ${email}...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          {
            user_metadata: {
              ...user.user_metadata,
              is_admin: true,
              admin_role: 'admin'
            }
          }
        );
        
        if (updateError) {
          console.log(`❌ Error setting admin for ${email}:`, updateError.message);
        } else {
          console.log(`✅ Set admin metadata for ${email}`);
        }
      } else {
        console.log(`⚠️ User ${email} not found in auth users`);
      }
    }
    
    // Verify final state
    console.log('\n🔍 Final verification...');
    const { data: finalAuthUsers, error: finalAuthError } = await supabase.auth.admin.listUsers();
    if (finalAuthError) {
      console.log('❌ Error in final auth check:', finalAuthError.message);
    } else {
      console.log('Auth users with admin status:');
      finalAuthUsers.users.forEach(user => {
        const isAdmin = user.user_metadata?.is_admin || false;
        console.log(`- ${user.email}: Admin=${isAdmin}`);
      });
    }
    
    const { data: finalProfiles, error: finalProfilesError } = await supabase
      .from('onagui_profiles')
      .select('*');
      
    if (finalProfilesError) {
      console.log('❌ Error in final profiles check:', finalProfilesError.message);
    } else {
      console.log(`\n✅ Total profiles: ${finalProfiles.length}`);
      finalProfiles.forEach(profile => {
        const authUser = finalAuthUsers.users.find(u => u.id === profile.id);
        const isAdmin = authUser?.user_metadata?.is_admin || false;
        console.log(`- ${authUser?.email || 'Unknown'} (${profile.username}): Admin=${isAdmin}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error setting up admin system:', error);
  }
}

setupAdminSystem();
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdminSystem() {
  try {
    console.log('🔧 Fixing admin system...');
    
    // First, let's check current table structure
    const { data: currentProfiles, error: currentError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .limit(1);
      
    if (currentError) {
      console.log('❌ Error checking current profiles:', currentError.message);
      return;
    }
    
    console.log('Current table columns:', Object.keys(currentProfiles[0] || {}));
    
    // Get all auth users to sync emails
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error getting auth users:', authError.message);
      return;
    }
    
    console.log(`Found ${authUsers.users.length} auth users`);
    
    // Get all profiles
    const { data: allProfiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('*');
      
    if (profilesError) {
      console.log('❌ Error getting profiles:', profilesError.message);
      return;
    }
    
    console.log(`Found ${allProfiles.length} profiles`);
    
    // Create missing profiles and update existing ones
    for (const authUser of authUsers.users) {
      const existingProfile = allProfiles.find(p => p.id === authUser.id);
      
      if (!existingProfile) {
        // Create new profile
        console.log(`Creating profile for ${authUser.email}`);
        const { error: insertError } = await supabase
          .from('onagui_profiles')
          .insert({
            id: authUser.id,
            username: authUser.email?.split('@')[0] || 'user',
            full_name: authUser.user_metadata?.full_name || authUser.email,
            onagui_type: 'user'
          });
          
        if (insertError) {
          console.log(`❌ Error creating profile for ${authUser.email}:`, insertError.message);
        } else {
          console.log(`✅ Created profile for ${authUser.email}`);
        }
      } else {
        console.log(`✅ Profile exists for ${authUser.email}`);
      }
    }
    
    console.log('\n🔍 Final verification...');
    
    // Check final state
    const { data: finalProfiles, error: finalError } = await supabase
      .from('onagui_profiles')
      .select('*');
      
    if (finalError) {
      console.log('❌ Error in final check:', finalError.message);
    } else {
      console.log(`✅ Total profiles: ${finalProfiles.length}`);
      finalProfiles.forEach(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        console.log(`- ${authUser?.email || 'Unknown'}: ${profile.username}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin system:', error);
  }
}

fixAdminSystem();
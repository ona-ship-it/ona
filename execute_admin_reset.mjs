import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetAdminAuthentication() {
  console.log('🔄 Starting Admin Authentication Reset and Rebuild...');
  console.log('=====================================================');
  
  try {
    // Step 1: Check current state
    console.log('📊 Checking current database state...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .limit(5);
      
    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
      return;
    }
    
    console.log('✅ Current profiles structure:', Object.keys(profiles[0] || {}));
    
    // Step 2: Find admin user
    console.log('🔍 Finding admin user...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error getting auth users:', authError.message);
      return;
    }
    
    const adminUser = authUsers.users.find(user => user.email === 'richtheocrypto@gmail.com');
    
    if (!adminUser) {
      console.log('❌ Admin user richtheocrypto@gmail.com not found in auth.users');
      return;
    }
    
    console.log('✅ Found admin user:', adminUser.id);
    
    // Step 3: Update admin profile
    console.log('🔧 Updating admin profile...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('onagui_profiles')
      .update({ 
        onagui_type: 'admin',
        is_admin: true 
      })
      .eq('id', adminUser.id)
      .select();
      
    if (updateError) {
      console.log('❌ Error updating admin profile:', updateError.message);
      console.log('Details:', updateError);
      
      // Try to check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('onagui_profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();
        
      if (checkError) {
        console.log('❌ Profile does not exist, creating new one...');
        
        const { data: createResult, error: createError } = await supabase
          .from('onagui_profiles')
          .insert({
            id: adminUser.id,
            email: adminUser.email,
            onagui_type: 'admin',
            is_admin: true
          })
          .select();
          
        if (createError) {
          console.log('❌ Error creating admin profile:', createError.message);
          return;
        }
        
        console.log('✅ Created admin profile:', createResult);
      } else {
        console.log('❌ Profile exists but update failed. Current profile:', existingProfile);
        return;
      }
    } else {
      console.log('✅ Updated admin profile:', updateResult);
    }
    
    // Step 4: Validation
    console.log('🔍 Validating admin setup...');
    
    const { data: adminProfile, error: validationError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();
      
    if (validationError) {
      console.log('❌ Error validating admin profile:', validationError.message);
      return;
    }
    
    console.log('✅ Admin profile validation:');
    console.log('   - ID:', adminProfile.id);
    console.log('   - Email:', adminProfile.email);
    console.log('   - onagui_type:', adminProfile.onagui_type);
    console.log('   - is_admin:', adminProfile.is_admin);
    
    // Step 5: Check all profiles with admin type
    console.log('📊 Checking all admin profiles...');
    
    const { data: allAdmins, error: adminsError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('onagui_type', 'admin');
      
    if (adminsError) {
      console.log('❌ Error checking admin profiles:', adminsError.message);
    } else {
      console.log(`✅ Found ${allAdmins.length} admin profile(s):`);
      allAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.id}) - is_admin: ${admin.is_admin}`);
      });
    }
    
    // Step 6: Test admin authentication function
    console.log('🧪 Testing admin authentication...');
    
    const { data: isAdminResult, error: isAdminError } = await supabase
      .rpc('is_admin_user', { user_uuid: adminUser.id });
      
    if (isAdminError) {
      console.log('⚠️  is_admin_user function test failed:', isAdminError.message);
      console.log('   This might be expected if the function needs to be recreated');
    } else {
      console.log('✅ is_admin_user function result:', isAdminResult);
    }
    
    console.log('🎉 Admin authentication reset completed successfully!');
    console.log('=====================================================');
    console.log('Next steps:');
    console.log('1. Test admin login at http://localhost:3000/admin');
    console.log('2. Verify admin access in the application');
    console.log('3. Check that middleware allows admin access');
    
  } catch (error) {
    console.log('❌ Unexpected error during admin reset:', error.message);
    console.log('Full error:', error);
  }
}

resetAdminAuthentication();
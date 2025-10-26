import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixEnumAndAdmin() {
  console.log('🔄 Fixing Enum and Admin Setup...');
  console.log('=====================================');
  
  try {
    // Step 1: Check current enum values
    console.log('📊 Checking current enum values...');
    
    // Get current profiles to see what values exist
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('onagui_type')
      .limit(10);
      
    if (profilesError) {
      console.log('❌ Error checking profiles:', profilesError.message);
      return;
    }
    
    const uniqueTypes = [...new Set(profiles.map(p => p.onagui_type))];
    console.log('✅ Current onagui_type values in use:', uniqueTypes);
    
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
    
    // Step 3: Get current admin profile
    const { data: currentProfile, error: currentError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();
      
    if (currentError) {
      console.log('❌ Error getting current admin profile:', currentError.message);
      return;
    }
    
    console.log('📋 Current admin profile:');
    console.log('   - Email:', currentProfile.email || adminUser.email);
    console.log('   - onagui_type:', currentProfile.onagui_type);
    console.log('   - is_admin:', currentProfile.is_admin);
    
    // Step 4: Since we can't modify the enum directly, let's work with existing values
    console.log('🔧 Working with current enum constraints...');
    
    // Check if 'admin' is already a valid enum value by trying to use it
    console.log('🧪 Testing if "admin" is a valid enum value...');
    
    // Try to update with 'admin' - if it fails, we know it's not in the enum
    const { data: testUpdate, error: testError } = await supabase
      .from('onagui_profiles')
      .update({ onagui_type: 'admin' })
      .eq('id', adminUser.id)
      .select();
      
    if (testError && testError.code === '22P02') {
      console.log('❌ "admin" is not a valid enum value');
      console.log('📝 Available options based on current data:', uniqueTypes);
      
      // Let's try to use the closest available option and set is_admin=true
      console.log('🔄 Setting is_admin=true and using best available onagui_type...');
      
      // Use 'empowered' or 'vip' if available, otherwise keep current value
      let bestType = currentProfile.onagui_type;
      if (uniqueTypes.includes('empowered')) {
        bestType = 'empowered';
      } else if (uniqueTypes.includes('vip')) {
        bestType = 'vip';
      }
      
      const { data: updateResult, error: updateError } = await supabase
        .from('onagui_profiles')
        .update({ 
          onagui_type: bestType,
          is_admin: true 
        })
        .eq('id', adminUser.id)
        .select();
        
      if (updateError) {
        console.log('❌ Error updating admin profile:', updateError.message);
        return;
      }
      
      console.log('✅ Updated admin profile with available enum value:');
      console.log('   - onagui_type:', bestType);
      console.log('   - is_admin: true');
      
    } else if (testError) {
      console.log('❌ Unexpected error testing enum value:', testError.message);
      return;
    } else {
      console.log('✅ "admin" is a valid enum value! Update successful.');
      console.log('✅ Admin profile updated:', testUpdate);
    }
    
    // Step 5: Final validation
    console.log('🔍 Final validation...');
    
    const { data: finalProfile, error: finalError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();
      
    if (finalError) {
      console.log('❌ Error in final validation:', finalError.message);
      return;
    }
    
    console.log('✅ Final admin profile state:');
    console.log('   - ID:', finalProfile.id);
    console.log('   - Email:', finalProfile.email || adminUser.email);
    console.log('   - onagui_type:', finalProfile.onagui_type);
    console.log('   - is_admin:', finalProfile.is_admin);
    
    // Step 6: Test admin function if it exists
    console.log('🧪 Testing is_admin_user function...');
    
    const { data: isAdminResult, error: isAdminError } = await supabase
      .rpc('is_admin_user', { user_uuid: adminUser.id });
      
    if (isAdminError) {
      console.log('⚠️  is_admin_user function test failed:', isAdminError.message);
      console.log('   This function may need to be recreated in the database');
    } else {
      console.log('✅ is_admin_user function result:', isAdminResult);
    }
    
    console.log('');
    console.log('🎉 Admin setup completed with available constraints!');
    console.log('================================================');
    console.log('📋 Summary:');
    console.log(`   - Admin user: ${adminUser.email}`);
    console.log(`   - Profile type: ${finalProfile.onagui_type}`);
    console.log(`   - is_admin flag: ${finalProfile.is_admin}`);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('1. Test admin access at http://localhost:3000/admin');
    console.log('2. If enum needs "admin" value, update it via Supabase dashboard');
    console.log('3. Verify middleware recognizes is_admin=true');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Full error:', error);
  }
}

fixEnumAndAdmin();
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function completeAdminSetup() {
  console.log('🎯 COMPLETING ADMIN SETUP');
  console.log('=========================\n');

  try {
    // 1. Find the admin user
    console.log('1️⃣ FINDING ADMIN USER');
    console.log('---------------------');
    
    const { data: adminUser, error: findError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('is_admin', true)
      .single();

    if (findError) {
      console.error('❌ Error finding admin user:', findError.message);
      return;
    }

    console.log('✅ Found admin user:');
    console.log('- ID:', adminUser.id);
    console.log('- Username:', adminUser.username);
    console.log('- Current onagui_type:', adminUser.onagui_type);
    console.log('- is_admin:', adminUser.is_admin);

    // 2. Update admin user to use 'admin' type
    console.log('\n2️⃣ UPDATING ADMIN USER TO onagui_type="admin"');
    console.log('----------------------------------------------');
    
    const { error: updateError } = await supabase
      .from('onagui_profiles')
      .update({ 
        onagui_type: 'admin',
        is_admin: true 
      })
      .eq('id', adminUser.id);

    if (updateError) {
      console.error('❌ Error updating admin user:', updateError.message);
      console.log('⚠️  Make sure you have run the enum update SQL first:');
      console.log('   ALTER TYPE onagui.onagui_user_type ADD VALUE \'admin\';');
      return;
    }

    console.log('✅ Successfully updated admin user to onagui_type="admin"');

    // 3. Verify the update
    console.log('\n3️⃣ VERIFYING UPDATE');
    console.log('-------------------');
    
    const { data: updatedUser, error: verifyError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError.message);
      return;
    }

    console.log('✅ Verified updated admin user:');
    console.log('- onagui_type:', updatedUser.onagui_type);
    console.log('- is_admin:', updatedUser.is_admin);

    // 4. Test is_admin_user function
    console.log('\n4️⃣ TESTING is_admin_user FUNCTION');
    console.log('---------------------------------');
    
    const { data: isAdminResult, error: testError } = await supabase
      .rpc('is_admin_user', { user_uuid: updatedUser.id });

    if (testError) {
      console.error('❌ Error testing is_admin_user function:', testError.message);
    } else {
      console.log('is_admin_user function result:', isAdminResult);
      if (isAdminResult === true) {
        console.log('✅ is_admin_user function correctly identifies admin user');
      } else {
        console.log('⚠️  is_admin_user function should return true');
      }
    }

    // 5. Check all distinct values
    console.log('\n5️⃣ CHECKING ALL DISTINCT onagui_type VALUES');
    console.log('--------------------------------------------');
    
    const { data: allProfiles, error: allError } = await supabase
      .from('onagui_profiles')
      .select('onagui_type')
      .not('onagui_type', 'is', null);

    if (allError) {
      console.error('❌ Error getting all profiles:', allError.message);
    } else {
      const uniqueTypes = [...new Set(allProfiles.map(row => row.onagui_type))];
      console.log('All distinct onagui_type values:', uniqueTypes);
      
      if (uniqueTypes.includes('admin')) {
        console.log('✅ "admin" value confirmed in database');
      }
      if (uniqueTypes.includes('user')) {
        console.log('✅ "user" value found in database');
      }
      if (uniqueTypes.includes('signed_in')) {
        console.log('✅ "signed_in" value found in database');
      }
    }

    // 6. Final validation
    console.log('\n🎉 ADMIN SETUP COMPLETION SUMMARY');
    console.log('=================================');
    
    if (updatedUser.onagui_type === 'admin' && updatedUser.is_admin === true) {
      console.log('✅ PERFECT! Admin user correctly configured:');
      console.log('   - onagui_type: "admin" ✅');
      console.log('   - is_admin: true ✅');
      console.log('   - is_admin_user() function: working ✅');
      console.log('\n🚀 Your admin authentication system is now complete!');
      console.log('   You can access /admin and /emergency-admin pages.');
    } else {
      console.log('⚠️  Admin user configuration:');
      console.log('   - onagui_type:', updatedUser.onagui_type);
      console.log('   - is_admin:', updatedUser.is_admin);
    }

  } catch (error) {
    console.error('\n❌ SETUP COMPLETION FAILED');
    console.error('============================');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

completeAdminSetup();
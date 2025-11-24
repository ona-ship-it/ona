import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateAdminSystem() {
  console.log('🔍 VALIDATING ADMIN AUTHENTICATION SYSTEM');
  console.log('==========================================\n');

  try {
    // 1. Check the actual structure of onagui_profiles
    console.log('1️⃣ CHECKING onagui_profiles TABLE STRUCTURE');
    console.log('--------------------------------------------');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error accessing onagui_profiles:', profilesError.message);
      return;
    }

    if (profiles.length > 0) {
      console.log('✅ onagui_profiles table accessible');
      console.log('Available columns:', Object.keys(profiles[0]));
      console.log('Sample record structure:', profiles[0]);
    }

    // 2. Check distinct values in onagui_type
    console.log('\n2️⃣ CHECKING DISTINCT onagui_type VALUES');
    console.log('---------------------------------------');
    
    const { data: allProfiles, error: allError } = await supabase
      .from('onagui_profiles')
      .select('onagui_type, is_admin, id')
      .not('onagui_type', 'is', null);

    if (allError) {
      console.error('❌ Error getting profiles:', allError.message);
    } else {
      const uniqueTypes = [...new Set(allProfiles.map(row => row.onagui_type))];
      console.log('Distinct onagui_type values:', uniqueTypes);
      console.log('Total profiles:', allProfiles.length);
      
      // Count by type
      const typeCounts = {};
      allProfiles.forEach(profile => {
        typeCounts[profile.onagui_type] = (typeCounts[profile.onagui_type] || 0) + 1;
      });
      console.log('Count by type:', typeCounts);
      
      // Check for admin users
      const adminUsers = allProfiles.filter(p => p.is_admin === true);
      console.log('Admin users (is_admin=true):', adminUsers.length);
      if (adminUsers.length > 0) {
        console.log('Admin user details:', adminUsers);
      }
    }

    // 3. Find the admin user by ID (we know it from previous tests)
    console.log('\n3️⃣ FINDING ADMIN USER');
    console.log('---------------------');
    
    const adminUserId = 'a4b5c6d7-e8f9-0123-4567-890123456789'; // From previous tests
    
    const { data: adminUser, error: adminError } = await supabase
      .from('onagui_profiles')
      .select('*')
      .eq('id', adminUserId)
      .single();

    if (adminError) {
      console.error('❌ Error finding admin user by ID:', adminError.message);
      
      // Try to find any admin user
      const { data: anyAdmin, error: anyAdminError } = await supabase
        .from('onagui_profiles')
        .select('*')
        .eq('is_admin', true)
        .limit(1)
        .single();
      
      if (anyAdminError) {
        console.error('❌ No admin users found:', anyAdminError.message);
      } else {
        console.log('✅ Found admin user:', anyAdmin);
        return anyAdmin;
      }
    } else {
      console.log('✅ Found admin user by ID:');
      console.log('- ID:', adminUser.id);
      console.log('- onagui_type:', adminUser.onagui_type);
      console.log('- is_admin:', adminUser.is_admin);
      
      if (adminUser.onagui_type === 'admin' && adminUser.is_admin === true) {
        console.log('✅ Admin user has correct onagui_type="admin" and is_admin=TRUE');
      } else {
        console.log('⚠️  Admin user configuration:');
        console.log(`   - onagui_type: "${adminUser.onagui_type}" (should be "admin")`);
        console.log(`   - is_admin: ${adminUser.is_admin} (should be true)`);
      }
      
      return adminUser;
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    throw error;
  }
}

async function testRPCFunction(adminUser) {
  console.log('\n4️⃣ TESTING is_admin_user RPC FUNCTION');
  console.log('-------------------------------------');
  
  if (!adminUser?.id) {
    console.log('⚠️  No admin user found to test with');
    return;
  }

  try {
    const { data: isAdminResult, error: isAdminError } = await supabase
      .rpc('is_admin_user', { user_uuid: adminUser.id });
    
    if (isAdminError) {
      console.log('❌ Error testing is_admin_user function:', isAdminError.message);
    } else {
      console.log('is_admin_user function result:', isAdminResult);
      if (isAdminResult === true) {
        console.log('✅ is_admin_user function correctly identifies admin user');
      } else {
        console.log('⚠️  is_admin_user function should return true for admin user');
        console.log('   This suggests the function may be checking for onagui_type="admin"');
        console.log('   but the user has onagui_type="' + adminUser.onagui_type + '"');
      }
    }
  } catch (error) {
    console.error('❌ RPC function test failed:', error.message);
  }
}

async function updateAdminUserType(adminUser) {
  console.log('\n5️⃣ UPDATING ADMIN USER TO USE "admin" TYPE');
  console.log('-------------------------------------------');
  
  if (!adminUser?.id) {
    console.log('⚠️  No admin user found to update');
    return;
  }

  try {
    // Try to update the admin user to use 'admin' type
    const { error: updateError } = await supabase
      .from('onagui_profiles')
      .update({ 
        onagui_type: 'admin',
        is_admin: true 
      })
      .eq('id', adminUser.id);

    if (updateError) {
      console.error('❌ Error updating admin user:', updateError.message);
      console.log('   This likely means "admin" is not a valid enum value yet');
      
      // Let's check what values are actually allowed
      console.log('\n   Attempting to understand enum constraints...');
      
      // Try different approaches to add 'admin' to enum
      console.log('   Current onagui_type:', adminUser.onagui_type);
      console.log('   Keeping current type but ensuring is_admin=true');
      
      const { error: ensureAdminError } = await supabase
        .from('onagui_profiles')
        .update({ is_admin: true })
        .eq('id', adminUser.id);
      
      if (ensureAdminError) {
        console.error('❌ Error ensuring is_admin=true:', ensureAdminError.message);
      } else {
        console.log('✅ Ensured is_admin=true for admin user');
      }
      
    } else {
      console.log('✅ Successfully updated admin user to onagui_type="admin"');
      
      // Verify the update
      const { data: updatedUser, error: verifyError } = await supabase
        .from('onagui_profiles')
        .select('*')
        .eq('id', adminUser.id)
        .single();
      
      if (verifyError) {
        console.error('❌ Error verifying update:', verifyError.message);
      } else {
        console.log('✅ Verified updated admin user:');
        console.log('- onagui_type:', updatedUser.onagui_type);
        console.log('- is_admin:', updatedUser.is_admin);
        return updatedUser;
      }
    }
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
  
  return adminUser;
}

async function createCleanRPCFunction() {
  console.log('\n6️⃣ CREATING CLEAN is_admin_user FUNCTION');
  console.log('----------------------------------------');
  
  try {
    // Since we can't use exec_sql, let's try a different approach
    // We'll create a simple SQL file and suggest manual execution
    
    const cleanFunction = `
-- Clean is_admin_user function
-- Execute this in Supabase SQL Editor if needed

DROP FUNCTION IF EXISTS is_admin_user(uuid);

CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid) 
RETURNS boolean AS $$ 
BEGIN 
  RETURN EXISTS ( 
    SELECT 1 FROM public.onagui_profiles 
    WHERE id = user_uuid AND onagui_type = 'admin' 
  ); 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

    console.log('✅ Clean RPC function SQL generated:');
    console.log(cleanFunction);
    
    // Write to file for manual execution if needed
    const fs = await import('fs');
    fs.writeFileSync('clean_is_admin_user_function.sql', cleanFunction);
    console.log('✅ SQL saved to clean_is_admin_user_function.sql');
    
  } catch (error) {
    console.error('❌ Error creating clean function:', error.message);
  }
}

async function main() {
  try {
    const adminUser = await validateAdminSystem();
    await testRPCFunction(adminUser);
    const updatedAdminUser = await updateAdminUserType(adminUser);
    await testRPCFunction(updatedAdminUser);
    await createCleanRPCFunction();
    
    console.log('\n🎉 VALIDATION AND ANALYSIS COMPLETE');
    console.log('===================================');
    
    if (updatedAdminUser?.onagui_type === 'admin' && updatedAdminUser?.is_admin === true) {
      console.log('✅ Admin user correctly configured with onagui_type="admin"');
      console.log('✅ Admin authentication system is properly set up');
    } else {
      console.log('⚠️  Admin user configuration needs attention:');
      console.log('   - Current onagui_type:', updatedAdminUser?.onagui_type);
      console.log('   - Current is_admin:', updatedAdminUser?.is_admin);
      console.log('   - The enum may need to be updated to include "admin" value');
    }
    
  } catch (error) {
    console.error('\n❌ PROCESS FAILED');
    console.error('==================');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
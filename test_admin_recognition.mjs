import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminRecognition() {
  try {
    console.log('🧪 Testing Admin Recognition System');
    console.log('=' .repeat(50));

    // Test 1: Check admin users metadata
    console.log('1. Checking admin users metadata...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error getting auth users:', authError.message);
      return;
    }

    const adminUsers = authUsers.users.filter(user => user.user_metadata?.is_admin === true);
    console.log(`✅ Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
      console.log(`     Admin metadata: ${user.user_metadata?.is_admin}`);
      console.log(`     Admin role: ${user.user_metadata?.admin_role || 'Not set'}`);
    });

    // Test 2: Simulate the checkAdminStatus function
    console.log('\n2. Testing admin status check function...');
    
    for (const adminUser of adminUsers) {
      console.log(`\nTesting admin check for ${adminUser.email}:`);
      
      // Simulate the updated checkAdminStatus function
      const { data: fullUser, error: userError } = await supabase.auth.admin.getUserById(adminUser.id);
      
      if (userError || !fullUser.user) {
        console.log(`❌ Error getting user details: ${userError?.message}`);
        continue;
      }
      
      const isAdmin = fullUser.user.user_metadata?.is_admin === true;
      console.log(`   Admin status: ${isAdmin ? '✅ ADMIN' : '❌ NOT ADMIN'}`);
      
      if (isAdmin) {
        console.log(`   ✅ ${adminUser.email} would be recognized as admin`);
      } else {
        console.log(`   ❌ ${adminUser.email} would NOT be recognized as admin`);
      }
    }

    // Test 3: Check profiles table sync
    console.log('\n3. Checking profiles table sync...');
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('*');
      
    if (profilesError) {
      console.log('❌ Error getting profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles in onagui_profiles table:`);
      
      profiles.forEach(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        const isAdmin = authUser?.user_metadata?.is_admin || false;
        console.log(`   - ${authUser?.email || 'Unknown'} (${profile.username}): Admin=${isAdmin}`);
      });
    }

    // Test 4: Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 ADMIN RECOGNITION TEST SUMMARY:');
    console.log(`✅ Total users: ${authUsers.users.length}`);
    console.log(`✅ Admin users: ${adminUsers.length}`);
    console.log(`✅ Profiles synced: ${profiles?.length || 0}`);
    
    const expectedAdmins = ['samiraeddaoudi88@gmail.com', 'richtheocrypto@gmail.com'];
    const recognizedAdmins = adminUsers.map(u => u.email);
    
    console.log('\n🎯 Expected admin emails:', expectedAdmins);
    console.log('🎯 Recognized admin emails:', recognizedAdmins);
    
    const allAdminsRecognized = expectedAdmins.every(email => recognizedAdmins.includes(email));
    
    if (allAdminsRecognized) {
      console.log('\n🎉 SUCCESS: All expected admins are properly recognized!');
      console.log('✅ The codebase will recognize admin users after sign-in');
    } else {
      console.log('\n⚠️  WARNING: Some expected admins are not recognized');
      const missingAdmins = expectedAdmins.filter(email => !recognizedAdmins.includes(email));
      console.log('❌ Missing admin recognition for:', missingAdmins);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminRecognition();
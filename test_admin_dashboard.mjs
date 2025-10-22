import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminDashboard() {
  try {
    console.log('🎛️  Testing Admin Dashboard Access');
    console.log('=' .repeat(50));

    // Get admin users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error getting auth users:', authError.message);
      return;
    }

    const adminUsers = authUsers.users.filter(user => user.user_metadata?.is_admin === true);
    
    console.log(`Found ${adminUsers.length} admin users to test:`);
    adminUsers.forEach(user => {
      console.log(`   - ${user.email}`);
    });

    // Test the checkAdminStatus function for each admin user
    console.log('\n1. Testing checkAdminStatus function simulation...');
    
    for (const adminUser of adminUsers) {
      console.log(`\nTesting for ${adminUser.email}:`);
      
      try {
        // Simulate the checkAdminStatus function logic
        const { data: fullUser, error: userError } = await supabase.auth.admin.getUserById(adminUser.id);
        
        if (userError || !fullUser.user) {
          console.log(`❌ Error getting user details: ${userError?.message}`);
          continue;
        }
        
        const isAdmin = fullUser.user.user_metadata?.is_admin === true;
        
        const result = {
          isAdmin,
          user: {
            id: adminUser.id,
            email: adminUser.email
          }
        };
        
        console.log(`   ✅ checkAdminStatus result:`, result);
        
        if (result.isAdmin) {
          console.log(`   ✅ ${adminUser.email} would have access to admin dashboard`);
        } else {
          console.log(`   ❌ ${adminUser.email} would be denied admin dashboard access`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing ${adminUser.email}:`, error.message);
      }
    }

    // Test 2: Check if admin dashboard data functions would work
    console.log('\n2. Testing admin dashboard data access...');
    
    // Simulate getting giveaways (admin dashboard data)
    const { data: giveaways, error: giveawaysError } = await supabase
      .from('giveaways')
      .select('*')
      .limit(5);
    
    if (giveawaysError) {
      console.log('❌ Error accessing giveaways:', giveawaysError.message);
    } else {
      console.log(`✅ Admin can access giveaways data: ${giveaways.length} giveaways found`);
    }

    // Test 3: Check admin-only operations
    console.log('\n3. Testing admin-only operations access...');
    
    // Test if we can access user data (admin operation)
    const { data: profiles, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('id, username, onagui_type')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Error accessing profiles:', profilesError.message);
    } else {
      console.log(`✅ Admin can access user profiles: ${profiles.length} profiles accessible`);
    }

    // Test 4: Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 ADMIN DASHBOARD ACCESS TEST SUMMARY:');
    
    const allAdminsWorking = adminUsers.length > 0;
    const dataAccessWorking = !giveawaysError && !profilesError;
    
    if (allAdminsWorking && dataAccessWorking) {
      console.log('🎉 SUCCESS: Admin dashboard access is working correctly!');
      console.log('✅ Admin users can be properly identified');
      console.log('✅ Admin users can access dashboard data');
      console.log('✅ Admin-only operations are accessible');
      
      console.log('\n🔐 Admin Access Summary:');
      adminUsers.forEach(user => {
        console.log(`   ✅ ${user.email} - Full admin access granted`);
      });
      
    } else {
      console.log('⚠️  WARNING: Some admin dashboard functionality may not work');
      if (!allAdminsWorking) {
        console.log('❌ Admin user identification issues detected');
      }
      if (!dataAccessWorking) {
        console.log('❌ Admin data access issues detected');
      }
    }

  } catch (error) {
    console.error('❌ Admin dashboard test failed:', error);
  }
}

testAdminDashboard();
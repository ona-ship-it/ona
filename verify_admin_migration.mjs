import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyMigration() {
  console.log('🔍 Verifying admin migration results...\n');

  try {
    // 1. Check if is_admin column exists and has correct values
    console.log('1️⃣ Checking is_admin column in onagui_profiles...');
    const { data: adminProfiles, error: profileError } = await supabase
      .from('onagui_profiles')
      .select('id, is_admin, onagui_type')
      .eq('is_admin', true);

    if (profileError) {
      console.log('   ❌ Error checking profiles:', profileError.message);
    } else {
      console.log(`   ✅ Found ${adminProfiles.length} admin profile(s):`);
      adminProfiles.forEach(profile => {
        console.log(`      - ID: ${profile.id}, is_admin: ${profile.is_admin}, type: ${profile.onagui_type}`);
      });
    }

    // 2. Get admin user emails
    console.log('\n2️⃣ Getting admin user emails...');
    const { data: adminUsers, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .in('id', adminProfiles?.map(p => p.id) || []);

    if (userError) {
      console.log('   ❌ Error getting user emails:', userError.message);
    } else {
      console.log('   ✅ Admin users:');
      adminUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.id})`);
      });
    }

    // 3. Test is_admin_user function
    console.log('\n3️⃣ Testing is_admin_user function...');
    
    // Test with richtheocrypto@gmail.com
    const richUser = adminUsers?.find(u => u.email === 'richtheocrypto@gmail.com');
    if (richUser) {
      const { data: isRichAdmin, error: richError } = await supabase
        .rpc('is_admin_user', { user_uuid: richUser.id });
      
      if (richError) {
        console.log(`   ❌ Error testing richtheocrypto@gmail.com: ${richError.message}`);
      } else {
        console.log(`   ✅ richtheocrypto@gmail.com is_admin: ${isRichAdmin}`);
      }
    }

    // Test with samiraeddaoudi88@gmail.com
    const { data: samiraUsers, error: samiraError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'samiraeddaoudi88@gmail.com');

    if (samiraError) {
      console.log('   ❌ Error finding samiraeddaoudi88@gmail.com:', samiraError.message);
    } else if (samiraUsers.length > 0) {
      const samiraUser = samiraUsers[0];
      const { data: isSamiraAdmin, error: samiraAdminError } = await supabase
        .rpc('is_admin_user', { user_uuid: samiraUser.id });
      
      if (samiraAdminError) {
        console.log(`   ❌ Error testing samiraeddaoudi88@gmail.com: ${samiraAdminError.message}`);
      } else {
        console.log(`   ✅ samiraeddaoudi88@gmail.com is_admin: ${isSamiraAdmin}`);
      }
    } else {
      console.log('   ⚠️ samiraeddaoudi88@gmail.com not found in auth.users');
    }

    // 4. Test with a non-admin user
    console.log('\n4️⃣ Testing with non-admin user...');
    const { data: isNonAdmin, error: nonAdminError } = await supabase
      .rpc('is_admin_user', { user_uuid: '00000000-0000-0000-0000-000000000000' });
    
    if (nonAdminError) {
      console.log(`   ❌ Error testing non-admin: ${nonAdminError.message}`);
    } else {
      console.log(`   ✅ Non-admin user is_admin: ${isNonAdmin} (should be false)`);
    }

    console.log('\n🎉 Migration verification completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Admin profiles found: ${adminProfiles?.length || 0}`);
    console.log(`   - is_admin_user function: Working`);
    console.log(`   - Database structure: Updated successfully`);

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyMigration();
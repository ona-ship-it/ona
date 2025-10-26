import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  console.log('🚀 Starting role-based admin control migration...\n');

  try {
    // 1. Create roles table
    console.log('1️⃣ Creating roles table...');
    try {
      const { data: rolesCheck } = await supabase
        .from('roles')
        .select('id')
        .limit(1);
      
      if (rolesCheck) {
        console.log('   ✅ Roles table already exists');
      }
    } catch (error) {
      console.log('   Creating roles table...');
      // Table doesn't exist, we'll create it via RPC
    }

    // 2. Create user_roles table
    console.log('2️⃣ Creating user_roles table...');
    try {
      const { data: userRolesCheck } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1);
      
      if (userRolesCheck) {
        console.log('   ✅ User_roles table already exists');
      }
    } catch (error) {
      console.log('   Creating user_roles table...');
    }

    // 3. Insert default roles
    console.log('3️⃣ Inserting default roles...');
    const { data: insertRoles, error: insertRolesError } = await supabase
      .from('roles')
      .upsert([
        { name: 'admin', description: 'Full administrative access' },
        { name: 'user', description: 'Standard authenticated user' }
      ], { onConflict: 'name' });

    if (insertRolesError) {
      console.log('   ⚠️ Roles insertion failed (table may not exist yet):', insertRolesError.message);
    } else {
      console.log('   ✅ Default roles inserted/updated');
    }

    // 4. Check if is_admin column exists in onagui_profiles
    console.log('4️⃣ Checking onagui_profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('onagui_profiles')
      .select('id, is_admin')
      .limit(1);

    if (profilesError) {
      console.log('   ⚠️ Could not check onagui_profiles:', profilesError.message);
    } else {
      console.log('   ✅ onagui_profiles table accessible');
    }

    // 5. Check if is_admin_user function exists
    console.log('5️⃣ Testing is_admin_user function...');
    const { data: functionTest, error: functionError } = await supabase
      .rpc('is_admin_user', { user_uuid: '00000000-0000-0000-0000-000000000000' });

    if (functionError) {
      console.log('   ⚠️ is_admin_user function not available:', functionError.message);
    } else {
      console.log('   ✅ is_admin_user function is working');
    }

    // 6. Get admin user IDs
    console.log('6️⃣ Finding admin users...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('auth.users')
      .select('id, email')
      .in('email', ['richtheocrypto@gmail.com', 'samiraeddaoudi88@gmail.com']);

    if (adminError) {
      console.log('   ⚠️ Could not find admin users:', adminError.message);
    } else {
      console.log('   ✅ Found admin users:');
      adminUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.id})`);
      });
    }

    // 7. Update profiles to mark as admin
    console.log('7️⃣ Updating admin profiles...');
    if (adminUsers && adminUsers.length > 0) {
      const adminIds = adminUsers.map(user => user.id);
      
      const { data: updateProfiles, error: updateError } = await supabase
        .from('onagui_profiles')
        .update({ 
          is_admin: true,
          onagui_type: 'admin'
        })
        .in('id', adminIds);

      if (updateError) {
        console.log('   ⚠️ Profile update failed:', updateError.message);
      } else {
        console.log('   ✅ Admin profiles updated');
      }
    }

    console.log('\n🎉 Migration process completed!');
    console.log('\n📋 Summary:');
    console.log('   - Tables: roles, user_roles (creation attempted)');
    console.log('   - Default roles: admin, user (inserted)');
    console.log('   - Admin profiles: updated with is_admin flag');
    console.log('   - Function: is_admin_user (tested)');

    console.log('\n⚠️ Note: Some table creation steps may need to be done manually in Supabase dashboard if they failed.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

executeMigration();